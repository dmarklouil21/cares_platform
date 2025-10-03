from rest_framework import serializers
from django.shortcuts import get_object_or_404

from apps.patient.models import Patient
from apps.patient.serializers import PatientSerializer

from apps.cancer_management.models import (
    WellBeingAssessment, WellBeingQuestion, WellBeingAnswer
)
from apps.cancer_management.serializers import WellBeingAssessmentSerializer
from .models import PatientHomeVisit


class HomevisitSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(write_only=True)
    well_being_data = serializers.DictField(write_only=True, required=False)

    # Read-only nested serializers for viewing
    patient = PatientSerializer(read_only=True)
    wellbeing_assessment = WellBeingAssessmentSerializer(read_only=True)

    class Meta:
        model = PatientHomeVisit
        fields = [
            "id",
            "patient_id",
            "patient",
            "wellbeing_assessment",
            "visit_date",
            "status",
            "prepared_by",
            "approved_by",
            "purpose_of_visit",
            "findings",
            "recommendations",
            "signed_recommendation",
            "well_being_data",
        ]
        extra_kwargs = {
            "visit_date": {"required": False, "allow_null": True},
            "purpose_of_visit": {"required": False, "allow_blank": True, "allow_null": True},
            "findings": {"required": False, "allow_blank": True, "allow_null": True},
            "recommendations": {"required": False, "allow_blank": True, "allow_null": True},
            "signed_recommendation": {"required": False, "allow_null": True},
            "status": {"read_only": True},  # we set this manually
            "created_at": {"read_only": True},
        }

    def create(self, validated_data):
        well_being_data = validated_data.pop("well_being_data", {})
        patient_id = validated_data.pop("patient_id")

        patient = get_object_or_404(Patient, patient_id=patient_id)

        assessment = None
        if well_being_data:
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

        # 3. Create Homevisit record
        home_visit = PatientHomeVisit.objects.create(
            patient=patient,
            wellbeing_assessment=assessment,
            status="Pending",  # always default
            **validated_data
        )

        return home_visit
