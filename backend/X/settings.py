import os
from pathlib import Path
from dotenv import load_dotenv
# import dj_database_url

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Core Settings ---

# SECURITY WARNING: keep the secret key used in production secret!
# Get SECRET_KEY from environment variable. Provide a default for local development.
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-@pqg#nf+l=6lp)x5(+d8-(u$ud^1mujk5^(+@5lv3t)azj+jw*')

# SECURITY WARNING: don't run with debug turned on in production!
# Get DEBUG from environment variable. Convert to boolean.
DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() in ('true', '1', 't')

# ALLOWED_HOSTS needs to be a list of strings.
# Get ALLOWED_HOSTS from environment variable, split by comma, and strip whitespace.
# Provide a default for local development.
ALLOWED_HOSTS_STR = os.getenv('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost,')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR.split(',') if host.strip()]

# Application definition
INSTALLED_APPS = [
    'jazzmin',
    'corsheaders',  # <-- Add this line at the top
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'courses', 
    'Account',
    'Category',
    'Certificate',
    'Enrollment',
    'FAQ',
    'Lesson',
    'Question',
    'Quiz',
    'Review',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # <-- Add this line at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# IMPORTANT: Replace 'X' with your actual Django project's main module name (e.g., 'myproject')
# Get ROOT_URLCONF from environment variable, or use a default.
ROOT_URLCONF = os.getenv('DJANGO_ROOT_URLCONF', 'X.urls') # Example: 'myproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], # Ensure you have a 'templates' directory at project root
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

# IMPORTANT: Replace 'X' with your actual Django project's main module name (e.g., 'myproject')
# Get WSGI_APPLICATION from environment variable, or use a default.
WSGI_APPLICATION = os.getenv('DJANGO_WSGI_APPLICATION', 'X.wsgi.application') # Example: 'myproject.wsgi.application'

# --- Database Configuration ---
# Hardcoded to SQLite by default, but can be overridden by environment variables.
# For more complex DBs (PostgreSQL, MySQL), you'd parse more variables (NAME, USER, PASSWORD, HOST, PORT).
DATABASE_ENGINE = os.getenv('DJANGO_DB_ENGINE', 'django.db.backends.sqlite3')
DATABASE_NAME = os.getenv('DJANGO_DB_NAME', BASE_DIR / 'db.sqlite3')

DATABASES = {
    'default': {
        'ENGINE': DATABASE_ENGINE,
        'NAME': DATABASE_NAME,
    }
}


# DATABASES = {
#     'default': dj_database_url.parse(
#         "postgresql://sandesh:EreQwn1yHR3YG00BnNfkPqkhJc9zHZTC@dpg-d1gdml7fte5s738gvq6g-a/shplearner",
#         conn_max_age=600,  # helps with persistent connections
#         ssl_require=True   # ensure secure connection
#     )
# }
# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
# Get TIME_ZONE from environment variable.
TIME_ZONE = os.getenv('DJANGO_TIME_ZONE', 'UTC') # Consider 'Asia/Kolkata' if your primary users are in India for local time awareness
USE_I18N = True
USE_TZ = True # Django's recommended way to handle datetimes

# Static and media files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static'] # Django will look for static files here in development
STATIC_ROOT = BASE_DIR / 'staticfiles' # Directory where `python manage.py collectstatic` will gather all static files for deployment
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media' # Directory where user-uploaded media will be stored

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'Account.CustomUser' 

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

# --- Email Configuration ---
# Get email settings from environment variables.
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'your_email@example.com') # IMPORTANT: Change default
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'your_email_password') # IMPORTANT: Change default
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'your_email@example.com') # IMPORTANT: Change default

# --- Security Settings ---
# Get security settings from environment variables, relying on DEBUG for defaults.
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False').lower() in ('true', '1', 't') and not DEBUG
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() in ('true', '1', 't') and not DEBUG
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False').lower() in ('true', '1', 't') and not DEBUG
SECURE_BROWSER_XSS_FILTER = os.getenv('SECURE_BROWSER_XSS_FILTER', 'True').lower() in ('true', '1', 't')
SECURE_CONTENT_TYPE_NOSNIFF = os.getenv('SECURE_CONTENT_TYPE_NOSNIFF', 'True').lower() in ('true', '1', 't')

