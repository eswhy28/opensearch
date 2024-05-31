from django.db import models
import os
import firebase_admin
from firebase_admin import credentials, storage, firestore
from django.core.files.storage import default_storage
from django.conf import settings
from django.core.files.base import ContentFile

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'cvanalyzer-5ffc2.appspot.com'
    })



# Utility function to save data to Firestore
db = firestore.client()


def upload_to_firebase(file, filename):
    # Ensure the file is at the beginning
    file.seek(0)

    # Get the bucket
    bucket = storage.bucket()

    # Create a blob
    blob = bucket.blob(filename)

    # Upload the file
    blob.upload_from_file(file)

    # Make the blob publicly accessible
    blob.make_public()

    # Return the public URL
    return blob.public_url


def save_to_firestore(collection_name, document_id, data):
    db = firestore.client()
    doc_ref = db.collection(collection_name).document(document_id)
    doc_ref.set(data)

class User(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        super(User, self).save(*args, **kwargs)
        save_to_firestore('users', str(self.id), {
            'email': self.email,
            'name': self.name,
        })

class JobDescription(models.Model):
    job_id = models.AutoField(primary_key=True)
    job_name = models.CharField(max_length=255)
    date_open = models.DateField()
    date_close = models.DateField()
    description = models.TextField()

    def __str__(self):
        return self.job_name

    def save(self, *args, **kwargs):
        super(JobDescription, self).save(*args, **kwargs)
        save_to_firestore('job_descriptions', str(self.job_id), {
            'job_name': self.job_name,
            'date_open': self.date_open.format(),
            'date_close': self.date_close.format(),
            'description': self.description,
        })


class CV(models.Model):
    cv_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='cvs/')
    structured_cv = models.JSONField(null=True, blank=True)
    firebase_url = models.URLField(null=True, blank=True)
    firestore_id = models.CharField(max_length=255, null=True, blank=True)  # Firestore document ID

    def __str__(self):
        return f"CV of {self.user.name}"

    def save(self, *args, **kwargs):
        super(CV, self).save(*args, **kwargs)
        if self.file:
            file_name = os.path.basename(self.file.name)
            file_path = default_storage.save(f'cvs/{file_name}', ContentFile(self.file.read()))
            self.firebase_url = default_storage.url(file_path)

        firestore_data = {
            'user_id': self.user.id,
            'firebase_url': self.firebase_url,
            'structured_cv': self.structured_cv,
        }
        firestore_id = save_to_firestore('cvs', str(self.cv_id), firestore_data)
        self.firestore_id = firestore_id
        super(CV, self).save(*args, **kwargs)
class AnalysisResult(models.Model):
    analysis_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cv = models.ForeignKey(CV, on_delete=models.CASCADE)
    job = models.ForeignKey(JobDescription, on_delete=models.CASCADE)
    score = models.IntegerField()
    features = models.JSONField()

    def __str__(self):
        return f"Analysis for {self.cv.user.name} - {self.job.job_name}"

    def save(self, *args, **kwargs):
        super(AnalysisResult, self).save(*args, **kwargs)
        save_to_firestore('analysis_results', str(self.analysis_id), {
            'user_id': self.user.id,
            'cv_id': self.cv.cv_id,
            'job_id': self.job.job_id,
            'score': self.score,
            'features': self.features,
        })

class JobApplied(models.Model):
    application_id = models.AutoField(primary_key=True)
    job = models.ForeignKey(JobDescription, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date_applied = models.DateField(auto_now_add=True)
    cv = models.ForeignKey(CV, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.name} applied for {self.job.job_name}"

    def save(self, *args, **kwargs):
        super(JobApplied, self).save(*args, **kwargs)
        save_to_firestore('job_applied', str(self.application_id), {
            'job_id': self.job.job_id,
            'user_id': self.user.id,
            'date_applied': self.date_applied.isoformat(),
            #'cv_id': self.cv.id,
        })
