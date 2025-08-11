from django.db import models
from apps.pre_enrollment.models import Beneficiary

# Create your models here.

SERVICE_CHOICES = [
  ('Cancer Screening', 'Cancer Screening'),
  ('Treatment Assistance', 'Treatment Assistance'),
]

""" class Application(models.Model):
  beneficiary = models.OneToOneField(Beneficiary, on_delete=models.CASCADE, null=True, blank=True, related_name='application')
  application_id = models.CharField(max_length=20, unique=True)
  service_type = models.CharField(max_length=100, choices=SERVICE_CHOICES)
  date_submitted = models.DateField(auto_now_add=True) """