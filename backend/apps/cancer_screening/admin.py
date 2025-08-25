from django.contrib import admin
from . import models

# Register your models here.
class ScreeningProcedureAdmin(admin.ModelAdmin):
    list_display = ('individual_screening', 'screening_procedure_name', 'procedure_details', 'cancer_site', 'created_at')

class PreScreeningFormAdmin(admin.ModelAdmin):
    list_display = ('individual_screening', 'referred_from', 'referring_doctor_or_facility', 'reason_for_referral', 'chief_complaint', 'date_of_consultation', 'date_of_diagnosis')

class ScreeningAttachmentAdmin(admin.ModelAdmin):
    list_display = ('screening_procedure', 'file', 'uploaded_at')

class IndividualScreeningAdmin(admin.ModelAdmin):
    list_display = ('patient__patient_id', 'patient__first_name', 'patient__last_name', 'patient__suffix', 
                    'patient__date_of_birth', 'patient__sex', 'patient__address',)

admin.site.register(models.IndividualScreening, IndividualScreeningAdmin)
admin.site.register(models.ScreeningProcedure, ScreeningProcedureAdmin)
admin.site.register(models.ScreeningAttachment, ScreeningAttachmentAdmin)
admin.site.register(models.PreScreeningForm, PreScreeningFormAdmin)