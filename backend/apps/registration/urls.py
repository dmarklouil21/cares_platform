from django.urls import path
from .views import RegistrationAPIView, RegistrationLoginAPIView, RHURegistrationAPIView

urlpatterns = [
  path('register/', RegistrationAPIView.as_view(), name='register'),
  path('login/', RegistrationLoginAPIView.as_view(), name='registration-login'),
  path('rhu-register/', RHURegistrationAPIView.as_view(), name='rhu-register'),
]