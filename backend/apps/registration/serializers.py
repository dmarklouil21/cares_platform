from rest_framework import serializers
from apps.user.models import User

class RegistrationSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = [
      'email', 'first_name', 'last_name', 'date_of_birth', 'age',
      'phone_number', 'is_resident_of_cebu', 'lgu', 'address',
    ]
    extra_kwargs = {
      'email': {'required': True},
      'phone_number': {'required': True},
    }

  def create(self, validated_data):
    # Password will be set in the view
    email = validated_data.pop("email")
    return User.objects.create_user(username=email, email=email, **validated_data) 
