from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from .models import User, JobDescription, CV, AnalysisResult, JobApplied,upload_to_firebase
from .serializers import UserSerializer, JobDescriptionSerializer, CVSerializer, AnalysisResultSerializer, JobAppliedSerializer, JobDescriptionSerializer
from rest_framework.decorators import action
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.core.files.storage import default_storage
from django.views.generic import TemplateView
from django.shortcuts import get_object_or_404
import openai
import re
from django.db.models import Count
from django.conf import settings
from django.core.files.base import ContentFile
import firebase_admin
from firebase_admin import firestore
import PyPDF2
from firebase_admin import credentials, firestore, storage

if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'cvanalyzer-5ffc2.appspot.com'
    })

db = firestore.client()

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        users_ref = db.collection('users')
        docs = users_ref.stream()
        users = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            users.append(User(**data))
        return users

class AnalysisResultList(generics.ListAPIView):
    serializer_class = AnalysisResultSerializer

    def get_queryset(self):
        results_ref = db.collection('analysis_results')
        docs = results_ref.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            user_id = data.get('user_id')
            job_id = data.get('job_id')
            try:
                user = get_object_or_404(User, id=user_id)
                job = get_object_or_404(JobDescription, job_id=job_id)
                results.append(AnalysisResult(user=user, job=job, **data))
            except Exception as e:
                pass  # Handle the exception gracefully
        return results


@api_view(['GET'])
@renderer_classes([JSONRenderer])
def get_top_candidates(request, job_id):
    # Fetch all analysis results for the given job_id
    analysis_results = AnalysisResult.objects.filter(job_id=job_id)
    candidates = []
    for result in analysis_results:
        if result.score >= 80:
            user = result.user
            candidates.append({
                'name': user.name,
                'email': user.email,
                'score': result.score
            })
    return Response(candidates)
class JobApplicationCountView(APIView):

    def get(self, request, *args, **kwargs):
        job_applied_ref = db.collection('job_applied')
        docs = job_applied_ref.stream()
        job_counts = {}
        for doc in docs:
            data = doc.to_dict()
            job_id = data['job_id']
            job = JobDescription.objects.get(job_id=job_id)
            job_name = job.job_name
            if job_name in job_counts:
                job_counts[job_name] += 1
            else:
                job_counts[job_name] = 1
        sorted_job_counts = sorted(job_counts.items(), key=lambda x: x[1], reverse=True)
        job_counts_list = [{'job_name': name, 'count': count} for name, count in sorted_job_counts]
        return Response(job_counts_list)

class JobAppliedList(generics.ListAPIView):
    serializer_class = JobAppliedSerializer

    def get_queryset(self):
        user = self.request.user
        job_applied_ref = db.collection('job_applied')
        docs = job_applied_ref.where('user_id', '==', user.id).stream()
        applications = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            job = JobDescription.objects.get(job_id=data['job_id'])
            cv = CV.objects.get(id=data['cv_id'])
            applications.append(JobApplied(user=user, job=job, cv=cv, **data))
        return applications

class JobDescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = JobDescriptionSerializer

    def get_queryset(self):
        jobs_ref = db.collection('job_descriptions')
        docs = jobs_ref.stream()
        jobs = []
        for doc in docs:
            data = doc.to_dict()
            data['job_id'] = doc.id
            jobs.append(JobDescription(**data))
        return jobs

    @action(detail=False, methods=['post'])
    def create_job(self, request):
        data = request.data
        job_description = JobDescription(
            job_name=data['job_name'],
            date_open=data['date_open'],
            date_close=data['date_close'],
            description=data['description']
        )
        job_description.save()
        serializer = JobDescriptionSerializer(job_description)
        return Response(serializer.data)

    @action(detail=False, methods=['post', 'get'])
    def jobdescription(self, request):
        if request.method == 'POST':
            data = request.data
            job_description = JobDescription(
                job_name=data['job_name'],
                date_open=data['date_open'],
                date_close=data['date_close'],
                description=data['description']
            )
            job_description.save()
            serializer = JobDescriptionSerializer(job_description)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        elif request.method == 'GET':
            queryset = self.get_queryset()
            serializer = JobDescriptionSerializer(queryset, many=True)
            return Response(serializer.data)


