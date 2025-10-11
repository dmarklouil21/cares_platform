from django.urls import path
from . import views

urlpatterns = [
  # path('individual-screening-request/', views.PreScreeningCreateView.as_view(), name='individual_screening_create'),
  path('well-being-questions/', views.WellBeingQuestionListView.as_view(), name='well_being_questions'),
  path('list/', views.CancerManagementListView.as_view(), name='cancer_management_list'),
  path('details/<str:id>/', views.CancerManagementDetailedView.as_view(), name='cancer_management_detail_view'),
  path('cancer-treatment/create/', views.CancerTreatmentCreateView.as_view(), name='cancer_treatment_create'),
  path('cancer-treatment/status-update/<str:id>/', views.CancerTreatmentRequestStatusUpdateView.as_view(), name='cancer_treatment_status_update'),
  path('cancer-treatment/delete/<str:id>/', views.CancerTreatmentDeleteView.as_view(), name='cancer_treatment_delete'),
  path('send-loa/', views.SendLOAView.as_view(), name='cancer_treatment_send_loa'),
  path('send-case-summary/', views.SendCaseSummaryiew.as_view(), name='cancer_treatment_send_case_summary'),
]