from rest_framework import serializers
from .models import Patient, CancerDiagnosis, EmergencyContact, HistoricalUpdate, ServiceReceived
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

class ServiceReceivedSerializer(serializers.ModelSerializer):
  class Meta:
    model = ServiceReceived
    fields = [
      'service_type',
      'date_completed',
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

  date_of_assistance = serializers.DateField(required=False, allow_null=True)
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
  pre_screening_form = PreScreeningFormSerializer(read_only=True)
  emergency_contacts = EmergencyContactSerializer(many=True)
  diagnosis = CancerDiagnosisSerializer(many=True, read_only=True) # required=False , allow_empty=True, allow_null=True, default=[]
  service_received = ServiceReceivedSerializer(many=True, required=False, read_only=True)
  historical_updates = HistoricalUpdateSerializer(many=True, required=False) # , allow_empty=True, allow_null=True, default=[]

  # computed fields
  age = serializers.ReadOnlyField()
  full_name = serializers.ReadOnlyField()

  # Add URL fields for Cloudinary files
  photo_url_display = serializers.SerializerMethodField()

  class Meta:
    model = Patient
    fields = [
      'patient_id', 'first_name', 'middle_name', 'last_name', 'suffix', 'date_of_birth', 'age', 'sex', 
      'civil_status', 'number_of_children', 'status', 'address', 'city', 'barangay', 'mobile_number', 'email', 
      'source_of_information', 'other_rafi_programs_availed', 'highest_educational_attainment', 'registered_by',
      'occupation', 'source_of_income', 'monthly_income', 'created_at', 'full_name', 'emergency_contacts', 'diagnosis',
      'historical_updates', 'photo_url', 'pre_screening_form', 'service_received'
    ]
    read_only_fields = ('created_at', 'patient_id', 'photo_url')
  
  def get_photo_url_display(self, obj):
    """Return the Cloudinary URL for the photo"""
    if obj.photo_url:
        return obj.photo_url.url  # This returns the full Cloudinary URL
    return None

class AdminPreEnrollmentSerializer(serializers.Serializer):
  general_data = PatientSerializer()
  cancer_data = PreScreeningFormSerializer()

  def create(self, validated_data):

    general_data = validated_data.pop('general_data')
    cancer_data = validated_data.pop('cancer_data')

    emergency_contacts_data = general_data.pop('emergency_contacts', [])
    historical_updates_data = general_data.pop('historical_updates', [])

    diagnosis_basis_data = cancer_data.pop('diagnosis_basis')
    primary_sites_data = cancer_data.pop('primary_sites')
    distant_metastasis_sites_data = cancer_data.pop('distant_metastasis_sites')
    adjuvant_treatments_received_data = cancer_data.pop('adjuvant_treatments_received')
    other_source_treatments_data = cancer_data.pop('other_source_treatments')

    patient = Patient.objects.create(**general_data)

    for contact_data in emergency_contacts_data:
      EmergencyContact.objects.create(patient=patient, **contact_data)
    
    for historical_update_data in historical_updates_data:
      HistoricalUpdate.objects.create(patient=patient, **historical_update_data)

    pre_screening_form = PreScreeningForm.objects.create(patient=patient, **cancer_data)

    for item in diagnosis_basis_data:
      diagnosis_basis, _ = DiagnosisBasis.objects.get_or_create(**item)
      pre_screening_form.diagnosis_basis.add(diagnosis_basis)

    for item in primary_sites_data:
      primary_site, _ = PrimarySite.objects.get_or_create(**item)
      pre_screening_form.primary_sites.add(primary_site)

    for item in distant_metastasis_sites_data:
      distant_metastasis_site, _ = DistantMetastasisSite.objects.get_or_create(**item)
      pre_screening_form.distant_metastasis_sites.add(distant_metastasis_site)

    for item in adjuvant_treatments_received_data:
      treatment_option, _ = TreatmentOption.objects.get_or_create(**item)
      pre_screening_form.adjuvant_treatments_received.add(treatment_option)

    for item in other_source_treatments_data:
      treatment_option, _ = TreatmentOption.objects.get_or_create(**item)
      pre_screening_form.other_source_treatments.add(treatment_option)

    return {
      "general_data": patient,
      "cancer_data": pre_screening_form,
    }
  
  def update(self, instance, validated_data):
    """
    instance: Patient object
    validated_data: incoming validated data with general_data & cancer_data
    """
    general_data = validated_data.pop('general_data', {})
    cancer_data = validated_data.pop('cancer_data', {})

    # --- Update Patient fields ---
    for attr, value in general_data.items():
      if attr not in ['emergency_contacts', 'historical_updates', 'id', 'created_at']:
        setattr(instance, attr, value)
    instance.save()

    # --- Update Emergency Contacts ---
    emergency_contacts_data = general_data.get('emergency_contacts', [])
    instance.emergency_contacts.all().delete()  # clear old
    for contact_data in emergency_contacts_data:
      EmergencyContact.objects.create(patient=instance, **contact_data)

    # --- Update Historical Updates ---
    historical_updates_data = general_data.get('historical_updates', [])
    instance.historical_updates.all().delete()
    for historical_update_data in historical_updates_data:
      HistoricalUpdate.objects.create(patient=instance, **historical_update_data)

    # --- Update PreScreeningForm ---
    pre_screening_form = getattr(instance, "pre_screening_form", None)
    if not pre_screening_form:
      pre_screening_form = PreScreeningForm.objects.create(patient=instance, **cancer_data)
    else:
      for attr, value in cancer_data.items():
        if attr not in [
          'diagnosis_basis', 'primary_sites',
          'distant_metastasis_sites', 'adjuvant_treatments_received',
          'other_source_treatments'
        ]:
          setattr(pre_screening_form, attr, value)
      pre_screening_form.save()

    # --- Update Many-to-Many fields ---
    if 'diagnosis_basis' in cancer_data:
      pre_screening_form.diagnosis_basis.clear()
      for item in cancer_data['diagnosis_basis']:
        diagnosis_basis, _ = DiagnosisBasis.objects.get_or_create(**item)
        pre_screening_form.diagnosis_basis.add(diagnosis_basis)

    if 'primary_sites' in cancer_data:
      pre_screening_form.primary_sites.clear()
      for item in cancer_data['primary_sites']:
        primary_site, _ = PrimarySite.objects.get_or_create(**item)
        pre_screening_form.primary_sites.add(primary_site)

    if 'distant_metastasis_sites' in cancer_data:
      pre_screening_form.distant_metastasis_sites.clear()
      for item in cancer_data['distant_metastasis_sites']:
        distant_metastasis_site, _ = DistantMetastasisSite.objects.get_or_create(**item)
        pre_screening_form.distant_metastasis_sites.add(distant_metastasis_site)

    if 'adjuvant_treatments_received' in cancer_data:
      pre_screening_form.adjuvant_treatments_received.clear()
      for item in cancer_data['adjuvant_treatments_received']:
        treatment_option, _ = TreatmentOption.objects.get_or_create(**item)
        pre_screening_form.adjuvant_treatments_received.add(treatment_option)

    if 'other_source_treatments' in cancer_data:
      pre_screening_form.other_source_treatments.clear()
      for item in cancer_data['other_source_treatments']:
        treatment_option, _ = TreatmentOption.objects.get_or_create(**item)
        pre_screening_form.other_source_treatments.add(treatment_option)

    return instance
