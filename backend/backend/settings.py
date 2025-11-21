"""
Django settings for backend project.
Optimized for Railway (Backend) + Vercel (Frontend)
"""

from pathlib import Path
from datetime import timedelta
import dj_database_url
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------------------------------------------------------
# SECURITY SETTINGS
# -----------------------------------------------------------------------------

# Railway provides SECRET_KEY in variables
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-dev-only')

# Set DEBUG to False in Railway variables
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# ALLOWED_HOSTS
# .railway.app allows any sub-domain provided by Railway
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.railway.app', 
    # If you add a custom domain to Railway later, add it here:
    'cares-platform-api.up.railway.app',
]

# -----------------------------------------------------------------------------
# CORS & CSRF (CRITICAL FOR VERCEL)
# -----------------------------------------------------------------------------

# Which frontends can talk to this API?
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", # Local Vite
    "http://localhost:3000", # Local React
    # ------------------------------------------------------------------
    # TODO: UPDATE THIS AFTER DEPLOYING FRONTEND TO VERCEL
    # It will look something like: https://cares-platform-tau.vercel.app
    # ------------------------------------------------------------------
    "https://cares-platform.vercel.app",
]

# Allow standard methods
CORS_ALLOW_METHODS = [
    "DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT",
]

# Allow credentials (cookies/headers)
CORS_ALLOW_CREDENTIALS = True

# Standard headers + any custom ones you need
from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-csrftoken',
]

# Trusted Origins for CSRF (POST requests)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "https://*.railway.app", # Trust the backend domain itself
    "https://cares-platform-api.up.railway.app",
    # ------------------------------------------------------------------
    # TODO: UPDATE THIS MATCHING CORS_ALLOWED_ORIGINS
    # ------------------------------------------------------------------
    "https://cares-platform.vercel.app", 
]

# -----------------------------------------------------------------------------
# APPLICATION DEFINITION
# -----------------------------------------------------------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'rest_framework',
    'corsheaders',
    'anymail', # Using Brevo via API
    
    # Your Apps
    'apps.beneficiary',
    'apps.patient',
    'apps.partners',
    'apps.user',
    'apps.pre_enrollment',
    'apps.registration',
    'apps.user_management',
    'apps.cancer_screening',
    'apps.cancer_management',
    'apps.precancerous',
    'apps.post_treatment',
    'apps.survivorship',
    'apps.rhu',
    'apps.psychosocial_support',
    'apps.notifications',
    
    'whitenoise.runserver_nostatic',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Top priority
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# For production (Railway), force HTTPS
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # Recommended for Railway behind proxy
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# -----------------------------------------------------------------------------
# DATABASE (PostgreSQL on Railway)
# -----------------------------------------------------------------------------

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# -----------------------------------------------------------------------------
# AUTH & JWT
# -----------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTH_USER_MODEL = 'user.User' 

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend']
}

SIMPLE_JWT = {
    "USER_ID_FIELD": "user_id",
    "USER_ID_CLAIM": "user_id",
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=2),
}

# -----------------------------------------------------------------------------
# INTERNATIONALIZATION & STATIC FILES
# -----------------------------------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Manila'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'mediafiles')

# -----------------------------------------------------------------------------
# EMAIL (BREVO API)
# -----------------------------------------------------------------------------

# Anymail with Brevo
EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"

ANYMAIL = {
    "BREVO_API_KEY": os.environ.get('BREVO_API_KEY'),
}

# The email address that sends the mail
DEFAULT_FROM_EMAIL = os.environ.get('EMAIL_HOST_USER', 'caresplatform@gmail.com')
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# Twilio SMS settings
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]