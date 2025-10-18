from django.urls import path
from .views import RegistrationAPIView, RegistrationLoginAPIView, RHURegistrationAPIView, PrivateRegistrationAPIView

urlpatterns = [
  path('register/', RegistrationAPIView.as_view(), name='register'),
  path('login/', RegistrationLoginAPIView.as_view(), name='registration-login'),
  path('rhu-register/', RHURegistrationAPIView.as_view(), name='rhu-register'),
  path('private-register/', PrivateRegistrationAPIView.as_view(), name='private-register'),
]