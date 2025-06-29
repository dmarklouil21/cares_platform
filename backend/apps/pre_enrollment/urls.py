from django.urls import path
from . import views

urlpatterns = [
    # Beneficiary Pages URLs
    path('beneficiary/pre-enrollment/', views.BeneficiaryCreateView.as_view(), name='beneficiary_create'),
    path('beneficiary/details/', views.BeneficiaryDetailView.as_view(), name='beneficiary_detail'),
    # EJACC Admin Pages URLs
    path('ejacc/pre-enrollment/list/', views.BeneficiaryListView.as_view(), name='pre_enrollment_list'),
    path('ejacc/pre-enrollment/details/<str:beneficiary_id>/', views.BeneficiaryPreEnrollmentDetailView.as_view(), name='ejacc_pre_enrollment_detail'),
    path('ejacc/pre-enrollment/validate/<str:beneficiary_id>/', views.BeneficiaryPreEnrollmentStatusUpdateView.as_view(), name='ejacc_pre_enrollment_verify'),
    path('ejacc/pre-enrollment/reject/<str:beneficiary_id>/', views.BeneficiaryPreEnrollmentStatusUpdateView.as_view(), name='ejacc_pre_enrollment_reject'),
    path('ejacc/pre-enrollment/delete/<str:beneficiary_id>/', views.BeneficiaryPreEnrollmentDeleteView.as_view(), name='ejacc_pre_enrollment_delete'),
]