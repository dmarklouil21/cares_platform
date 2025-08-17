from django.urls import path
from . import views

urlpatterns = [
  path('cancer-awareness/list-activity/', views.CancerAwarenessActivityListView.as_view(), name='list_cancer_awareness'),
  path('cancer-awareness/create-activity/', views.CancerAwarenessActivityCreateView.as_view(), name='cancer_awareness_create'),
  path('cancer-awareness/update-activity/<str:id>/', views.CancerAwarenessActivityUpdateView.as_view(), name='cancer_awareness_update'),
  path('cancer-awareness/delete-activity/<str:id>/', views.CancerAwarenessActivityDeleteView.as_view(), name='cancer_awareness_delete'),
]
