from rest_framework import serializers
from .models import Patient, CancerDiagnosis
from apps.pre_enrollment.serializers import BeneficiarySerializer

class CancerDiagnosisSerializer(serializers.ModelSerializer):
  class Meta:
    model = CancerDiagnosis
    fields = [
      'diagnosis',
      'date_diagnosed',
      'cancer_site',
      'cancer_stage',
    ]

class PatientSerializer(serializers.ModelSerializer):
  full_name = serializers.ReadOnlyField()
  beneficiary = BeneficiarySerializer(read_only=True) 
  diagnosis = CancerDiagnosisSerializer(many=True, read_only=True) 

  class Meta:
    model = Patient
    fields = [
      'patient_id',
      'beneficiary',
      'full_name',
      'diagnosis', 
    ]