# CSRF_TRUSTED_ORIGINS should include all domains that serve your site.
# Get CSRF_TRUSTED_ORIGINS from environment variable, split by comma.
CSRF_TRUSTED_ORIGINS_STR = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://127.0.0.1,http://localhost,http://localhost:5173,http://127.0.0.1:5173')
CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in CSRF_TRUSTED_ORIGINS_STR.split(',') if origin.strip()]

# CORS settings for development (allow all origins)
# Get CORS_ALLOWED_ORIGINS from environment variable, split by comma.
CORS_ALLOWED_ORIGINS_STR = os.getenv('CORS_ALLOWED_ORIGINS', 'http://127.0.0.1,http://localhost,http://localhost:5173,http://127.0.0.1:5173,http://192.168.184.221:4173')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS_STR.split(',') if origin.strip()]
CORS_ALLOW_CREDENTIALS = os.getenv('CORS_ALLOW_CREDENTIALS', 'True').lower() in ('true', '1', 't')


# --- Jazzmin Settings ---
# Reference: https://django-jazzmin.readthedocs.io/
JAZZMIN_SETTINGS = {
    "site_title": "SHP-Learner Admin",
    "site_header": "SHP-Learner",
    "site_brand": "SHP-Learner",
    "site_logo": "/img/logo.png",
    "login_logo": "/img/loginlogo.png",
    "site_icon": "/img/logo.png",
    "welcome_sign": "Welcome to the SHP-Learner Administration Panel",
    "copyright": "SHP-Learner Platform © 2025",

    "show_sidebar": True,
    "navigation_expanded": True,
    "order_with_respect_to": ["courses", "auth"],

    "search_model": ["courses.Course", "Account.CustomUser"],

    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "View Live Site", "url": "https://shplearner.netlify.app/", "new_window": True},
        {"name": "Support & Docs", "url": "https://github.com/farridav/django-jazzmin/issues", "new_window": True},
    ],

    "usermenu_links": [
        {"name": "My Profile", "url": "admin:Account_customuser_change", "permissions": ["Account.change_customuser"]},
    ],

    "user_avatar": "/img/logo.png",

    "custom_links": {
        "courses": [
            {
                "name": "Course Analytics",
                "url": "course_analytics",
                "icon": "fas fa-chart-bar",
                "permissions": ["courses.view_course"],
            }
        ]
    },

    "icons": {
        "auth": "fas fa-users-cog",
        "auth.Group": "fas fa-users",
        "Account.CustomUser": "fas fa-user-graduate",
        "courses.Course": "fas fa-book-open",
        "Category.Category": "fas fa-layer-group",
        "Certificate.Certificate": "fas fa-certificate",
        "Enrollment.Enrollment": "fas fa-user-check",
        "FAQ.FAQ": "fas fa-question",
        "Lesson.Lesson": "fas fa-chalkboard-teacher",
        "Question.Question": "fas fa-question-circle",
        "Question.AnswerChoice": "fas fa-check-circle",
        "Quiz.Quiz": "fas fa-poll",
        "Quiz.UserQuizAttempt": "fas fa-user-clock",
        "Review.Review": "fas fa-star",
    },
    "default_icon_parents": "fas fa-folder-open",
    "default_icon_children": "fas fa-file-alt",

    "related_modal_active": True,
    "use_google_fonts_cdn": True,
    "show_ui_builder": os.getenv('JAZZMIN_SHOW_UI_BUILDER', 'False').lower() in ('true', '1', 't'),

    "changeform_format": "horizontal_tabs",
    "changeform_format_single": "single",
    "language_chooser": False,

    "themes": ["flatly", "cosmo", "litera", "lumen", "minty"],
    "default_theme": "flatly",
    "dark_mode_theme": "darkly",

    "button_classes": {
        "primary": "btn-outline-primary",
        "secondary": "btn-outline-secondary",
        "info": "btn-outline-info",
        "warning": "btn-outline-warning",
        "danger": "btn-outline-danger",
        "success": "btn-outline-success"
    }
}
