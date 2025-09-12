from django.db import models
from apps.patient.models import Patient

# Create your models here.

class DiagnosisBasis(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

class PrimarySite(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

class DistantMetastasisSite(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

class TreatmentOption(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

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
      ('LOA Generation', 'LOA Generation'), # To be removed
      ('In Progress', 'In Progress'),
      ('Complete', 'Complete'),
      ('Reject', 'Reject'),
    ],
    default='Pending'
  )
  date_approved = models.DateField(blank=True, null=True)
  date_completed = models.DateField(blank=True, null=True)
  loa_generated = models.FileField(upload_to='attachments/loa/', blank=True, null=True)
  # loa_uploaded = models.FileField(upload_to='attachments/loa/', blank=True, null=True)
  uploaded_result = models.FileField(upload_to='attachments/result/', blank=True, null=True)
  has_patient_response = models.BooleanField(default=False)
  response_description = models.CharField(max_length=255, blank=True, null=True)
  screening_date = models.DateField(blank=True, null=True)
  
  created_at = models.DateTimeField(auto_now_add=True)

# To be deleted
class PreScreeningForm(models.Model):
  individual_screening = models.OneToOneField(IndividualScreening, on_delete=models.CASCADE, related_name='pre_screening_form', null=True)
  referred_from = models.CharField(max_length=255, blank=True)
  referring_doctor_or_facility = models.CharField(max_length=255, blank=True)
  reason_for_referral = models.TextField(blank=True)
  chief_complaint = models.TextField(blank=True)
  date_of_consultation = models.DateField(null=True, blank=True)
  date_of_diagnosis = models.DateField(null=True, blank=True)

  # Diagnosis
  diagnosis_basis = models.ManyToManyField(DiagnosisBasis, blank=True)
  multiple_primaries = models.PositiveSmallIntegerField(null=True, blank=True)
  primary_sites = models.ManyToManyField(PrimarySite, blank=True)
  primary_sites_other = models.CharField(max_length=255, blank=True)

  laterality = models.CharField(
    max_length=50,
    choices=[
      ('Left', 'Left'), ('Right', 'Right'), ('Not Stated', 'Not Stated'),
      ('Bilateral', 'Bilateral'), ('Mild', 'Mild')
    ],
    blank=True
  )

  histology = models.CharField(max_length=255, blank=True)

  # Staging
  staging = models.CharField(
    max_length=50,
    choices=[
      ('In-Situ', 'In-Situ'), ('Localized', 'Localized'), ('Direct Extension', 'Direct Extension'),
      ('Regional Lymph Node', 'Regional Lymph Node'), ('3+4', '3+4'), ('Distant Metastasis', 'Distant Metastasis'),
      ('Unknown', 'Unknown')
    ],
    blank=True
  )

  # TNM System
  t_system = models.CharField(max_length=2, blank=True)
  n_system = models.CharField(max_length=2, blank=True)
  m_system = models.CharField(max_length=2, blank=True)

  distant_metastasis_sites = models.ManyToManyField(DistantMetastasisSite, blank=True)
  distant_metastasis_sites_other = models.CharField(max_length=255, blank=True)

  final_diagnosis = models.TextField(blank=True)
  final_diagnosis_icd10 = models.CharField(max_length=50, blank=True)

  # Treatment
  treatment_purpose = models.CharField(
    max_length=50,
    choices=[
      ('Curative-Complete', 'Curative-Complete'),
      ('Curative-Incomplete', 'Curative-Incomplete'),
      ('Palliative Only', 'Palliative Only')
    ],
    blank=True
  )
  treatment_purpose_other = models.CharField(max_length=255, blank=True)

  primary_assistance_by_ejacc = models.CharField(max_length=255, blank=True)
  date_of_assistance = models.DateField(null=True, blank=True)

  adjuvant_treatments_received = models.ManyToManyField(
    TreatmentOption,
    related_name='adjuvant_treatments',
    blank=True
  )
  adjuvant_treatments_other = models.CharField(max_length=255, blank=True)

  other_source_treatments = models.ManyToManyField(
    TreatmentOption,
    related_name='other_source_treatments',
    blank=True
  )
  other_source_treatments_other = models.CharField(max_length=255, blank=True)

  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"Cancer Screening - {self.referred_from or 'Unknown'}"

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
