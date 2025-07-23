from django.db import models
from apps.pre_enrollment.models import Beneficiary

# Create your models here.
class Patient(models.Model):
    beneficiary = models.OneToOneField(Beneficiary, on_delete=models.CASCADE, related_name='patient')
    patient_id = models.CharField(max_length=20, unique=True)
    date_diagnosed = models.DateField(blank=True, null=True)
    diagnosis = models.CharField(max_length=255, blank=True, null=True)
    cancer_stage = models.CharField(max_length=50, blank=True, null=True)
    cancer_site = models.CharField(max_length=100, blank=True, null=True)
    # patient_historical_update = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        ordering = ['beneficiary__last_name', 'beneficiary__first_name']

    @property
    def full_name(self):
        return f'{self.beneficiary.first_name} {self.beneficiary.last_name}'.strip()

    def __str__(self):
        return f"Patient: {self.beneficiary.first_name} {self.beneficiary.last_name} (ID: {self.patient_id})"
