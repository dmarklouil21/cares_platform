from django.urls import path
from . import views
from apps.precancerous import views as precancerous_views

urlpatterns = [
  path('list/', views.PostTreatmentListView.as_view(), name='post_treatment_list'),
  path('view/<int:id>/', views.PostTreatmentDetailedView.as_view(), name='post_treatment_view'),
  path('approve/<int:id>/', views.PostTreatmentApproveView.as_view(), name='post_treatment_approve'),
  path('update/<int:id>/', views.PostTreatmentUpdateView.as_view(), name='post_treatment_update'),
  path('followup-checkups/mark-as-done/<int:id>/', views.PostTreatmentCheckupUpdateView.as_view(), name='followup_checkup_mark_as_done'),
  path('followup-checkups/reschedule/<int:id>/', views.PostTreatmentRescheduleCheckupUpdateView.as_view(), name='reschedule_followup_checkup'),
  path('cancel-schedule/<int:id>/', views.PostTreatmentScheduleCancelView.as_view(), name='cancel_schedule'),
  path('record/delete/<int:id>/', views.PostTreatmentDeleteView.as_view(), name='delete_record'),
  path('send-loa/', views.SendLOAView.as_view(), name='send_loa'),
]