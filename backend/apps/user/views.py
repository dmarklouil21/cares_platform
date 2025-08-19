from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework import status

from apps.user.serializers import LoginSerializer

# Create your views here.

class LoginApiView(TokenObtainPairView):
	permission_classes = [IsAuthenticated]
	serializer_class = LoginSerializer

class ResetPasswordApiView(APIView):
  permission_classes = [AllowAny]

  def post(self, request):
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
      return Response({'message': 'Both old and new passwords are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    if not user.check_password(old_password):
      return Response({'message': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    print('\n')
    
    user.set_password(new_password)
    user.is_first_login = False
    user.save()
    return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
