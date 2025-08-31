from django.db import models
from apps.patient.models import Patient


class PreCancerousMedsRequest(models.Model):
  patient = models.ForeignKey(
    Patient,
    to_field='patient_id',
    db_column='patient_id',
    on_delete=models.CASCADE,
    related_name='precancerous_meds_requests'
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
    managed = False  # use existing table, avoid migrations for now

  def __str__(self):
    try:
      return f"PreCancerousMedsRequest for {self.patient.full_name}"
    except Exception:
      return f"PreCancerousMedsRequest #{self.pk}"
