from django.db import models
from apps.patient.models import Patient

# Create your models here.
# class ServiceType(models.TextChoices):
#   RADIOTHERAPY = "radiotherapy", "Radiation Therapy"
#   RADIOACTIVE = "radioactive_therapy", "Radioactive Therapy"
#   BRACHYTHERAPY = "brachytherapy", "Brachytherapy"
#   CHEMOTHERAPY = "chemotherapy", "Chemotherapy"
#   SURGERY = "surgery", "Surgery"

SERVICE_TYPE = [
  ('radiotherapy', 'Radiation Therapy'),
  ('radioactive_therapy', 'Radioactive Therapy'),
  ('brachytherapy', 'Brachytherapy'),
  ('chemotherapy', 'Chemotherapy'),
  ('surgery', 'Surgery')
]

class WellBeingAssessment(models.Model):
  assessment_date = models.DateField(auto_now_add=True)
  general_status = models.CharField(max_length=255, blank=True, null=True)
  improve = models.TextField(blank=True, null=True)  # free-text response
  created_at = models.DateTimeField(auto_now_add=True)

class WellBeingQuestion(models.Model):
  text_en = models.CharField(max_length=255)
  text_ceb = models.CharField(max_length=255)

  def __str__(self):
    return self.text_en

class WellBeingAnswer(models.Model):
  assessment = models.ForeignKey(
    WellBeingAssessment,
    on_delete=models.CASCADE,
    related_name="answers"
  )
  question = models.ForeignKey(
    WellBeingQuestion,
    on_delete=models.CASCADE,
    related_name="answers"
  )
  value = models.PositiveSmallIntegerField(
    choices=[(1, "Strongly Disagree"), (2, "Disagree"), (3, "Agree"), (4, "Strongly Agree")]
  )

  def __str__(self):
    return f"{self.assessment} - Q{self.question.id}: {self.value}"

class CancerTreatment(models.Model):
  patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='cancer_treatment')
  service_type = models.CharField(
    max_length=50,
    choices=SERVICE_TYPE
  )
  wellbeing_assessment = models.OneToOneField(WellBeingAssessment, on_delete=models.CASCADE)
  date_submitted = models.DateField(auto_now_add=True)
  date_approved = models.DateField(blank=True, null=True)
  date_completed = models.DateField(blank=True, null=True)
  status = models.CharField(
    max_length=50,
    choices=[
      ('Pending', 'Pending'),
      ('Approved', 'Approved'),
      ('In Progress', 'In Progress'),
      ('Completed', 'Completed'),
      ('Rejected', 'Rejected'),
    ],
    default='Pending'
  )
  uploaded_result = models.FileField(upload_to='attachments/result/', blank=True, null=True)

def service_document_path(instance, filename):
  return f"service_documents/{instance.cancer_treatment.service_type}/{instance.cancer_treatment.id}/{filename}"

class ServiceAttachment(models.Model):
  cancer_treatment = models.ForeignKey(
    CancerTreatment,
    on_delete=models.CASCADE,
    related_name="attachments"
  )
  file = models.FileField(upload_to=service_document_path)
  uploaded_at = models.DateTimeField(auto_now_add=True)

  # optional: track type (medical_cert, lab_results, etc.)
  doc_type = models.CharField(max_length=100, blank=True, null=True)

  def __str__(self):
    return f"Attachment for {self.cancer_treatment}"
