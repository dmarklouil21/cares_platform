from django.db import models
from apps.patient.models import Patient
from apps.rhu.models import RHU

# Create your models here.

class IndividualScreening(models.Model):
  patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='individual_screening')
  procedure_name = models.CharField(max_length=100, null=True, blank=True)
  procedure_details = models.CharField(max_length=200, null=True, blank=True)
  cancer_site = models.CharField(max_length=100, null=True, blank=True)

  status = models.CharField(
    max_length=50,
    choices=[
      ('Pending', 'Pending'),
      ('Approve', 'Approve'),
      # ('LOA Generation', 'LOA Generation'), # To be removed
      ('In Progress', 'In Progress'),
      ('Complete', 'Complete'),
      ('Reject', 'Reject'),
    ],
    default='Pending'
  )
  date_approved = models.DateField(blank=True, null=True)
  date_completed = models.DateField(blank=True, null=True)
  # loa_generated = models.FileField(upload_to='attachments/loa/', blank=True, null=True)
  uploaded_result = models.FileField(upload_to='attachments/result/', blank=True, null=True)
  has_patient_response = models.BooleanField(default=False)
  response_description = models.CharField(max_length=255, blank=True, null=True)
  screening_date = models.DateField(blank=True, null=True)
  
  created_at = models.DateTimeField(auto_now_add=True)

class ScreeningAttachment(models.Model):
  individual_screening = models.ForeignKey(IndividualScreening, on_delete=models.CASCADE, related_name='screening_attachments')
  file = models.FileField(upload_to='attachments/screening_files/')
  uploaded_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"Attachment for {self.individual_screening}"

class PreCancerousMedsRequest(models.Model):
  patient = models.ForeignKey(
    Patient,
    to_field='patient_id',
    db_column='patient_id',
    on_delete=models.CASCADE,
    related_name='precancerous_meds_requests_legacy',
    related_query_name='precancerous_meds_request_legacy'
  )
  lgu_name = models.CharField(max_length=255)
  date = models.DateField()
  contact_number = models.CharField(max_length=50, blank=True)
  prepared_by = models.CharField(max_length=255)
  approved_by = models.CharField(max_length=255)
  last_name = models.CharField(max_length=100)
  first_name = models.CharField(max_length=100)
  middle_initial = models.CharField(max_length=2, blank=True)
  date_of_birth = models.DateField()
  interpretation_of_result = models.CharField(
    max_length=50,
    choices=[
      ('Negative', 'Negative'),
      ('ASC-US', 'ASC-US'),
      ('HPV Positive', 'HPV Positive'),
      ('Unsatisfactory', 'Unsatisfactory'),
      ('Other', 'Other'),
    ]
  )
  status = models.CharField(max_length=20, default='Pending')
  release_date_of_meds = models.DateField(null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    db_table = 'cancer_screening_precancerousmedsrequest'
    managed = False

  def __str__(self):
    return f"PreCancerousMedsRequest for {self.patient.full_name}"

class MassScreeningRequest(models.Model):
  """Represents an RHU-initiated mass screening request."""
  rhu = models.ForeignKey(RHU, on_delete=models.CASCADE, related_name='mass_screening_requests')
  title = models.CharField(max_length=255)
  venue = models.CharField(max_length=255)
  date = models.DateField()
  beneficiaries = models.CharField(max_length=255, blank=True, null=True)
  description = models.TextField(blank=True, null=True)
  support_need = models.TextField(blank=True, null=True)

  status = models.CharField(
    max_length=20,
    choices=[('Pending', 'Pending'), ('Verified', 'Verified'), ('Rejected', 'Rejected'), ('Done', 'Done')],
    default='Pending'
  )

  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering = ['-created_at']

  def __str__(self):
    return f"{self.title} ({self.rhu.lgu})"

class MassScreeningAttachment(models.Model):
  request = models.ForeignKey(MassScreeningRequest, on_delete=models.CASCADE, related_name='attachments')
  file = models.FileField(upload_to='attachments/mass_screening/')
  uploaded_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"Attachment for {self.request_id} - {self.file.name}"

class MassScreeningAttendanceEntry(models.Model):
  """Attendance entry for a Mass Screening request."""
  request = models.ForeignKey(MassScreeningRequest, on_delete=models.CASCADE, related_name='attendance_entries')
  name = models.CharField(max_length=255)
  result = models.CharField(max_length=255, blank=True, null=True)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering = ['id']

  def __str__(self):
    return f"{self.name} - {self.result or ''}"
