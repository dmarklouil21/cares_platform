from rest_framework import serializers
from apps.patient.models import Patient, EmergencyContact
from apps.patient.serializers import PreScreeningFormSerializer, CancerDiagnosisSerializer

from apps.patient.models import (
  DiagnosisBasis, PrimarySite, DistantMetastasisSite, TreatmentOption, PreScreeningForm
)

class EmergencyContactSerializer(serializers.ModelSerializer):
  class Meta:
    model = EmergencyContact
    fields = [
      'id', 'name', 'address', 'relationship_to_patient', 'email', 'landline_number', 'mobile_number'
    ]
  
class PatientSerializer(serializers.ModelSerializer):
  emergency_contacts = EmergencyContactSerializer(many=True)
  diagnosis = CancerDiagnosisSerializer(many=True, read_only=True) 

  # computed fields
  age = serializers.ReadOnlyField()
  full_name = serializers.ReadOnlyField()

  class Meta:
    model = Patient
    fields = [
      'patient_id', 'first_name', 'middle_name', 'last_name', 'suffix', 'date_of_birth', 'age', 
      'sex', 'civil_status', 'number_of_children', 'status', 'address', 'city', 'barangay', 'mobile_number', 
      'email', 'source_of_information', 'other_rafi_programs_availed', 'highest_educational_attainment', 'registered_by',
      'occupation', 'source_of_income', 'monthly_income', 'created_at', 'full_name', 'emergency_contacts', 'diagnosis'
    ]
    read_only_fields = ('created_at', 'patient_id',)

class PreEnrollmentSerializer(serializers.Serializer):
  general_data = PatientSerializer()
  cancer_data = PreScreeningFormSerializer()

  def create(self, validated_data):
    request = self.context.get("request") 
    user = request.user if request else None

    general_data = validated_data.pop('general_data')
    cancer_data = validated_data.pop('cancer_data')

    emergency_contacts_data = general_data.pop('emergency_contacts', [])

    diagnosis_basis_data = cancer_data.pop('diagnosis_basis')
    primary_sites_data = cancer_data.pop('primary_sites')
    distant_metastasis_sites_data = cancer_data.pop('distant_metastasis_sites')
    adjuvant_treatments_received_data = cancer_data.pop('adjuvant_treatments_received')
    other_source_treatments_data = cancer_data.pop('other_source_treatments')

    if user and not user.is_superuser and not getattr(user, "is_rhu", False):
      patient = Patient.objects.create(user=user, **general_data)
    else: 
      patient = Patient.objects.create(**general_data)

    for contact_data in emergency_contacts_data:
      EmergencyContact.objects.create(patient=patient, **contact_data)

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