def save_to_firestore(collection_name, document_id, data):
    doc_ref = db.collection(collection_name).document(document_id)
    doc_ref.set(data)

class CVViewSet(viewsets.ModelViewSet):
    serializer_class = CVSerializer

    def get_queryset(self):
        return CV.objects.all()

    @action(detail=False, methods=['post'])
    def analyze(self, request):
        job_name = request.data.get('job_description')
        files = request.FILES.getlist('files')
        job_description_ref = db.collection('job_descriptions').where('job_name', '==', job_name).stream()
        job_description = next(job_description_ref, None)

        if not job_description:
            return Response({'error': 'Job description not found'}, status=400)

        job_description_data = job_description.to_dict()
        job_description_instances = JobDescription.objects.filter(job_name=job_description_data['job_name'])

        if not job_description_instances.exists():
            return Response({'error': 'Job description not found in Django'}, status=400)

        job_description_instance = job_description_instances.first()

        results = []
        skipped_cvs = []
        processed_files = set()

        for file in files:
            if file.name in processed_files:
                continue  # Skip duplicate files
            processed_files.add(file.name)

            cv_content = extract_text_from_pdf(file)
            result = analyze_cv_with_openai(cv_content, job_description_data['description'])
            email = result.get('email', '').strip()
            name = result.get('name', '').strip()

            if not email or not name:
                skipped_cvs.append(file.name)
                continue

            temp_data = {}

            user, created = User.objects.get_or_create(email=email, defaults={'name': name})
            if not created and user.name != name:
                user.name = name
                user.save()

            temp_data['user'] = user

            CV.objects.filter(user=user).delete()

            unique_file_name = f"{user.email}_{file.name}"
            file_path = default_storage.save(f'cvs/{unique_file_name}', ContentFile(file.read()))
            cv_instance = CV(user=user, file=file_path, structured_cv=result['structured_cv'])
            cv_instance.save()

            structured_cv = result['structured_cv']
            structured_cv['experience'] = structured_cv.get('experience', '')
            structured_cv['education'] = structured_cv.get('education', '')
            structured_cv['skills'] = structured_cv.get('skills', '')
            structured_cv['projects'] = structured_cv.get('projects', '')
            structured_cv['achievements'] = structured_cv.get('achievements', '')
            structured_cv['other'] = structured_cv.get('other', '')

            cv_instance.structured_cv = structured_cv
            cv_instance.save()

            temp_data['cv'] = cv_instance

            if not JobApplied.objects.filter(user=user, job=job_description_instance).exists():
                JobApplied.objects.create(user=user, job=job_description_instance, cv=cv_instance)

                analysis_instance = AnalysisResult.objects.create(
                    user=user,
                    cv=cv_instance,
                    job=job_description_instance,
                    score=result['score'],
                    features=result['features']
                )

                temp_data['analysis'] = analysis_instance
                results.append(AnalysisResultSerializer(analysis_instance).data)
            else:
                skipped_cvs.append(file.name)

            save_data_to_firestore(temp_data)

        response_data = {
            'results': results,
            'skipped_cvs': skipped_cvs
        }

        if not results:
            return Response({'error': 'No valid CVs were processed'}, status=400)

        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def analyzed_cvs(self, request):
        user = request.user
        cvs_ref = db.collection('cvs').where('user_id', '==', user.id).stream()
        cvs = [CV(user=user, **doc.to_dict(), firestore_id=doc.id) for doc in cvs_ref]

        if not cvs:
            return Response([], status=status.HTTP_200_OK)

        cv_ids = [cv.cv_id for cv in cvs]
        analyses_ref = db.collection('analysis_results').where('cv_id', 'in', cv_ids).stream()
        analyses = [AnalysisResult(**doc.to_dict(), analysis_id=doc.id) for doc in analyses_ref]
        serialized_data = AnalysisResultSerializer(analyses, many=True).data
        return Response(serialized_data)

def extract_text_from_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page_num in range(len(pdf_reader.pages)):
        text += pdf_reader.pages[page_num].extract_text()
    return text

