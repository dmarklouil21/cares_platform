from django.contrib import admin
from . import models

# Register your models here.
class ScreeningProcedureAdmin(admin.ModelAdmin):
    list_display = ('beneficiary', 'screening_procedure_name', 'procedure_details', 'cancer_site', 'created_at')

class PreScreeningFormAdmin(admin.ModelAdmin):
    list_display = ('beneficiary', 'referred_from', 'referring_doctor_or_facility', 'reason_for_referral', 'chief_complaint', 'date_of_consultation', 'date_of_diagnosis')

class IndividualScreeningAdmin(admin.ModelAdmin):
    list_display = ('patient__patient_id', 'patient__beneficiary__first_name', 'patient__beneficiary__last_name', 'patient__beneficiary__suffix', 
                    'patient__beneficiary__date_of_birth', 'patient__beneficiary__age', 'patient__beneficiary__sex', 'patient__beneficiary__address',)

admin.site.register(models.IndividualScreening, IndividualScreeningAdmin)
admin.site.register(models.ScreeningProcedure, ScreeningProcedureAdmin)
admin.site.register(models.PreScreeningForm, PreScreeningFormAdmin)