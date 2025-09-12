from django.contrib import admin
from . import models

# Register your models here.

class WellbeingQuestionAdmin(admin.ModelAdmin):
  list_display = ('id', 'text_en', 'text_ceb')

class WellbeingAnswerAdmin(admin.ModelAdmin):
  list_display = ('assessment', 'question', 'value')

class WellBeingAssessmentAdmin(admin.ModelAdmin):
  list_display = ('id', 'assessment_date', 'general_status', 'improve', 'created_at')

class ServiceAttachmentAdmin(admin.ModelAdmin):
  list_display = ('cancer_treatment', 'file', 'uploaded_at')

class CancerTreatmentAdmin(admin.ModelAdmin):
  list_display = ('patient__patient_id', 'patient__first_name', 'patient__last_name', 'patient__suffix', 
                'patient__date_of_birth', 'patient__sex', 'patient__address',)

admin.site.register(models.CancerTreatment, CancerTreatmentAdmin)
admin.site.register(models.ServiceAttachment, ServiceAttachmentAdmin)
admin.site.register(models.WellBeingQuestion, WellbeingQuestionAdmin)
admin.site.register(models.WellBeingAssessment, WellBeingAssessmentAdmin)
admin.site.register(models.WellBeingAnswer, WellbeingAnswerAdmin)