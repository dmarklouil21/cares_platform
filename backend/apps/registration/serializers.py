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

# class RHURegistrationSerializer(serializers.Serializer):
#   lgu = serializers.CharField(max_length=100)
#   address = serializers.CharField(max_length=255)
#   phone_number = serializers.CharField(max_length=15)
#   email = serializers.EmailField()
#   representative_first_name = serializers.CharField(max_length=150)
#   representative_last_name = serializers.CharField(max_length=150)
#   official_representative_name = serializers.CharField(max_length=255)

#   def create(self, validated_data):
#     user = User.objects.create(
#       username=validated_data['email'],
#       email=validated_data['email'],
#       first_name=validated_data['representative_first_name'],
#       last_name=validated_data['representative_last_name'],
#       phone_number=validated_data['phone_number'],
#       lgu=validated_data['lgu'],
#       address=validated_data['address'],
#       is_rhu=True,
#       is_active=False,
#     )
#     return user