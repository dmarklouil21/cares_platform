from django.urls import path
from . import views

urlpatterns = [
  path('cancer-awareness/list-activity/', views.CancerAwarenessActivityListView.as_view(), name='list_cancer_awareness'),
  path('cancer-awareness/create-activity/', views.CancerAwarenessActivityCreateView.as_view(), name='cancer_awareness_create'),
  path('cancer-awareness/update-activity/<str:id>/', views.CancerAwarenessActivityUpdateView.as_view(), name='cancer_awareness_update'),
  path('cancer-awareness/delete-activity/<str:id>/', views.CancerAwarenessActivityDeleteView.as_view(), name='cancer_awareness_delete'),
  path('private/profile/', views.PrivatePrepresentativeProfileAPIView.as_view(), name='private_profile'),
  path('private/list/', views.PrivateListView.as_view(), name='private_list'),
  path('pre-cancerous/list/', views.PreCancerousMedsListView.as_view(), name='pre_cancerous_meds_list'),
  path('pre-cancerous/view/<int:id>/', views.PreCancerousMedsDetailView.as_view(), name='pre_cancerous_meds_details'),
  path('pre-cancerous/update/<int:id>/', views.PreCancerousMedsUpdateView.as_view(), name='pre_cancerous_meds_update'),
]
