from django.urls import path
from . import views

urlpatterns = [
  path('individual-screening/pre-screening-form/', views.PreScreeningCreateView.as_view(), name='individual_screening_create'),
  path('individual-screening/screening-procedure-form/', views.ScreeningProcedureCreateView.as_view(), name='screening_procedure_create'),
  path('individual-screening/attachments-upload/<str:procedure_id>/', views.LOAAttachmentUploadView.as_view(), name='individual_screening_attachments_upload'),
  path('individual-screening/results-upload/<str:screening_id>/', views.ResultAttachmentUploadView.as_view(), name='individual_screening_results_upload'),
  path('individual-screening/list/', views.IndividualScreeningListView.as_view(), name='individual_screening_list_view'),
  path('individual-screening/<int:id>/', views.IndividualScreeningDetailView.as_view(), name='individual_screening_view'),
  path('individual-screening/cancel-request/<str:id>/', views.IndividualScreeningCancelRequestView.as_view(), name='individual_screening_cancel'),
]
