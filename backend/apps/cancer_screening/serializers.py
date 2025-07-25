from rest_framework import serializers
from .models import (
  DiagnosisBasis, PrimarySite, DistantMetastasisSite, TreatmentOption,
  ScreeningProcedure, PreScreeningForm, IndividualScreening, ScreeningAttachment
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
    fields = ['file', 'uploaded_at']


# --- Grouped Serializers ---
class ScreeningProcedureSerializer(serializers.ModelSerializer):
  class Meta:
    model = ScreeningProcedure
    fields = [
      'beneficiary_id', 'screening_procedure_name', 'procedure_details',
      'cancer_site'
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
      'beneficiary_id', 'referred_from', 'referring_doctor_or_facility',
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


# --- Main Nested Create ---
class IndividualScreeningSerializer(serializers.ModelSerializer):
  patient = PatientSerializer(read_only=True)
  screening_procedure = ScreeningProcedureSerializer()
  pre_screening_form = PreScreeningFormSerializer()

  class Meta:
    model = IndividualScreening
    fields = [
      'patient', 'screening_procedure', 'pre_screening_form',
      'status', 'loa_generated', 'loa_uploaded', 'uploaded_result'
    ]

  def create(self, validated_data):
    # Extract nested data
    screening_procedure_data = validated_data.pop('screening_procedure')
    pre_screening_form_data = validated_data.pop('pre_screening_form')

    beneficiary_id = screening_procedure_data.get('beneficiary_id')
    try:
      beneficiary = Beneficiary.objects.get(beneficiary_id=beneficiary_id)
    except Beneficiary.DoesNotExist:
      raise serializers.ValidationError({"beneficiary_id": "Beneficiary with this ID does not exist."})

    # Extract and remove M2M fields
    m2m_fields = {
      'diagnosis_basis': pre_screening_form_data.pop('diagnosis_basis', []),
      'primary_sites': pre_screening_form_data.pop('primary_sites', []),
      'distant_metastasis_sites': pre_screening_form_data.pop('distant_metastasis_sites', []),
      'adjuvant_treatments_received': pre_screening_form_data.pop('adjuvant_treatments_received', []),
      'other_source_treatments': pre_screening_form_data.pop('other_source_treatments', []),
    }

    # 1. Create ScreeningProcedure
    screening_procedure = ScreeningProcedure.objects.create(
      beneficiary=beneficiary,
      **{k: v for k, v in screening_procedure_data.items() if k != 'beneficiary_id'}
    )

    # 2. Create PreScreeningForm
    pre_screening = PreScreeningForm.objects.create(
      beneficiary=beneficiary,
      **{k: v for k, v in pre_screening_form_data.items() if k != 'beneficiary_id'}
    )

    # 3. M2M Fields Assignment
    self._assign_m2m(pre_screening, m2m_fields)

    # 4. Create Patient
    patient = Patient.objects.create(beneficiary=beneficiary)

    # 5. Create CancerDiagnosis
    CancerDiagnosis.objects.create(
      patient=patient,
      diagnosis_data=pre_screening_form_data.get('final_diagnosis', ''),
      date_diagnosed=pre_screening_form_data.get('date_of_diagnosis', None),
      cancer_site=screening_procedure.cancer_site,
      cancer_stage=pre_screening_form_data.get('staging', ''),
    )

    # 6. Create IndividualScreening
    return IndividualScreening.objects.create(
      patient=patient,
      screening_procedure=screening_procedure,
      pre_screening_form=pre_screening,
    )

  def _assign_m2m(self, instance, m2m_data):
    for field_name, items in m2m_data.items():
      m2m_field = getattr(instance, field_name)
      for item in items:
        obj, _ = m2m_field.model.objects.get_or_create(**item)
        m2m_field.add(obj)
