from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class LoginSerializer(TokenObtainPairSerializer):
	@classmethod
	def get_token(cls, user):
		token = super().get_token(user)
		token['user_id'] = user.user_id
		return token
	
	def validate(self, attrs):
		data = super().validate(attrs)
		
		# Add custom fields to the response
		data['user'] = {
			'user_id': self.user.user_id,
			'email': self.user.email,
			'first_name': self.user.first_name,
			'last_name': self.user.last_name,
			'is_first_login': self.user.is_first_login,
			'is_rhu': self.user.is_rhu,
			'is_private': self.user.is_private,
			'is_superuser': self.user.is_superuser,
		}
		
		return data