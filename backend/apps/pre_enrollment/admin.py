from django.contrib import admin
from . import models

# Register your models here.

class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = ('beneficiary_id', 'last_name', 'first_name', 'suffix', 'date_of_birth', 'age', 'sex', 
                    'civil_status', 'number_of_children', 'status')

class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'mobile_number', 'email')

admin.site.register(models.Beneficiary, BeneficiaryAdmin)
# admin.site.register(models.Patient, PatientAdmin)
admin.site.register(models.EmergencyContact, EmergencyContactAdmin)