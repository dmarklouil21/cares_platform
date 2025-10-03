from django.db import models

from apps.patient.models import Patient
from apps.cancer_management.models import WellBeingAssessment

# Create your models here.

STATUS_CHOICES = [
  ('Pending', 'Pending'),
  ('Processing', 'Processing'),
  ('Recommendation', 'Recommendation'),
  ('Closed', 'Close'),
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

  wellbeing_assessment = models.OneToOneField(WellBeingAssessment, on_delete=models.CASCADE, null=True, blank=True)

  created_at = models.DateField(auto_now_add=True)

  def __str__(self):
    return f"Home Visit ({self.patient}) - {self.visit_date}"