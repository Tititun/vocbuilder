from .base import *

DEBUG = False

ADMINS = [
    ('Danil', 'vinniopo@mail.ru'),
]

ALLOWED_HOSTS = ['*']

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "OPTIONS": {
            "read_default_file": BASE_DIR / "vocbuilder/my.cnf",
        },
    }
}

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 1

STATIC_ROOT = BASE_DIR / 'static'
