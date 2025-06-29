from rest_framework import serializers
from .models import Beneficiary, EmergencyContact
from apps.user.models import User

class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = [
            'name', 'address', 'relationship_to_patient', 'email', 'landline_number', 'mobile_number'
        ]

class BeneficiarySerializer(serializers.ModelSerializer):
    emergency_contacts = EmergencyContactSerializer(many=True)
    user_id = serializers.CharField(write_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Beneficiary
        fields = [
            'user_id', 'beneficiary_id', 'first_name', 'middle_name', 'last_name', 'date_of_birth', 'age', 
            'sex', 'civil_status', 'number_of_children', 'address', 'city', 'barangay', 'mobile_number', 
            'email', 'source_of_information', 'other_rafi_programs_availed', 'highest_educational_attainment', 
            'occupation', 'source_of_income', 'monthly_income', 'emergency_contacts', 'status', 'date_created', 'full_name'
        ]
        read_only_fields = ['beneficiary_id', 'date_created']
    
    def create(self, validated_data):
        emergency_contacts_data = validated_data.pop('emergency_contacts', [])
        user_id = validated_data.pop('user_id')
        
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({"user_id": "User with this Code does not exist."})

        if user:
            beneficiary = Beneficiary.objects.create(user=user, **validated_data)
        else:
            beneficiary = Beneficiary.objects.create(**validated_data)

        for contact_data in emergency_contacts_data:
            EmergencyContact.objects.create(beneficiary=beneficiary, **contact_data)
            
        return beneficiary

