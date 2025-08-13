from django.urls import path
from . import views

urlpatterns = [
  # path('individual-screening-request/', views.PreScreeningCreateView.as_view(), name='individual_screening_create'),
  path('individual-screening-list/', views.IndividualScreeningListView.as_view(), name='individual_screening_list'),
  # path('screening-procedure-create/', views.ScreeningProcedureCreateView.as_view(), name='screening_procedure_create'),
  # path('individual-screening/upload-loa/', views.UploadLOAGenerated.as_view(), name='beneficiary_loa_upload'),
  path('individual-screening/approve/<str:patient_id>/', views.IndividualScreeningStatusUpdateView.as_view(), name='individual_screening_status_update'),
  path('individual-screening/status-update/<int:id>/', views.IndividualScreeningStatusUpdateView.as_view(), name='individual_screening_status_update'),
  path('individual-screening/status-reject/<int:id>/', views.IndividualScreeningStatusRejectView.as_view(), name='individual_screening_status_reject'),
  path('individual-screening/delete/<str:id>/', views.IndividualScreeningDeleteView.as_view(), name='individual_screening_delete'),
  path('individual-screening/pre-screening-form/update/<int:id>/', views.PreScreeningFormUpdateView.as_view(), name='invidividual_screening_pre_screening_form_update'),
  path('individual-screening/screening-procedure/update/<int:id>/', views.ScreeningProcedureUpdateView.as_view(), name='invidividual_screening_screening_procedure_update'),
  path('individual-screening/screening-procedure/delete/<str:id>/', views.ScreeningProcedureDeleteView.as_view(), name='individual_screening_screening_procedure_delete'),
  path('individual-screening/attachments-update/<str:procedure_id>/', views.ScreeningAttachmentUpdateView.as_view(), name='individual_screening_attachments_update'),
  path('individual-screening/attachments-delete/<int:id>/', views.AttachmentDeleteView.as_view(), name='individual_screening_attachments_delete'),
  path('individual-screening/results-upload/<str:screening_id>/', views.ResultAttachmentUploadView.as_view(), name='individual_screening_results_upload'),
  path('individual-screening/results-attachment-delete/<str:screening_id>/', views.ResultDeleteView.as_view(), name='individual_screening_results_attachments_delete'),
  path('individual-screening/return-remarks/<int:id>/', views.send_return_remarks, name='return_remarks'),
]