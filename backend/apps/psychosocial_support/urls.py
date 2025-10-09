from django.urls import path
from .views import (
    AdminActivityListCreateView,
    AdminActivityDetailView,
    AdminPatientSuggestions,
    PublicActivityListView,
)

urlpatterns = [
    # Admin: list and create activities
    path('admin/activities/', AdminActivityListCreateView.as_view(), name='admin-activities-list-create'),
    # Admin: retrieve/update/delete
    path('admin/activities/<int:id>/', AdminActivityDetailView.as_view(), name='admin-activities-detail'),
    # Admin: recent patient name suggestions
    path('admin/patient-suggestions/', AdminPatientSuggestions.as_view(), name='admin-patient-suggestions'),
    # Public/RHU/Beneficiary: list activities (read-only)
    path('public/activities/', PublicActivityListView.as_view(), name='public-activities-list'),
]
