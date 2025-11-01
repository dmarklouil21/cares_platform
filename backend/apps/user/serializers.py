from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model

""" User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
  beneficiary = BeneficiarySerializer(required=False, allow_null=True)

  class Meta:
    model = User
    fields = [
      'user_id', 'beneficiary', 'email', 'first_name', 'last_name', 'is_first_login', 'is_rhu', 'is_private', 
      'is_superuser', 'is_active',
    ] """

class LoginSerializer(TokenObtainPairSerializer):
  username_field = 'email'

  @classmethod
  def get_token(cls, user):
    token = super().get_token(user)
    token['user_id'] = user.user_id
    return token

  def validate(self, attrs):
    data = super().validate(attrs)
    # data['user'] = UserSerializer(self.user).data
    # patient_id = None
    # if hasattr(self.user, 'beneficiary') and self.user.beneficiary:
    #   if hasattr(self.user.beneficiary, 'patient') and self.user.beneficiary.patient:
    #     patient_id = self.user.beneficiary.patient.patient_id
    patient_id = getattr(
      getattr(getattr(self.user, 'patient', None)),
      'patient_id',
      None
    )
    
    data['user'] = {
      'user_id': self.user.user_id,
      'patient_id': patient_id,
      'email': self.user.email,
      'first_name': self.user.first_name,
      'last_name': self.user.last_name,
      'date_of_birth': self.user.date_of_birth,
      'address': self.user.address,
      'phone_number': self.user.phone_number,
      'is_first_login': self.user.is_first_login,
      'is_rhu': self.user.is_rhu,
      'is_private': self.user.is_private,
      'is_superuser': self.user.is_superuser,
      'is_active': self.user.is_active,
      'created_at': self.user.created_at,
    }
    return data

# ------------------------------
# User Profile Serializer
# ------------------------------
User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = [
      'user_id',
      'email', 'first_name', 'last_name',
      'date_of_birth', 'age',
      'phone_number', 'is_resident_of_cebu',
      'lgu', 'address', 'avatar',
    ]
    read_only_fields = ['user_id', 'email', 'age']

  def update(self, instance, validated_data):
    # Allow partial updates
    for attr, value in validated_data.items():
      setattr(instance, attr, value)
    instance.save()
    return instance