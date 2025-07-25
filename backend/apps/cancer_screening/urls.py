from django.urls import path
from . import views

urlpatterns = [
    # Beneficiary Pages URLs
    path('beneficiary/individual-screening/', views.IndividualScreeningCreateView.as_view(), name='individual_screening_create'),
]