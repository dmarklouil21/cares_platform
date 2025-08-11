from django.urls import path
from .views import RegistrationAPIView, RegistrationLoginAPIView

urlpatterns = [
  path('register/', RegistrationAPIView.as_view(), name='register'),
  path('login/', RegistrationLoginAPIView.as_view(), name='registration-login'),
] 