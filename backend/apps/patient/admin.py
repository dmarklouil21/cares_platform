from django.contrib import admin
from . import models

# Register your models here.
class PatientAdmin(admin.ModelAdmin):
  # list_display = ('patient_id', 'first_name', 'last_name', 'suffix', 
  #                 'date_of_birth', 'age', 'sex', 'address',)
  fieldsets = (
    ("Basic Information", {
      "fields": (
        "user",
        "first_name",
        "middle_name",
        "last_name",
        "suffix",
        "date_of_birth",
        "sex",
        "civil_status",
        "number_of_children",
        "status",
        "photo_url",
      )
    }),
    ("Contact & Address Information", {
      "fields": (
        "address",
        "city",
        "barangay",
        "mobile_number",
        "email",
      )
    }),
    ("Additional Information", {
      "fields": (
        "source_of_information",
        "other_rafi_programs_availed",
      ),
      "classes": ("collapse",),  # collapsible section
    }),
    ("Socio-Economic Information", {
      "fields": (
        "highest_educational_attainment",
        "occupation",
        "source_of_income",
        "monthly_income",
      ),
      "classes": ("collapse",),  # collapsible section
    }),
    ("System Metadata", {
      "fields": (
        "created_at",
        "registered_by",
      ),
      "classes": ("collapse",),
    }),
  )
  readonly_fields = ("created_at", "age", "full_name")
  list_display = ("patient_id", "full_name", "sex", "civil_status", "status", "photo_url", "created_at")
  search_fields = ("first_name", "last_name", "patient_id", "email", "mobile_number")
  list_filter = ("sex", "civil_status", "status", "created_at")

class EmergencyContactAdmin(admin.ModelAdmin):
  list_display = ('name', 'address', 'mobile_number', 'email')

class CancerDiagnosisAdmin(admin.ModelAdmin):
  list_display = ('patient', 'diagnosis', 'date_diagnosed', 'cancer_site', 'cancer_stage')

class HistoricalUpdateAdmin(admin.ModelAdmin):
  list_display = ('patient', 'date', 'note')

admin.site.register(models.Patient, PatientAdmin)
admin.site.register(models.PreScreeningForm)
admin.site.register(models.EmergencyContact, EmergencyContactAdmin)
admin.site.register(models.CancerDiagnosis, CancerDiagnosisAdmin)
admin.site.register(models.HistoricalUpdate, HistoricalUpdateAdmin)