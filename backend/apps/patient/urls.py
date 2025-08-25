from django.urls import path
from . import views

urlpatterns = [
    path('pre-enrollment/', views.PatientCreateView.as_view(), name='patient_create'),
    path('details/<str:patient_id>/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('update/<str:patient_id>/', views.PatientUpdateView.as_view(), name='patient_update'),
    path('list/', views.PatientListView.as_view(), name='patient_list'),
    path('pre-enrollment/validate/<str:patient_id>/', views.PatientStatusUpdateView.as_view(), name='pre_enrollment_verify'),
    path('pre-enrollment/reject/<str:patient_id>/', views.PatientDeleteView.as_view(), name='pre_enrollment_reject'),
    path('delete/<str:patient_id>/', views.PatientDeleteView.as_view(), name='patient_delete'),
]