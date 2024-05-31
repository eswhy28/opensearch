# settings.py

import os
from pathlib import Path
from firebase_admin import credentials, firestore, initialize_app

BASE_DIR = Path(__file__).resolve().parent.parent

config = {
    "apiKey": "AIzaSyBPbyTCUl3eJBEsqK2X1pImeuhwu0AX9rg",
    "authDomain": "cvanalyzer-5ffc2.firebaseapp.com",
    "projectId": "cvanalyzer-5ffc2",
    "storageBucket": "cvanalyzer-5ffc2.appspot.com",
    "messagingSenderId": "1078241112976",
    "appId": "1:1078241112976:web:5cb9e764ab4e58e4583915",
}

# Initialize Firebase Admin
FIREBASE_CREDENTIALS = os.path.join(BASE_DIR, 'cvanalyzer-5ffc2-firebase-adminsdk-v58cw-2cff50779a.json')
cred = credentials.Certificate(FIREBASE_CREDENTIALS)
initialize_app(cred, {
    'storageBucket': config['storageBucket'],
    'projectId': config['projectId']
})
db = firestore.client()

# Quick-start development settings - unsuitable for production
SECRET_KEY = 'sno=#4^e(^-i#i%@ozvp&kmstcr&w0_tsz)#ib#a18f9nw-br_'
DEBUG = True
ALLOWED_HOSTS = ['*',]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cv_analyzer.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'cv_analyzer', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cv_analyzer.wsgi.application'
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://0.0.0.0:8000",
    "http://192.168.5.122:8000",
    "http://35.187.69.136:8000",
    "http://10.132.0.2:8000"
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'cv_analyzer', 'static'),
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# OpenAI API Key
OPENAI_API_KEY = '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'
APPEND_SLASH = False

# Media settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
