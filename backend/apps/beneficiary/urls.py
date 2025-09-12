from django.urls import path
from . import views

urlpatterns = [
  # path('pre-enrollment/', views.PatientCreateView.as_view(), name='patient_create'),
  path('pre-enrollment/', views.PreEnrollmentView.as_view(), name='pre_enrollment'),
  path('patient/details/', views.PatientDetailView.as_view(), name='patient_detail'),
  path('cancer-awareness-activity/list/', views.CancerAwarenessActivityListView.as_view(), name='list_cancer_awareness_activity'),
  # path('individual-screening/submit-request/', views.IndividualScreeningCreateView.as_view(), name='individual_screening_request'),
  path('individual-screening/screening-request/', views.IndividualScreeningRequestView.as_view(), name='individual_screening_request'),
  path('individual-screening/screening-procedure-form/<str:id>/', views.IndividualScreeningUpdateView.as_view(), name='screening_procedure_create'),
  path('individual-screening/attachments-upload/<str:procedure_id>/', views.LOAAttachmentUploadView.as_view(), name='individual_screening_attachments_upload'),
  path('individual-screening/results-upload/<str:screening_id>/', views.ResultAttachmentUploadView.as_view(), name='individual_screening_results_upload'),
  path('individual-screening/list/', views.IndividualScreeningListView.as_view(), name='individual_screening_list_view'),
  path('individual-screening/<int:id>/', views.IndividualScreeningDetailView.as_view(), name='individual_screening_view'),
  path('individual-screening/cancel-request/<str:id>/', views.IndividualScreeningCancelRequestView.as_view(), name='individual_screening_cancel'),
  path('precancerous-meds/submit/', views.PreCancerousMedsCreateView.as_view(), name='precancerous_meds_submit'),
  path('precancerous-meds/list/', views.PreCancerousMedsListView.as_view(), name='precancerous_meds_list'),
  path('precancerous-meds/<int:id>/', views.PreCancerousMedsDetailView.as_view(), name='precancerous_meds_detail'),
  path('precancerous-meds/cancel/<int:id>/', views.PreCancerousMedsCancelView.as_view(), name='precancerous_meds_cancel'),
  path('cancer-treatment/submit/', views.CancerTreatmentSubmissionView.as_view(), name='cancer_treatment_submission'),
  path('cancer-treatment/list/', views.CancerManagementListView.as_view(), name='cancer_management_list_view'),
]
