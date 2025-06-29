from django.apps import AppConfig


class PreEnrollmentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.pre_enrollment'

    def ready(self):
        from . import signals