from django.contrib import admin
from . import models

# Register your models here.
class PatientAdmin(admin.ModelAdmin):
    list_display = ('patient_id', 'beneficiary__first_name', 'beneficiary__last_name', 'beneficiary__suffix', 
                    'beneficiary__date_of_birth', 'beneficiary__age', 'beneficiary__sex', 'beneficiary__address',
                    'date_diagnosed', 'diagnosis', 'cancer_stage', 'cancer_site')

admin.site.register(models.Patient, PatientAdmin)