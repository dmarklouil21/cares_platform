from django.urls import path
from . import views

urlpatterns = [
  path('cancer-awareness/list-activity/', views.CancerAwarenessActivityListView.as_view(), name='list_cancer_awareness'),
  path('cancer-awareness/activity/<int:id>/', views.CancerAwarenessActivityDetailView.as_view(), name='view_cancer_awareness'),
  path('cancer-awareness/create-activity/', views.CancerAwarenessActivityCreateView.as_view(), name='cancer_awareness_create'),
  path('cancer-awareness/activity/<int:id>/attendees/', views.ActivityAttendeesView.as_view(), name='activity-attendees'),
  path('cancer-awareness/update-activity/<str:id>/', views.CancerAwarenessActivityUpdateView.as_view(), name='cancer_awareness_update'),
  path('cancer-awareness/delete-activity/<str:id>/', views.CancerAwarenessActivityDeleteView.as_view(), name='cancer_awareness_delete'),
  
  path('private/profile/', views.PrivatePrepresentativeProfileAPIView.as_view(), name='private_profile'),
  path('private/list/', views.PrivateListView.as_view(), name='private_list'),
  path('pre-cancerous/list/', views.PreCancerousMedsListView.as_view(), name='pre_cancerous_meds_list'),
  path('pre-cancerous/view/<int:id>/', views.PreCancerousMedsDetailView.as_view(), name='pre_cancerous_meds_details'),
  path('pre-cancerous/update/<int:id>/', views.PreCancerousMedsUpdateView.as_view(), name='pre_cancerous_meds_update'),

  # Mass Screening 
  path('cancer-screening/mass-screening/create/', views.MassScreeningRequestCreateView.as_view(), name='private_mass_screening_create'),
  path('cancer-screening/mass-screening/request-list/', views.MyMassScreeningRequestListView.as_view(), name='private_mass_screening_request_list'),
  path('cancer-screening/mass-screening/detail/<int:id>/', views.MyMassScreeningRequestDetailView.as_view(), name='private_mass_screening_request_detail'),
  path('cancer-screening/mass-screening/update/<int:id>/', views.MyMassScreeningRequestUpdateView.as_view(), name='private_mass_screening_request_update'),
  path('cancer-screening/mass-screening/attendance/<int:request_id>/', views.MassScreeningAttendanceView.as_view(), name='private_mass_screening_request'),
  path('cancer-screening/mass-screening/delete/<int:id>/', views.MyMassScreeningRequestDeleteView.as_view(), name='private_mass_screening_request_delete'),
  path('cancer-screening/mass-screening/<int:id>/attachments/add/', views.MyMassScreeningAttachmentAddView.as_view(), name='private_mass_screening_attachment_add'),
  path('cancer-screening/mass-screening/attachments/delete/<int:id>/', views.MyMassScreeningAttachmentDeleteView.as_view(), name='private_mass_screening_attachment_delete'),
]
