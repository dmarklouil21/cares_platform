from django.db import models
from apps.patient.models import Patient
from apps.rhu.models import RHU, Rhuv2
from apps.partners.models import Private
from cloudinary.models import CloudinaryField

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
      ('Approved', 'Approve'),
      # ('LOA Generation', 'LOA Generation'), # To be removed
      # ('In Progress', 'In Progress'), To be removed
      ('Completed', 'Complete'),
      ('Rejected', 'Reject'),
    ],
    default='Pending'
  )
  service_provider = models.CharField(max_length=255, blank=True, null=True)
  date_approved = models.DateField(blank=True, null=True)
  date_completed = models.DateField(blank=True, null=True)
  # loa_generated = models.FileField(upload_to='attachments/loa/', blank=True, null=True)
  # uploaded_result = models.FileField(upload_to='attachments/result/', blank=True, null=True)
  uploaded_result = CloudinaryField('document', folder='attachments/cancer_screening_result/', resource_type='auto', blank=True, null=True)
  has_patient_response = models.BooleanField(default=False)
  response_description = models.CharField(max_length=255, blank=True, null=True)
  screening_date = models.DateField(blank=True, null=True)
  
  created_at = models.DateTimeField(auto_now_add=True)

class ScreeningAttachment(models.Model):
  individual_screening = models.ForeignKey(IndividualScreening, on_delete=models.CASCADE, related_name='screening_attachments')
  # file = models.FileField(upload_to='attachments/screening_files/')
  file = CloudinaryField('document', folder='attachments/cancer_screening/screening_documents', resource_type='auto')
  uploaded_at = models.DateTimeField(auto_now_add=True)

  doc_type = models.CharField(max_length=100, blank=True, null=True)

  def __str__(self):
    return f"Attachment for {self.individual_screening}"

class MassScreeningRequest(models.Model):
  """Represents an RHU-initiated mass screening request."""
  rhu = models.ForeignKey(Rhuv2, on_delete=models.CASCADE, related_name='mass_screening_requests', blank=True, null=True)
  private = models.ForeignKey(Private, on_delete=models.CASCADE, related_name='mass_screening_requests', blank=True, null=True)
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
    # rhu = self.__getattribute__('rhu')
    # private = self.__getattribute__('private')
    return f"{self.title}"

class MassScreeningAttachment(models.Model):
  request = models.ForeignKey(MassScreeningRequest, on_delete=models.CASCADE, related_name='attachments')
  # file = models.FileField(upload_to='attachments/mass_screening/')
  file = CloudinaryField('document', folder='attachments/mass_screening/screening_documents', resource_type='auto')
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