def analyze_cv_with_openai(cv_content, job_description):
    openai.api_key = settings.OPENAI_API_KEY
    prompt = generate_prompt(cv_content, job_description)

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )

    return parse_response(response.choices[0]['message']['content'])

def generate_prompt(cv_content, job_description):
    return (
        f"Given the following job description:\n"
        f"{job_description}\n\n"
        f"Evaluate the following CV based on its relevance and suitability for the job. "
        f"Consider factors such as experience, skills, education, and overall fit. "
        f"Extract the candidate's name and email from the CV. Provide a detailed analysis, "
        f"a score from 1 to 100, and highlight key features of the candidate:\n\n"
        f"{cv_content}\n\n"
        f"Please structure your response exactly as follows:\n"
        f"Name: [name]\n"
        f"Email: [email]\n"
        f"Score: [score]\n"
        f"Experience: [analysis of experience]\n"
        f"Skills: [analysis of skills]\n"
        f"Education: [analysis of education]\n"
        f"Overall Fit: [overall fit analysis]\n"
        f"\n"
        f"Structured CV:\n"
        f"Experience: [years of experience]\n"
        f"Education: [degrees, diplomas]\n"
        f"Skills: [key skills]\n"
        f"Projects: [summary of projects]\n"
        f"Achievements: [summary of achievements]\n"
        f"Other: [any other relevant information]\n"
    )

def parse_response(response_text):
    # Initialize the result dictionary with default values
    result = {
        'name': '',
        'email': '',
        'score': 0,
        'features': {
            'experience': '',
            'skills': '',
            'education': '',
            'overall_fit': ''
        },
        'structured_cv': {
            'experience': '',
            'education': '',
            'skills': '',
            'projects': '',
            'achievements': '',
            'other': ''
        }
    }

    patterns = {
        'name': re.compile(r'^Name:\s*(.*)', re.MULTILINE),
        'email': re.compile(r'^Email:\s*(.*)', re.MULTILINE),
        'score': re.compile(r'^Score:\s*(\d+)', re.MULTILINE),
        'features_experience': re.compile(r'^Experience:\s*(.*)', re.MULTILINE),
        'features_skills': re.compile(r'^Skills:\s*(.*)', re.MULTILINE),
        'features_education': re.compile(r'^Education:\s*(.*)', re.MULTILINE),
        'features_overall_fit': re.compile(r'^Overall Fit:\s*(.*)', re.MULTILINE),
        'structured_experience': re.compile(r'^Structured CV:\s*Experience:\s*(.*)', re.MULTILINE),
        'structured_education': re.compile(r'^Structured CV:\s*Education:\s*(.*)', re.MULTILINE),
        'structured_skills': re.compile(r'^Structured CV:\s*Skills:\s*(.*)', re.MULTILINE),
        'structured_projects': re.compile(r'^Structured CV:\s*Projects:\s*(.*)', re.MULTILINE),
        'structured_achievements': re.compile(r'^Structured CV:\s*Achievements:\s*(.*)', re.MULTILINE),
        'structured_other': re.compile(r'^Structured CV:\s*Other:\s*(.*)', re.MULTILINE)
    }

    for key, pattern in patterns.items():
        match = pattern.search(response_text)
        if match:
            if key == 'score':
                result[key] = int(match.group(1))
            elif key.startswith('features_'):
                result['features'][key.split('_')[1]] = match.group(1).strip()
            elif key.startswith('structured_'):
                result['structured_cv'][key.split('_')[1]] = match.group(1).strip()
            else:
                result[key] = match.group(1).strip()

    return result

def save_data_to_firestore(data):
    user = data['user']
    save_to_firestore('users', str(user.id), {
        'email': user.email,
        'name': user.name,
    })

    cv = data['cv']
    save_to_firestore('cvs', str(cv.cv_id), {
        'user_id': user.id,
        'firebase_url': cv.firebase_url,
        'structured_cv': cv.structured_cv,
    })

    analysis = data['analysis']
    save_to_firestore('analysis_results', str(analysis.analysis_id), {
        'user_id': user.id,
        'cv_id': cv.cv_id,
        'job_id': analysis.job.job_id,
        'score': analysis.score,
        'features': analysis.features,
    })

class IndexView(TemplateView):
    template_name = 'index.html'