from django.urls import path
from . import views
from apps.precancerous import views as precancerous_views

urlpatterns = [
  path('individual-screening-list/', views.IndividualScreeningListView.as_view(), name='individual_screening_list'),
  path('individual-screening/approve/<str:patient_id>/', views.IndividualScreeningStatusUpdateView.as_view(), name='individual_screening_status_update'),
  path('individual-screening/status-update/<int:id>/', views.IndividualScreeningStatusUpdateView.as_view(), name='individual_screening_status_update'),
  path('individual-screening/status-reject/<int:id>/', views.IndividualScreeningStatusRejectView.as_view(), name='individual_screening_status_reject'),
  path('individual-screening/delete/<str:id>/', views.IndividualScreeningDeleteView.as_view(), name='individual_screening_delete'),
  path('individual-screening/pre-screening-form/update/<int:id>/', views.PreScreeningFormUpdateView.as_view(), name='invidividual_screening_pre_screening_form_update'),
  path('individual-screening/send-loa/', views.SendLOAView.as_view(), name='individual_screening_send_loa'),
  path('individual-screening/attachments-update/<str:procedure_id>/', views.ScreeningAttachmentUpdateView.as_view(), name='individual_screening_attachments_update'),
  path('individual-screening/attachments-delete/<int:id>/', views.AttachmentDeleteView.as_view(), name='individual_screening_attachments_delete'),
  path('individual-screening/results-upload/<str:screening_id>/', views.ResultAttachmentUploadView.as_view(), name='individual_screening_results_upload'),
  path('individual-screening/results-attachment-delete/<str:screening_id>/', views.ResultDeleteView.as_view(), name='individual_screening_results_attachments_delete'),
  path('individual-screening/return-remarks/<int:id>/', views.send_return_remarks, name='return_remarks'),

  # RHU: Mass Screening
  path('mass-screening/rhu/create/', views.MassScreeningRequestCreateView.as_view(), name='rhu_mass_screening_create'),
  path('mass-screening/rhu/list/', views.MyMassScreeningRequestListView.as_view(), name='rhu_mass_screening_list'),
  path('mass-screening/rhu/detail/<int:id>/', views.MyMassScreeningRequestDetailView.as_view(), name='rhu_mass_screening_detail'),
  path('mass-screening/rhu/update/<int:id>/', views.MyMassScreeningRequestUpdateView.as_view(), name='rhu_mass_screening_update'),
  path('mass-screening/rhu/delete/<int:id>/', views.MyMassScreeningRequestDeleteView.as_view(), name='rhu_mass_screening_delete'),
  path('mass-screening/rhu/<int:request_id>/attendance/', views.MassScreeningAttendanceView.as_view(), name='rhu_mass_screening_attendance'),
  path('mass-screening/rhu/<int:id>/attachments/add/', views.MyMassScreeningAttachmentAddView.as_view(), name='rhu_mass_screening_attachment_add'),
  path('mass-screening/rhu/attachments/delete/<int:id>/', views.MyMassScreeningAttachmentDeleteView.as_view(), name='rhu_mass_screening_attachment_delete'),

  # Admin: Mass Screening Management
  path('mass-screening/admin/list/', views.AdminMassScreeningListView.as_view(), name='admin_mass_screening_list'),
  path('mass-screening/admin/detail/<int:id>/', views.AdminMassScreeningDetailView.as_view(), name='admin_mass_screening_detail'),
  path('mass-screening/admin/status/<int:id>/<str:action>/', views.AdminMassScreeningStatusView.as_view(), name='admin_mass_screening_status'),
  path('mass-screening/admin/<int:request_id>/attendance/', views.AdminMassScreeningAttendanceView.as_view(), name='admin_mass_screening_attendance'),

  # Admin: Pre-Cancerous Meds Management
  path('precancerous/admin/list/', precancerous_views.AdminPreCancerousMedsListView.as_view(), name='admin_precancerous_meds_list'),
  path('precancerous/admin/detail/<int:id>/', precancerous_views.AdminPreCancerousMedsDetailView.as_view(), name='admin_precancerous_meds_detail'),
  path('precancerous/admin/set-release-date/<int:id>/', precancerous_views.AdminPreCancerousMedsSetReleaseDateView.as_view(), name='admin_precancerous_meds_set_release_date'),
  path('precancerous/admin/verify/<int:id>/', precancerous_views.AdminPreCancerousMedsVerifyView.as_view(), name='admin_precancerous_meds_verify'),
  path('precancerous/admin/reject/<int:id>/', precancerous_views.AdminPreCancerousMedsRejectView.as_view(), name='admin_precancerous_meds_reject'),
  path('precancerous/admin/done/<int:id>/', precancerous_views.AdminPreCancerousMedsDoneView.as_view(), name='admin_precancerous_meds_done'),
]