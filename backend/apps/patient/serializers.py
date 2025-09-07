from rest_framework import serializers
from .models import Patient, CancerDiagnosis, EmergencyContact, HistoricalUpdate
from .models import (
  DiagnosisBasis, PrimarySite, DistantMetastasisSite, TreatmentOption,
  PreScreeningForm
)

class EmergencyContactSerializer(serializers.ModelSerializer):
  class Meta:
    model = EmergencyContact
    fields = [
      'id', 'name', 'address', 'relationship_to_patient', 'email', 'landline_number', 'mobile_number'
    ]
  
class CancerDiagnosisSerializer(serializers.ModelSerializer):
  class Meta:
    model = CancerDiagnosis
    fields = [
      'diagnosis',
      'date_diagnosed',
      'cancer_site',
      'cancer_stage',
    ]

class HistoricalUpdateSerializer(serializers.ModelSerializer):
  class Meta:
    model = HistoricalUpdate
    fields = [
      'date',
      'note',
    ]

# --- Atomic Serializers ---
class DiagnosisBasisSerializer(serializers.ModelSerializer):
  class Meta:
    model = DiagnosisBasis
    fields = ['name']

class PrimarySiteSerializer(serializers.ModelSerializer):
  class Meta:
    model = PrimarySite
    fields = ['name']

class DistantMetastasisSiteSerializer(serializers.ModelSerializer):
  class Meta:
    model = DistantMetastasisSite
    fields = ['name']

class TreatmentOptionSerializer(serializers.ModelSerializer):
  class Meta:
    model = TreatmentOption
    fields = ['name']

class PreScreeningFormSerializer(serializers.ModelSerializer):
  diagnosis_basis = DiagnosisBasisSerializer(many=True)
  primary_sites = PrimarySiteSerializer(many=True)
  distant_metastasis_sites = DistantMetastasisSiteSerializer(many=True)
  adjuvant_treatments_received = TreatmentOptionSerializer(many=True)
  other_source_treatments = TreatmentOptionSerializer(many=True)

  class Meta:
    model = PreScreeningForm
    fields = [
      'id', 'referred_from', 'referring_doctor_or_facility',
      'reason_for_referral', 'chief_complaint', 'date_of_consultation', 'date_of_diagnosis',
      'diagnosis_basis', 'multiple_primaries', 'primary_sites', 'primary_sites_other',
      'laterality', 'histology', 'staging', 't_system', 'n_system', 'm_system',
      'distant_metastasis_sites', 'distant_metastasis_sites_other',
      'final_diagnosis', 'final_diagnosis_icd10',
      'treatment_purpose', 'treatment_purpose_other',
      'primary_assistance_by_ejacc', 'date_of_assistance',
      'adjuvant_treatments_received', 'adjuvant_treatments_other',
      'other_source_treatments', 'other_source_treatments_other',
      'created_at'
    ]
    read_only_fields = ['created_at']

class PatientSerializer(serializers.ModelSerializer):
  # user = serializers.HiddenField(default=None)
  pre_screening_form = PreScreeningFormSerializer(read_only=True)
  emergency_contacts = EmergencyContactSerializer(many=True)
  diagnosis = CancerDiagnosisSerializer(many=True, required=False, allow_empty=True, allow_null=True, default=[]) 
  historical_updates = HistoricalUpdateSerializer(many=True, required=False, allow_empty=True, allow_null=True, default=[]) 

  # computed fields
  age = serializers.ReadOnlyField()
  full_name = serializers.ReadOnlyField()

  class Meta:
    model = Patient
    fields = [
      'patient_id', 'first_name', 'middle_name', 'last_name', 'suffix', 'date_of_birth', 'age', 'sex', 
      'civil_status', 'number_of_children', 'status', 'address', 'city', 'barangay', 'mobile_number', 'email', 
      'source_of_information', 'other_rafi_programs_availed', 'highest_educational_attainment', 'registered_by',
      'occupation', 'source_of_income', 'monthly_income', 'created_at', 'full_name', 'emergency_contacts', 'diagnosis',
      'historical_updates', 'photo_url', 'pre_screening_form'
    ]
    read_only_fields = ('created_at', 'patient_id', 'photo_url')
  
  def create(self, validated_data):
    request = self.context.get("request")  
    user = request.user if request else None

    emergency_contacts_data = validated_data.pop('emergency_contacts', [])
    cancer_diagnosis_data = validated_data.pop('diagnosis', [])
    historical_updates_data = validated_data.pop('historical_updates', [])

    if user and not user.is_superuser and not getattr(user, "is_rhu", False):
      patient = Patient.objects.create(user=user, **validated_data)
    else: 
      patient = Patient.objects.create(**validated_data)

    for contact_data in emergency_contacts_data:
      EmergencyContact.objects.create(patient=patient, **contact_data)

    for diagnosis_data in cancer_diagnosis_data:
      CancerDiagnosis.objects.create(patient=patient, **diagnosis_data)
    
    for historical_update_data in historical_updates_data:
      HistoricalUpdate.objects.create(patient=patient, **historical_update_data)

    return patient
  
  def update(self, instance, validated_data):
    emergency_contacts_data = validated_data.pop('emergency_contacts', [])
    cancer_diagnosis_data = validated_data.pop('diagnosis', [])
    historical_updates_data = validated_data.pop('historical_updates', [])

    # update scalar fields
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    instance.save()

    # ---- Emergency Contacts ----
    instance.emergency_contacts.all().delete()  # simple approach: delete + recreate
    for contact_data in emergency_contacts_data:
        EmergencyContact.objects.create(patient=instance, **contact_data)

    # ---- Cancer Diagnosis ----
    instance.diagnosis.all().delete()
    for diagnosis_data in cancer_diagnosis_data:
        CancerDiagnosis.objects.create(patient=instance, **diagnosis_data)

    # ---- Historical Updates ----
    instance.historical_updates.all().delete()
    for historical_update_data in historical_updates_data:
        HistoricalUpdate.objects.create(patient=instance, **historical_update_data)

    return instance