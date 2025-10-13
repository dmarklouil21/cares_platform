from django.contrib import admin

from .models import PatientHomeVisit, HormonalReplacement
# Register your models here.

admin.site.register(PatientHomeVisit)
admin.site.register(HormonalReplacement)