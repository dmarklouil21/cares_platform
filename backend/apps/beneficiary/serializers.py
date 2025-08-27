from rest_framework import serializers
from apps.patient.models import Patient, EmergencyContact

class EmergencyContactSerializer(serializers.ModelSerializer):
  class Meta:
    model = EmergencyContact
    fields = [
      'id', 'name', 'address', 'relationship_to_patient', 'email', 'landline_number', 'mobile_number'
    ]
  
class PatientSerializer(serializers.ModelSerializer):
  # user = serializers.HiddenField(default=None)
  emergency_contacts = EmergencyContactSerializer(many=True)

  # computed fields
  age = serializers.ReadOnlyField()
  full_name = serializers.ReadOnlyField()

  class Meta:
    model = Patient
    fields = [
      'patient_id', 'first_name', 'middle_name', 'last_name', 'suffix', 'date_of_birth', 'age', 
      'sex', 'civil_status', 'number_of_children', 'status', 'address', 'city', 'barangay', 'mobile_number', 
      'email', 'source_of_information', 'other_rafi_programs_availed', 'highest_educational_attainment', 'registered_by',
      'occupation', 'source_of_income', 'monthly_income', 'created_at', 'full_name', 'emergency_contacts', 
    ]
    read_only_fields = ('created_at', 'patient_id',)
  
  def create(self, validated_data):
    request = self.context.get("request")  # access the request
    user = request.user if request else None

    emergency_contacts_data = validated_data.pop('emergency_contacts', [])

    if user and not user.is_superuser and not getattr(user, "is_rhu", False):
      patient = Patient.objects.create(user=user, **validated_data)
    else: 
      patient = Patient.objects.create(**validated_data)

    for contact_data in emergency_contacts_data:
      EmergencyContact.objects.create(patient=patient, **contact_data)

    return patient
