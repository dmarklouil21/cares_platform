from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model

from apps.pre_enrollment.models import Beneficiary
from apps.pre_enrollment.serializers import BeneficiarySerializer

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
      getattr(getattr(self.user, 'beneficiary', None), 'patient', None),
      'patient_id',
      None
    )
    
    data['user'] = {
      'user_id': self.user.user_id,
      'patient_id': patient_id,
      'email': self.user.email,
      'first_name': self.user.first_name,
      'last_name': self.user.last_name,
      'is_first_login': self.user.is_first_login,
      'is_rhu': self.user.is_rhu,
      'is_private': self.user.is_private,
      'is_superuser': self.user.is_superuser,
      'is_active': self.user.is_active,
    }
    return data