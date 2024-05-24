from .base import *

DEBUG = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "OPTIONS": {
            "read_default_file": BASE_DIR / "vocbuilder/my_local.cnf",
        },
    }
}