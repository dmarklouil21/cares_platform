from rest_framework import serializers
from .models import Patient, CancerDiagnosis, EmergencyContact, HistoricalUpdate

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

class PatientSerializer(serializers.ModelSerializer):
  # user = serializers.HiddenField(default=None)
  emergency_contacts = EmergencyContactSerializer(many=True)
  diagnosis = CancerDiagnosisSerializer(many=True)  # optional field
  historical_updates = HistoricalUpdateSerializer(many=True)  # optional field

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
      'historical_updates',
    ]
    read_only_fields = ('created_at', 'patient_id',)
    extra_kwargs = {
      'diagnosis': {'required': False, 'allow_blank': True},
      'historical_updates': {'required': False, 'allow_blank': True},
    }
  
  def create(self, validated_data):
    request = self.context.get("request")  # access the request
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


