"""cv_analyzer URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from core.views import UserViewSet, JobDescriptionViewSet, CVViewSet, AnalysisResultList, JobAppliedList, JobApplicationCountView,get_top_candidates,IndexView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'job-descriptions', JobDescriptionViewSet, basename='description')
router.register(r'cvs', CVViewSet, basename='cv')
router.register(r'analysis_results', AnalysisResultList, basename='analysis_result')
router.register(r'job_applied', JobAppliedList, basename='job_applied')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', IndexView.as_view(), name='index'),
    path('', include('core.urls')),
    path('api/cvs/analyze', CVViewSet.as_view({'post': 'analyze'}), name='cv-analyze'),
    path('api/cvs/analyzed', CVViewSet.as_view({'get': 'analyzed_cvs'}), name='analyzed-cvs'),
    path('api/analysis-results/', AnalysisResultList.as_view(), name='analysis-result-list'),
    path('api/job-applications/', JobAppliedList.as_view(), name='job-applied-list'),
    path('api/job-application-count', JobApplicationCountView.as_view(), name='job-application-count'),
    path('api/cvs/job-descriptions/', JobDescriptionViewSet.as_view({'post': 'jobdescription'}), name='cv-jobdescription'),
    path('api/cvs/job-descriptions', JobDescriptionViewSet.as_view({'get': 'jobdescription'}), name='cv-jobdescriptions'),
    path('api/top-candidates/<int:job_id>/', get_top_candidates, name='get_top_candidates'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
