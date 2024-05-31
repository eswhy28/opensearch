from django import forms
from .models import User, JobDescription, CV, AnalysisResult, JobApplied

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['email', 'name']

class JobDescriptionForm(forms.ModelForm):
    class Meta:
        model = JobDescription
        fields = ['job_name', 'date_open', 'date_close', 'description']

class CVForm(forms.ModelForm):
    class Meta:
        model = CV
        fields = ['user', 'file', 'structured_cv']

class AnalysisResultForm(forms.ModelForm):
    class Meta:
        model = AnalysisResult
        fields = ['user', 'cv', 'job', 'score', 'features']

class JobAppliedForm(forms.ModelForm):
    class Meta:
        model = JobApplied
        fields = ['job', 'user', 'cv']
