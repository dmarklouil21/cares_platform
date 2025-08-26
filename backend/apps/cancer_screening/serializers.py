from rest_framework import serializers
from rest_framework.exceptions import NotFound, ValidationError
from django.shortcuts import get_object_or_404
from .models import (
  DiagnosisBasis, PrimarySite, DistantMetastasisSite, TreatmentOption,
  ScreeningProcedure, IndividualScreening, ScreeningAttachment, PreScreeningForm
)
from apps.patient.models import Patient, CancerDiagnosis
from apps.patient.serializers import PatientSerializer
from apps.pre_enrollment.models import Beneficiary


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

class ScreeningAttachmentSerializer(serializers.ModelSerializer):
  class Meta:
    model = ScreeningAttachment
    fields = ['id', 'file', 'uploaded_at']

class ScreeningProcedureSerializer(serializers.ModelSerializer):
  attachments = ScreeningAttachmentSerializer(many=True, read_only=True)
  class Meta:
    model = ScreeningProcedure
    fields = [
      'id', 'screening_procedure_name', 'procedure_details',
      'cancer_site', 'attachments'
    ]

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

  def create(self, validated_data):
    diagnosis_basis_data = validated_data.pop('diagnosis_basis')
    primary_sites_data = validated_data.pop('primary_sites')
    distant_metastasis_sites_data = validated_data.pop('distant_metastasis_sites')
    adjuvant_treatments_received_data = validated_data.pop('adjuvant_treatments_received')
    other_source_treatments_data = validated_data.pop('other_source_treatments')

    request = self.context.get('request')
    patient = get_object_or_404(Patient, user=request.user)
    existing_screening = IndividualScreening.objects.filter(patient=patient).exclude(status='Complete').order_by('-created_at').first()
    
    if existing_screening and existing_screening.status != 'Complete':
      raise ValidationError({'non_field_errors': ['You currently have an ongoing request. Please complete or cancel it before submitting a new one.']})

    individual_screening = IndividualScreening.objects.create(patient=patient)
    pre_screening_form = PreScreeningForm.objects.create(individual_screening=individual_screening, **validated_data)

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

    return pre_screening_form

  def update(self, instance, validated_data):
    # Extract nested data
    diagnosis_basis_data = validated_data.pop('diagnosis_basis', [])
    primary_sites_data = validated_data.pop('primary_sites', [])
    distant_metastasis_sites_data = validated_data.pop('distant_metastasis_sites', [])
    adjuvant_treatments_received_data = validated_data.pop('adjuvant_treatments_received', [])
    other_source_treatments_data = validated_data.pop('other_source_treatments', [])

    # Update simple fields
    for attr, value in validated_data.items():
      setattr(instance, attr, value)
    instance.save()

    # Clear and update many-to-many fields
    instance.diagnosis_basis.clear()
    for item in diagnosis_basis_data:
      obj, _ = DiagnosisBasis.objects.get_or_create(**item)
      instance.diagnosis_basis.add(obj)

    instance.primary_sites.clear()
    for item in primary_sites_data:
      obj, _ = PrimarySite.objects.get_or_create(**item)
      instance.primary_sites.add(obj)

    instance.distant_metastasis_sites.clear()
    for item in distant_metastasis_sites_data:
      obj, _ = DistantMetastasisSite.objects.get_or_create(**item)
      instance.distant_metastasis_sites.add(obj)

    instance.adjuvant_treatments_received.clear()
    for item in adjuvant_treatments_received_data:
      obj, _ = TreatmentOption.objects.get_or_create(**item)
      instance.adjuvant_treatments_received.add(obj)

    instance.other_source_treatments.clear()
    for item in other_source_treatments_data:
      obj, _ = TreatmentOption.objects.get_or_create(**item)
      instance.other_source_treatments.add(obj)

    return instance

class IndividualScreeningSerializer(serializers.ModelSerializer):
  patient = PatientSerializer(read_only=True)
  screening_procedure = ScreeningProcedureSerializer()
  pre_screening_form = PreScreeningFormSerializer(read_only=True)

  class Meta:
    model = IndividualScreening
    fields = [
      'id', 'patient', 'screening_procedure', 'pre_screening_form',
      'status', 'loa_generated', 'created_at', 'has_patient_response', 
      'response_description', 'date_approved', 'screening_date', 'uploaded_result',
    ]
