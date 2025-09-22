from rest_framework import serializers
from .models import (
  # ServiceType,
  WellBeingAssessment,
  WellBeingQuestion,
  WellBeingAnswer,
  CancerTreatment,
  ServiceAttachment,
)
from apps.patient.serializers import PatientSerializer

class WellBeingQuestionSerializer(serializers.ModelSerializer):
  class Meta:
    model = WellBeingQuestion
    fields = ["id", "text_en", "text_ceb"]

class WellBeingAnswerSerializer(serializers.ModelSerializer):
  question = WellBeingQuestionSerializer(read_only=True)

  class Meta:
    model = WellBeingAnswer
    fields = ["id", "question", "value"]

class WellBeingAssessmentSerializer(serializers.ModelSerializer):
  answers = WellBeingAnswerSerializer(many=True, read_only=True)

  class Meta:
    model = WellBeingAssessment
    fields = [
      "id",
      "assessment_date",
      "general_status",
      "improve",
      "answers",
      "created_at",
    ]

class ServiceAttachmentSerializer(serializers.ModelSerializer):
  class Meta:
    model = ServiceAttachment
    fields = ["id", "file", "uploaded_at", "doc_type"]

class CancerTreatmentSerializer(serializers.ModelSerializer):
  patient = PatientSerializer(read_only=True)
  wellbeing_assessment = WellBeingAssessmentSerializer(read_only=True)
  attachments = ServiceAttachmentSerializer(many=True, read_only=True)

  class Meta:
    model = CancerTreatment
    fields = [
      "id",
      "patient",
      "service_type",
      "wellbeing_assessment",
      "interview_date",
      "treatment_date",
      "date_submitted",
      "date_approved",
      "date_completed",
      "status",
      "uploaded_result",
      "attachments",
      'has_patient_response',
      'response_description',
    ]

class CancerTreatmentSubmissionSerializer(serializers.Serializer):
  files = serializers.DictField(
    child=serializers.FileField(),
    required=False
  )
  well_being_data = serializers.DictField(write_only=True)

  def create(self, validated_data):
    files = validated_data.pop("files", {})
    well_being_data = validated_data.pop("well_being_data", {})

    request = self.context.get("request")
    patient = getattr(request.user, "patient", None)  # adjust if you fetch patient differently

    # 1. Create WellBeingAssessment
    assessment = WellBeingAssessment.objects.create(
      general_status=well_being_data.get("generalStatus"),
      improve=well_being_data.get("improve"),
    )

    # 2. Create WellBeingAnswers
    answers = well_being_data.get("answers", {})
    for q_id, value in answers.items():
      try:
        q = WellBeingQuestion.objects.get(id=q_id)
        WellBeingAnswer.objects.create(
          assessment=assessment,
          question=q,
          value=value,
        )
      except WellBeingQuestion.DoesNotExist:
        continue

    # 3. Create CancerTreatment
    cancer_treatment = CancerTreatment.objects.create(
      patient=patient,  # pass patient from view
      service_type=well_being_data.get('serviceType'), 
      wellbeing_assessment=assessment,
      status="Pending"
    )

    # 4. Save ServiceAttachments
    for key, file in files.items():
      ServiceAttachment.objects.create(
        cancer_treatment=cancer_treatment,
        file=file,
        doc_type=key 
      )
    return cancer_treatment


# for doc_type, f in files.items():
    #   ServiceAttachment.objects.create(
    #     cancer_treatment=cancer_treatment,
    #     file=f,
    #     doc_type=doc_type
    #   )