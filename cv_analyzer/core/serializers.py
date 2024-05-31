from rest_framework import serializers
from .models import User, JobDescription, CV, AnalysisResult, JobApplied

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name']

class JobDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = '__all__'

class CVSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = '__all__'

class AnalysisResultSerializer(serializers.ModelSerializer):
    cv = CVSerializer()
    job = JobDescriptionSerializer()
    user = UserSerializer()

    class Meta:
        model = AnalysisResult
        fields = ['analysis_id', 'user', 'cv', 'job', 'score', 'features']

class JobAppliedSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplied
        fields = ['application_id', 'job', 'user', 'date_applied', 'cv']

class JobApplicationCountSerializer(serializers.Serializer):
    job_name = serializers.CharField(source='job__job_name')
    count = serializers.IntegerField()
