from django.contrib import admin
from . import models

# Register your models here

class ScreeningAttachmentAdmin(admin.ModelAdmin):
    list_display = ('individual_screening', 'file', 'uploaded_at')

class IndividualScreeningAdmin(admin.ModelAdmin):
    list_display = ('patient__patient_id', 'patient__first_name', 'patient__last_name', 'patient__suffix', 
                    'patient__date_of_birth', 'patient__sex', 'patient__address',)
    
# class PreCancerousMedsRequestAdmin(admin.ModelAdmin):
#     list_display = ('id', 'patient')

# admin.site.register(models.PreCancerousMedsRequest, PreCancerousMedsRequestAdmin)

admin.site.register(models.IndividualScreening, IndividualScreeningAdmin)
admin.site.register(models.ScreeningAttachment, ScreeningAttachmentAdmin)
admin.site.register(models.MassScreeningRequest)