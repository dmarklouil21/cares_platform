from django.db import models

from apps.patient.models import Patient
from apps.cancer_management.models import WellBeingAssessment

from cloudinary.models import CloudinaryField

# Create your models here.

STATUS_CHOICES = [
  ('Pending', 'Pending'),
  ('Processing', 'Processing'),
  ('Recommendation', 'Recommendation'), # To be change to report generation
  ('Completed', 'Complete'),
  ('Closed', 'Close'),
]

HORMONAL_STATUS_CHOICES = [
  ('Pending', 'Pending'),
  ('Approved', 'Approve'),
  ('Completed', 'Complete'),
  ('Rejected', 'Reject'),
]
class PatientHomeVisit(models.Model):
  patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='home_visit')
  status = models.CharField(max_length=20, choices=STATUS_CHOICES)

  visit_date = models.DateField(null=True, blank=True)
  prepared_by = models.CharField(max_length=200)
  approved_by = models.CharField(max_length=200)

  signed_recommendation = models.FileField(upload_to='home_visit/signed_recommendation/', null=True, blank=True)

  purpose_of_visit = models.TextField(null=True, blank=True)
  findings = models.TextField(null=True, blank=True)
  recommendations = models.TextField(null=True, blank=True)

  has_patient_response = models.BooleanField(default=False)
  response_description = models.CharField(max_length=255, blank=True, null=True)

  wellbeing_assessment = models.OneToOneField(WellBeingAssessment, on_delete=models.CASCADE, null=True, blank=True)

  created_at = models.DateField(auto_now_add=True)

  def __str__(self):
    return f"Home Visit ({self.patient}) - {self.visit_date}"

class HormonalReplacement(models.Model):
  patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='hormonal_replacement')
  status = models.CharField(max_length=20, choices=HORMONAL_STATUS_CHOICES, default='Pending')

  released_date = models.DateField(null=True, blank=True)
  # doctors_prescription = models.FileField(upload_to='survivorship/hormonal_replacement/doctor_prescription/')
  service_completed = models.CharField(max_length=100)
  date_submitted = models.DateField(auto_now_add=True)
  date_approved = models.DateField(blank=True, null=True)
  medicines_requested = models.CharField(max_length=255)

  has_patient_response = models.BooleanField(default=False)
  response_description = models.CharField(max_length=255, blank=True, null=True)

class HormonalReplacementRequiredAttachment(models.Model):
  hormonal_replacement = models.ForeignKey(HormonalReplacement, on_delete=models.CASCADE, related_name='required_attachments')
  # file = models.FileField(upload_to='attachments/hormonal_replacement/')
  file = CloudinaryField('document', folder='attachments/hormonal_replacement/required_documents', resource_type='auto')
  uploaded_at = models.DateTimeField(auto_now_add=True)

  doc_type = models.CharField(max_length=100, blank=True, null=True)

  def __str__(self):
    return f"Attachment for {self.hormonal_replacement}"