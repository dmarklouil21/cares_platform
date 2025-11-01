from django.urls import path
from . import views

urlpatterns = [
  # Patient Details & Pre-Enrollment
  path('pre-enrollment/', views.PreEnrollmentView.as_view(), name='pre_enrollment'),
  path('patient/details/', views.PatientDetailView.as_view(), name='patient_detail'),

  # Cancer Awareness Activities
  path('cancer-awareness-activity/list/', views.CancerAwarenessActivityListView.as_view(), name='list_cancer_awareness_activity'),
  
  # Individual Screening
  path('individual-screening/screening-request/', views.IndividualScreeningRequestView.as_view(), name='individual_screening_request'),
  path('individual-screening/update/<str:id>/', views.IndividualScreeningUpdateView.as_view(), name='screening_procedure_create'),
  path('individual-screening/attachments-upload/<str:procedure_id>/', views.LOAAttachmentUploadView.as_view(), name='individual_screening_attachments_upload'),
  path('individual-screening/results-upload/<str:screening_id>/', views.ResultAttachmentUploadView.as_view(), name='individual_screening_results_upload'),
  path('individual-screening/list/', views.IndividualScreeningListView.as_view(), name='individual_screening_list_view'),
  path('individual-screening/<int:id>/', views.IndividualScreeningDetailView.as_view(), name='individual_screening_view'),
  path('individual-screening/cancel-request/<str:id>/', views.IndividualScreeningCancelRequestView.as_view(), name='individual_screening_cancel'),
  
  # Pre-Cancerous Medication Requests
  path('precancerous-meds/submit/', views.PreCancerousMedsCreateView.as_view(), name='precancerous_meds_submit'),
  path('precancerous-meds/list/', views.PreCancerousMedsListView.as_view(), name='precancerous_meds_list'),
  path('precancerous-meds/<int:id>/', views.PreCancerousMedsDetailView.as_view(), name='precancerous_meds_detail'),
  path('precancerous-meds/cancel/<int:id>/', views.PreCancerousMedsCancelView.as_view(), name='precancerous_meds_cancel'),
  
  # Post Treatment
  path('post-treatment/laboratory-request/', views.PostTreatmentRequestView.as_view(), name='post_treatment_request'),
  path('post-treatment/list/', views.PostTreatmentListView.as_view(), name='post_treatment_request_list_view'),
  path('post-treatment/details/<int:id>/', views.PostTreatmentDetailView.as_view(), name='post_treatment_request_view'),
  path('post-treatment/update/<int:id>/', views.PostTreatmentUpdateView.as_view(), name='post_treatment_update_view'),
  path('post-treatment/result/upload/<str:id>/', views.PostTreatmentResultUploadView.as_view(), name='post_treatment_result_upload_view'),
  
  # Cancer Treatment & Management
  path('cancer-treatment/submit/', views.CancerTreatmentSubmissionView.as_view(), name='cancer_treatment_submission'),
  path('cancer-treatment/list/', views.CancerManagementListView.as_view(), name='cancer_management_list_view'),
  path('cancer-treatment/details/', views.CancerManagementDetailedView.as_view(), name='detailed_view'),
  path('cancer-treatment/update/<str:id>/', views.CancerManagementUpdateView.as_view(), name='update_view'),
  path('cancer-treatment/case-summary/upload/<str:id>/', views.CaseSummaryUploadView.as_view(), name='case_summary_upload_view'),
  path('cancer-treatment/result/upload/<str:id>/', views.TreatmentResultUploadView.as_view(), name='result_upload_view'),

  # Home Visit 
  # path('post-treatment/laboratory-request/', views.PostTreatmentRequestView.as_view(), name='post_treatment_request'),
  path('home-visit/list/', views.HomeVisitListView.as_view(), name='home_visit_list_view'),
  path('home-visit/details/<int:id>/', views.HomeVisitDetailView.as_view(), name='home_visit_detail_view'),
  path('home-visit/update/<int:id>/', views.HomeVisitUpdateView.as_view(), name='home_visit_update_view'),
  # path('post-treatment/result/upload/<str:id>/', views.PostTreatmentResultUploadView.as_view(), name='post_treatment_result_upload_view'),

  # Hormonal Replacement 
  path('hormonal-replacement/request/', views.HormonalReplacementRequestView.as_view(), name='hormonal_replacement_request'),
  path('hormonal-replacement/details/<int:id>/', views.HormonalReplacementDetailView.as_view(), name='hormonal_replacement_request_view'),
  path('hormonal-replacement/list/', views.HormonalReplacementListView.as_view(), name='hormonal_replacement_request_list_view'),
]
