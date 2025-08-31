from django.urls import path
from . import views

urlpatterns = [
  path('pre-enrollment/', views.PatientCreateView.as_view(), name='patient_create'),
  path('patient/details/', views.PatientDetailView.as_view(), name='patient_detail'),
  path('cancer-awareness-activity/list/', views.CancerAwarenessActivityListView.as_view(), name='list_cancer_awareness_activity'),
  # path('individual-screening/submit-request/', views.IndividualScreeningCreateView.as_view(), name='individual_screening_request'),
  path('individual-screening/pre-screening-form/', views.PreScreeningCreateView.as_view(), name='individual_screening_create'),
  path('individual-screening/screening-procedure-form/', views.ScreeningProcedureCreateView.as_view(), name='screening_procedure_create'),
  path('individual-screening/attachments-upload/<str:procedure_id>/', views.LOAAttachmentUploadView.as_view(), name='individual_screening_attachments_upload'),
  path('individual-screening/results-upload/<str:screening_id>/', views.ResultAttachmentUploadView.as_view(), name='individual_screening_results_upload'),
  path('individual-screening/list/', views.IndividualScreeningListView.as_view(), name='individual_screening_list_view'),
  path('individual-screening/<int:id>/', views.IndividualScreeningDetailView.as_view(), name='individual_screening_view'),
  path('individual-screening/cancel-request/<str:id>/', views.IndividualScreeningCancelRequestView.as_view(), name='individual_screening_cancel'),
  path('precancerous-meds/submit/', views.PreCancerousMedsCreateView.as_view(), name='precancerous_meds_submit'),
  path('precancerous-meds/list/', views.PreCancerousMedsListView.as_view(), name='precancerous_meds_list'),
  path('precancerous-meds/<int:id>/', views.PreCancerousMedsDetailView.as_view(), name='precancerous_meds_detail'),
  path('precancerous-meds/cancel/<int:id>/', views.PreCancerousMedsCancelView.as_view(), name='precancerous_meds_cancel'),
]
