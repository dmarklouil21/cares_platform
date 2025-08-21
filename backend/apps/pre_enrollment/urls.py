from django.urls import path
from . import views

urlpatterns = [
    # Beneficiary Pages URLs
    path('beneficiary/pre-enrollment/', views.BeneficiaryCreateView.as_view(), name='beneficiary_create'),
    path('beneficiary/details/', views.BeneficiaryDetailView.as_view(), name='beneficiary_detail'),
    # EJACC Admin Pages URLs
    path('ejacc/pre-enrollment/list/', views.PatientListView.as_view(), name='pre_enrollment_list'),
    path('ejacc/pre-enrollment/details/<str:patient_id>/', views.PatientPreEnrollmentDetailView.as_view(), name='patient_pre_enrollment_detail'),
    path('ejacc/pre-enrollment/validate/<str:patient_id>/', views.PatientPreEnrollmentStatusUpdateView.as_view(), name='pre_enrollment_verify'),
    path('ejacc/pre-enrollment/reject/<str:patient_id>/', views.PatientPreEnrollmentStatusUpdateView.as_view(), name='pre_enrollment_reject'),
    path('ejacc/pre-enrollment/delete/<str:patient_id>/', views.PatientPreEnrollmentDeleteView.as_view(), name='pre_enrollment_delete'),
]