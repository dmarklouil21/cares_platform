from django.urls import path
from .views import RHUProfileAPIView

urlpatterns = [
  path('profile/', RHUProfileAPIView.as_view(), name='rhu-profile'),
]
