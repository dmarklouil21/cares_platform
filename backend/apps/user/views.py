from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework import status

from apps.user.serializers import LoginSerializer

# Create your views here.

class LoginApiView(TokenObtainPairView):
	permission_classes = [AllowAny]
	serializer_class = LoginSerializer

class ResetPasswordApiView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    email = request.data.get('email')
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    if not email or not old_password or not new_password:
      return Response({'message': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    User = get_user_model()
    user = User.objects.filter(email=email).first()
    if not user:
      return Response({'message': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)
    # Check if old_password matches current password or plain_password
    if not user.check_password(old_password) and user.plain_password != old_password:
      return Response({'message': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.plain_password = new_password
    user.is_first_login = False
    user.is_active = True
    user.save()
    return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
