from django.contrib import admin
from . import models

# Register your models here.
class PatientAdmin(admin.ModelAdmin):
  list_display = ('patient_id', 'beneficiary__first_name', 'beneficiary__last_name', 'beneficiary__suffix', 
                  'beneficiary__date_of_birth', 'beneficiary__age', 'beneficiary__sex', 'beneficiary__address',)

class CancerDiagnosisAdmin(admin.ModelAdmin):
    list_display = ('patient', 'diagnosis', 'date_diagnosed', 'cancer_site', 'cancer_stage')

admin.site.register(models.Patient, PatientAdmin)
admin.site.register(models.CancerDiagnosis, CancerDiagnosisAdmin)