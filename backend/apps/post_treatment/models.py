from django.db import models

from apps.patient.models import Patient

# Create your models here.
class PostTreatment(models.Model):
  patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='post_treatment')
  procedure_name = models.CharField(max_length=100, null=True, blank=True)

  status = models.CharField(
    max_length=50,
    choices=[
      ('Pending', 'Pending'),
      ('Approved', 'Approve'),
      ('Completed', 'Complete'),
      ('Follow-up Required', 'Follow-up Required'),
      ('Closed', 'Close'),
      ('Rejected', 'Reject'),
    ],
    default='Pending'
  )
  date_approved = models.DateField(blank=True, null=True)
  date_completed = models.DateField(blank=True, null=True)
  # loa_generated = models.FileField(upload_to='attachments/loa/', blank=True, null=True)
  uploaded_result = models.FileField(upload_to='attachments/result/', blank=True, null=True)
  has_patient_response = models.BooleanField(default=False)
  response_description = models.CharField(max_length=255, blank=True, null=True)
  laboratory_test_date = models.DateField(blank=True, null=True)
  service_provider = models.CharField(max_length=255, blank=True, null=True)
  created_at = models.DateTimeField(auto_now_add=True)

class RequiredAttachment(models.Model):
  post_treatment = models.ForeignKey(PostTreatment, on_delete=models.CASCADE, related_name='required_attachments')
  file = models.FileField(upload_to='attachments/post_treatment_files/')
  uploaded_at = models.DateTimeField(auto_now_add=True)

  doc_type = models.CharField(max_length=100, blank=True, null=True)

  def __str__(self):
    return f"Attachment for {self.post_treatment}"
  
class FollowupCheckups(models.Model):
  post_treatment = models.ForeignKey(PostTreatment, on_delete=models.CASCADE, related_name='followup_checkups')
  date = models.DateField(blank=True, null=True)
  note = models.CharField(max_length=255, blank=True, null=True)

  status = models.CharField(
    max_length=50,
    choices=[
      ('Pending', 'Pending'),
      ('Completed', 'Completed'),
    ],
    default='Pending'
  )

  date_completed = models.DateField(blank=True, null=True)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    verbose_name = 'FollowupCheckup'
    verbose_name_plural = 'FollowupCheckups'

  def __str__(self):
    return f"Checkup for {self.post_treatment.patient.full_name} on {self.date}: {self.note or 'No note'}"
