from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from .serializers import RegistrationSerializer
import random
import string
from django.conf import settings
from rest_framework.permissions import AllowAny
from django.db import IntegrityError
from django.core.mail import send_mail

# from twilio.base.exceptions import TwilioRestException
from rest_framework_simplejwt.tokens import RefreshToken
from apps.user.models import User

User = get_user_model()

class RegistrationAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            try:
                user = serializer.save(is_active=False)  # User inactive by default
                user.username = user.email  
                user.set_password(password)  #  Django auth
                user.plain_password = password 
                user.save()
            except IntegrityError:
                return Response(
                    {"message": "A user with this email or phone number already exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                send_mail(
                    subject="Welcome to RAFI-EJACC: Your Registration Details",
                    message="",  # Plain text fallback (optional)
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                    html_message=f"""
                        <div style='font-family: Arial, sans-serif; color: #222;'>
                            <div style='background: #005baa; padding: 20px; border-radius: 8px 8px 0 0;'>
                                <img src='https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png' alt='RAFI Logo' style='height: 50px; display: block; margin: 0 auto 10px auto;'>
                                <h2 style='color: #fff; text-align: center; margin: 0;'>Welcome to RAFI-EJACC</h2>
                            </div>
                            <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;'>
                                <p>Dear <b>{user.first_name} {user.last_name}</b>,</p>
                                <p>Thank you for registering with <b>RAFI-Eduardo J. Aboitiz Cancer Center (EJACC)</b>.</p>
                                <p>Your account has been created successfully. Please find your login credentials below:</p>
                                <ul style='background: #eaf3fb; padding: 15px; border-radius: 6px; list-style: none;'>
                                    <li><b>Email:</b> {user.email}</li>
                                    <li><b>Temporary Password:</b> <span style='color: #005baa;'>{password}</span></li>
                                </ul>
                                <p style='color: #b22222;'><b>Note:</b> Your account will be activated after resetting password. Please proceed to log in and reset your password.</p>
                                <p>If you have any questions or need assistance, please reply to this email or contact our support team.</p>
                                <hr style='margin: 30px 0;'>
                                <p style='font-size: 13px; color: #888;'>This email was sent by RAFI-EJACC. Please do not share your password with anyone.</p>
                            </div>
                        </div>
                    """
                )
            except Exception as e:
                return Response(
                    {"message": f"Failed to send email: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response({'message': 'Registration successful. Please check your email for your password. Your account will be activated after admin approval.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegistrationLoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({'message': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, email=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            if user.is_active:
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'is_superuser': user.is_superuser,
                    'user_id': user.user_id,  # Added user_id
                    'first_name': user.first_name,
                    'last_name': user.last_name,  # Add last_name for consistency
                    'is_active': user.is_active,
                    'is_first_login': user.is_first_login,
                    'email': user.email,
                    'message': 'Login successful.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'is_superuser': user.is_superuser,
                    'user_id': user.user_id,  # Added user_id
                    'first_name': user.first_name,
                    'last_name': user.last_name,  # Add last_name for consistency
                    'is_active': user.is_active,
                    'is_first_login': user.is_first_login,
                    'email': user.email,
                    'message': 'Account is not yet active. Please wait for admin approval.'
                }, status=status.HTTP_200_OK)
        return Response({'message': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
