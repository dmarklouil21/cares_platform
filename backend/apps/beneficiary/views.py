from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils.timezone import now

from rest_framework import generics, status
from rest_framework import filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from apps.user.models import User
from apps.notifications.utils import create_notification

from apps.patient.models import Patient, CancerDiagnosis
from apps.patient.serializers import PreScreeningFormSerializer

from apps.partners.models import CancerAwarenessActivity
from apps.partners.serializers import CancerAwarenessActivitySerializer

from apps.cancer_screening.models import ScreeningAttachment, IndividualScreening 
from apps.cancer_screening.serializers import (
  IndividualScreeningSerializer, 
  ScreeningAttachmentSerializer,
  # PreCancerousMedsRequestSerializer
)

from apps.precancerous.models import PreCancerousMedsRequest
from apps.precancerous.serializers import PreCancerousMedsRequestSerializer

from apps.post_treatment.models import PostTreatment, RequiredAttachment
from apps.post_treatment.serializers import PostTreatmentSerializer, RequiredAttachmentSerializer

from apps.cancer_management.models import CancerTreatment, ServiceAttachment
from apps.cancer_management.serializers import CancerTreatmentSubmissionSerializer, CancerTreatmentSerializer

from apps.survivorship.models import PatientHomeVisit, HormonalReplacement, HormonalReplacementRequiredAttachment
from apps.survivorship.serializers import HomevisitSerializer, HormonalReplacementSerializer

from .serializers import PatientSerializer, PreEnrollmentSerializer

import logging, json

logger = logging.getLogger(__name__)

# ----------------------------
# Patient Pre Enrollment Views
# ----------------------------
class PreEnrollmentView(generics.CreateAPIView):
  queryset = Patient.objects.all()
  serializer_class = PreEnrollmentSerializer

  def create(self, request, *args, **kwargs):
    # --- Step 1: Extract and validate incoming data ---
    try:
      cancer_data_raw = request.data.get("cancer_data")
      general_data_raw = request.data.get("general_data")

      if not cancer_data_raw or not general_data_raw:
        raise ValidationError({"detail": "Both 'Pre Screening Form' and 'Patient Profile' are required."})

      cancer_data = json.loads(cancer_data_raw)
      general_data = json.loads(general_data_raw)

    except json.JSONDecodeError:
      raise ValidationError({"detail": "Invalid JSON format in 'Pre Screening Form' or 'Patient Profile'."})

    # --- Step 2: Check if patient already exists (PreEnrollment duplicate prevention) ---
    # Adjust these fields depending on your Patient model
    first_name = general_data.get("first_name")
    last_name = general_data.get("last_name")
    birth_date = general_data.get("date_of_birth")

    if not all([first_name, last_name, birth_date]):
      raise ValidationError({"detail": "Missing patient identifiers (first_name, last_name, or date_of_birth)."})

    existing_patient = Patient.objects.filter(
      first_name__iexact=first_name.strip(),
      last_name__iexact=last_name.strip(),
      date_of_birth=birth_date
    ).first()

    if existing_patient:
      raise ValidationError(
        {"non_field_errors": ["A pre-enrollment record for this patient already exists."]},
      )

    # --- Step 3: Validate and save via serializer ---
    serializer = self.get_serializer(
      data={"general_data": general_data, "cancer_data": cancer_data},
      context={"request": request}
    )
    serializer.is_valid(raise_exception=True)

    # --- Step 4: Save everything atomically ---
    with transaction.atomic():
      result = serializer.save()

      patient = result["general_data"]
      cancer_info = result["cancer_data"]

      # Create cancer diagnosis
      CancerDiagnosis.objects.create(
        patient=patient,
        diagnosis=cancer_info.final_diagnosis,
        date_diagnosed=cancer_info.date_of_diagnosis,
        cancer_site=", ".join(cancer_info.primary_sites.values_list("name", flat=True)),
        cancer_stage=cancer_info.staging,
      )

      # Optional photo upload
      photo_file = request.FILES.get("photoUrl")
      if photo_file:
        patient.photo_url = photo_file
        patient.save(update_fields=["photo_url"])

      all_admin = User.objects.filter(is_superuser=True)

      create_notification(all_admin, 'New Pre Enrollment Request', f'A new beneficiary ({first_name}) sent a pre enrollment request.')
    # --- Step 5: Return structured response ---
    return Response(
      self.get_serializer(result).data,
      status=status.HTTP_201_CREATED
    )

# class PreEnrollmentView(generics.CreateAPIView):
#   queryset = Patient.objects.all() 
#   serializer_class = PreEnrollmentSerializer

#   def create(self, request, *args, **kwargs):
#     cancer_data = json.loads(request.data.get("cancer_data", "{}"))
#     general_data = json.loads(request.data.get("general_data", "{}"))

#     serializer = self.get_serializer(
#       data={"general_data": general_data, "cancer_data": cancer_data},
#       context={"request": request}
#     )

#     serializer.is_valid(raise_exception=True)
#     result = serializer.save()

#     patient = result["general_data"]  # extract patient
#     cancer_data = result["cancer_data"]

#     CancerDiagnosis.objects.create(
#       patient=patient,
#       diagnosis=cancer_data.final_diagnosis,
#       date_diagnosed=cancer_data.date_of_diagnosis,
#       cancer_site=", ".join(cancer_data.primary_sites.values_list("name", flat=True)),
#       cancer_stage=cancer_data.staging,
#     )

#     photo_url = self.request.FILES.get('photoUrl')
#     if photo_url:
#       patient.photo_url = photo_url
#       patient.save()
    
#     # serialize again to return structured data
#     return Response(
#       self.get_serializer(result).data,
#       status=status.HTTP_201_CREATED
#     )

class PatientDetailView(generics.RetrieveAPIView):
  serializer_class = PatientSerializer
  permission_classes = [IsAuthenticated]

  def get_object(self):
    try:
      return Patient.objects.get(user=self.request.user)
    except Patient.DoesNotExist:
      raise NotFound("No patient record found for this user.")

# ---------------------------------
# Cancer Awareness Activities Views
# ---------------------------------
class CancerAwarenessActivityListView(generics.ListAPIView):
  queryset = CancerAwarenessActivity.objects.all()
  serializer_class = CancerAwarenessActivitySerializer
  permission_classes = [IsAuthenticated]

# ---------------------------------------------
# Cancer Screening - Individual Screening Views
# ---------------------------------------------
class IndividualScreeningRequestView(generics.CreateAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        existing_request = IndividualScreening.objects.filter(
          patient=self.request.user.patient, 
          status__in=['Pending', 'Approved'],
          # has_patient_response=True
        ).first()

        if existing_request:
          raise ValidationError({
            'non_field_errors': [
              "You already have an ongoing request. Please wait for its feedback before submitting another."
            ]
          })
    
        instance = serializer.save(
          patient=self.request.user.patient,  # ensure patient is set
          # has_patient_response=True,
          # response_description='Submitted screening procedure'
        )

        files_dict = {}
        for key, value in self.request.FILES.items():
          if key.startswith("files."):
            field_name = key.split("files.")[1] 
            files_dict[field_name] = value

        for key, file in files_dict.items():
          ScreeningAttachment.objects.create(
            individual_screening=instance,
            file=file,
            doc_type=key 
          )

    except Exception as e:
      logger.error(f"Error creating screening procedure: {str(e)}")
      raise e

class IndividualScreeningUpdateView(generics.UpdateAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def perform_update(self, serializer):
    instance = self.get_object()

    if instance.has_patient_response:
      raise ValidationError({
        'non_field_errors': [
          "You already resubmitted your request. Please wait for its feedback before submitting again."
        ]
      })

    try:
      with transaction.atomic():
        # Save the updated screening info
        instance = serializer.save(
          has_patient_response=True,
          response_description='Resubmitted cancer screening request',
          status='Pending'
        )

        # Handle uploaded files
        files_dict = {
          key.split("files.")[1]: value
          for key, value in self.request.FILES.items()
          if key.startswith("files.")
        }

        for key, file in files_dict.items():
          # Remove any existing attachment of the same type for this screening
          ScreeningAttachment.objects.filter(
              individual_screening=instance,
              doc_type=key
          ).delete()
          
          ScreeningAttachment.objects.create(
            individual_screening=instance,
            file=file,
            doc_type=key
          )

    except Exception as e:
      logger.error(f"Error during resubmission: {str(e)}")
      raise ValidationError({"non_field_errors": ["An error occurred while resubmitting the request."]})
 
class IndividualScreeningListView(generics.ListAPIView):
  serializer_class = IndividualScreeningSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    user = self.request.user
    patient = get_object_or_404(Patient, user=user)
    # patient_id = self.kwargs.get("patient_id")
    return IndividualScreening.objects.filter(patient=patient)

class IndividualScreeningDetailView(generics.RetrieveAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

class IndividualScreeningCancelRequestView(generics.DestroyAPIView):
  queryset = IndividualScreening.objects.all()
  serializer_class = IndividualScreeningSerializer
  lookup_field = 'id'

  permission_classes = [IsAuthenticated]

class LOAAttachmentUploadView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def patch(self, request, procedure_id):
    individual_screening = get_object_or_404(IndividualScreening, id=procedure_id)

    if individual_screening.has_patient_response:
      raise ValidationError ({'non_field_errors': ['You can only submit once. Please wait for it\'s feedback before submitting again.']})
    
    attachments = request.FILES.getlist('attachments')

    individual_screening.has_patient_response = True
    individual_screening.response_description = 'Submitted (LOA) Letter of Authority'
    individual_screening.save()

    for file in attachments:
      validate_attachment(file)
      ScreeningAttachment.objects.create(
        individual_screening=individual_screening,
        file=file
      )

    return Response({"message": "Attachments updated successfully."}, status=status.HTTP_200_OK)
  
class ResultAttachmentUploadView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def patch(self, request, screening_id):
    individual_screening = get_object_or_404(IndividualScreening, id=screening_id)
    # individual_screening = get_object_or_404(IndividualScreening, screening_procedure=screening_procedure)

    if individual_screening.uploaded_result and not request.user.is_superuser:
      raise ValidationError ({'non_field_errors': ['You can only submit once. Please wait for it\'s feedback before submitting again.']})
    
    attachments = request.FILES.getlist('screening_attachments')

    validate_attachment(attachments[0])

    individual_screening.uploaded_result = attachments[0]
    individual_screening.has_patient_response = True
    individual_screening.response_description = 'Uploaded screening results.'
    individual_screening.save()

    return Response({"message": "Attachments updated successfully."}, status=status.HTTP_200_OK)
  
# -----------------------
# Cancer Management Views
# -----------------------
class CancerTreatmentSubmissionView(generics.CreateAPIView):
  queryset = CancerTreatment.objects.all()
  serializer_class = CancerTreatmentSubmissionSerializer

  def create(self, request, *args, **kwargs):
    try:
      existing_request = CancerTreatment.objects.filter(
        patient=self.request.user.patient, 
      ).first()

      if existing_request and existing_request.status != 'Completed':
        raise ValidationError({
          'non_field_errors': [
            "You can only request for a treatment service one at a time. Please wait for its feedback before submitting another."
          ]
        })
      
      # Convert stringified JSON into dict
      well_being_data = json.loads(request.data.get("well_being_data", "{}"))
    
      files_dict = {}
      for key, value in request.FILES.items():
        if key.startswith("files."):
          field_name = key.split("files.")[1]  # e.g. "quotation"
          files_dict[field_name] = value

      serializer = self.get_serializer(
        data={
            "well_being_data": well_being_data,
            "files": files_dict
        },
        context={"request": request}
      )
      serializer.is_valid(raise_exception=True)
      result = serializer.save()
      response_data = CancerTreatmentSerializer(result, context={"request": request}).data

      return Response({"message": "Success", "data": response_data}, status=status.HTTP_201_CREATED)

    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class CancerManagementDetailedView(generics.RetrieveAPIView):
  queryset = CancerTreatment.objects.all()
  serializer_class = CancerTreatmentSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_object(self):
    return CancerTreatment.objects.get(patient=self.request.user.patient)

  # def get_queryset(self):
  #   qs = CancerTreatment.objects.all()

  #   status_filter = self.request.query_params.get('status')
  #   if status_filter:
  #     qs = qs.filter(status=status_filter)

  #   patient_id = self.request.query_params.get('patient_id')
  #   if patient_id:
  #     qs = qs.filter(patient__patient_id=patient_id)

  #   return qs 

class CancerManagementUpdateView(generics.UpdateAPIView):
  queryset = CancerTreatment.objects.all()
  serializer_class = CancerTreatmentSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def perform_update(self, serializer):
    instance = self.get_object()

    if instance.has_patient_response:
      raise ValidationError({
        'non_field_errors': [
          "You already resubmitted your request. Please wait for its feedback before submitting again."
        ]
      })

    try:
      with transaction.atomic():
        # Save the updated screening info
        instance = serializer.save(
          has_patient_response=True,
          response_description='Resubmitted treatment service request',
          status='Pending'
        )

        # Handle uploaded files
        files_dict = {
          key.split("files.")[1]: value
          for key, value in self.request.FILES.items()
          if key.startswith("files.")
        }

        for key, file in files_dict.items():
          # Remove any existing attachment of the same type for this screening
          ServiceAttachment.objects.filter(
              cancer_treatment=instance,
              doc_type=key
          ).delete()
          
          ServiceAttachment.objects.create(
            cancer_treatment=instance,
            file=file,
            doc_type=key
          )

    except Exception as e:
      logger.error(f"Error during resubmission: {str(e)}")
      raise ValidationError({"non_field_errors": ["An error occurred while resubmitting the request."]}) 
  
class CancerManagementListView(generics.ListAPIView):
  serializer_class = CancerTreatmentSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    user = self.request.user
    patient = get_object_or_404(Patient, user=user)
    return CancerTreatment.objects.filter(patient=patient)

class CancerManagementCancelRequestView(generics.DestroyAPIView):
  queryset = CancerTreatment.objects.all()
  serializer_class = CancerTreatmentSerializer
  lookup_field = 'id'

  permission_classes = [IsAuthenticated]

class TreatmentResultUploadView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def patch(self, request, id):
    cancer_treatment = get_object_or_404(CancerTreatment, id=id)
    # individual_screening = get_object_or_404(IndividualScreening, screening_procedure=screening_procedure)

    # if individual_screening.uploaded_result and not request.user.is_superuser:
    #   raise ValidationError ({'non_field_errors': ['You can only submit once. Please wait for it\'s feedback before submitting again.']})
    
    attachments = request.FILES.getlist('attachments')
    print('Attachments: ', attachments)

    validate_attachment(attachments[0])

    cancer_treatment.uploaded_result = attachments[0]
    cancer_treatment.has_patient_response = True
    cancer_treatment.response_description = 'Uploaded treatment results.'
    cancer_treatment.save()

    return Response({"message": "Attachments updated successfully."}, status=status.HTTP_200_OK)
  
class CaseSummaryUploadView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def patch(self, request, id):
    cancer_treatment = get_object_or_404(CancerTreatment, id=id)

    existing_attachments = ServiceAttachment.objects.filter(
      cancer_treatment=cancer_treatment,
      doc_type="signedCaseSummary"
    )
    if cancer_treatment.has_patient_response and existing_attachments.exists() and not request.user.is_superuser: 
      raise ValidationError ({'non_field_errors': ['You can only submit once. Please wait for it\'s feedback before submitting again.']})
    
    attachments = request.FILES.getlist('attachments')
    for file in attachments:
      validate_attachment(file)
      ServiceAttachment.objects.create(
        cancer_treatment=cancer_treatment,
        file=file,
        doc_type="signedCaseSummary"
      )
    
    cancer_treatment.has_patient_response = True
    cancer_treatment.response_description = 'Uploaded signed case summary & intervention plan.'
    cancer_treatment.save()

    return Response({"message": "Attachments updated successfully."}, status=status.HTTP_200_OK)

# -----------------------
# Pre Cancerous Views
# -----------------------
class PreCancerousMedsCreateView(generics.CreateAPIView):
  queryset = PreCancerousMedsRequest.objects.all()
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        existing_request = PreCancerousMedsRequest.objects.filter(
          patient=self.request.user.patient,
          status__in=['Pending', 'Approved']
        ).first()

        if existing_request:
          raise ValidationError({
            'non_field_errors': [
              "You already have an ongoing request. Please wait for its feedback before submitting another."
            ]
          })
    
        instance = serializer.save(
          patient=self.request.user.patient,  # ensure patient is set
          # has_patient_response=True,
          # response_description='Submitted post treatment laboratory test request'
        )

    except Exception as e:
      logger.error(f"Error creating pre-cancerous meds request: {str(e)}")
      raise e

class PreCancerousMedsListView(generics.ListAPIView):
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    patient = get_object_or_404(Patient, user=self.request.user)
    return PreCancerousMedsRequest.objects.filter(patient=patient).order_by('-created_at')

class PreCancerousMedsDetailView(generics.RetrieveAPIView):
  serializer_class = PreCancerousMedsRequestSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def get_queryset(self):
    patient = get_object_or_404(Patient, user=self.request.user)
    return PreCancerousMedsRequest.objects.filter(patient=patient)

class PreCancerousMedsCancelView(generics.DestroyAPIView):
  queryset = PreCancerousMedsRequest.objects.all()
  serializer_class = PreCancerousMedsRequestSerializer
  lookup_field = 'id'

  permission_classes = [IsAuthenticated]
# class PreCancerousMedsCancelView(APIView):
#   permission_classes = [IsAuthenticated]

#   def post(self, request, id):
#     patient = get_object_or_404(Patient, user=request.user)
#     obj = get_object_or_404(PreCancerousMedsRequest, id=id, patient=patient)

#     if obj.status != 'Pending':
#       return Response({
#         'detail': 'Only Pending applications can be cancelled.'
#       }, status=status.HTTP_400_BAD_REQUEST)

#     obj.status = 'Cancelled'
#     obj.save(update_fields=['status'])

#     return Response(PreCancerousMedsRequestSerializer(obj).data, status=status.HTTP_200_OK)

# -----------------------
# Post Treatment Views
# -----------------------
class PostTreatmentRequestView(generics.CreateAPIView):
  queryset = PostTreatment.objects.all()
  serializer_class = PostTreatmentSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        existing_request = PostTreatment.objects.filter(
          patient=self.request.user.patient, 
        ).first()

        if existing_request:
          raise ValidationError({
            'non_field_errors': [
              "You already have an ongoing request. Please wait for its feedback before submitting another."
            ]
          })
    
        instance = serializer.save(
          patient=self.request.user.patient,  # ensure patient is set
          # has_patient_response=True,
          # response_description='Submitted post treatment laboratory test request'
        )

        files_dict = {}
        for key, value in self.request.FILES.items():
          if key.startswith("files."):
            field_name = key.split("files.")[1] 
            files_dict[field_name] = value

        for key, file in files_dict.items():
          RequiredAttachment.objects.create(
            post_treatment=instance,
            file=file,
            doc_type=key 
          )

    except Exception as e:
      logger.error(f"Error creating post treatment request: {str(e)}")
      raise e

class PostTreatmentUpdateView(generics.UpdateAPIView):
  queryset = PostTreatment.objects.all()
  serializer_class = PostTreatmentSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def perform_update(self, serializer):
    instance = self.get_object()

    if instance.has_patient_response:
      raise ValidationError({
        'non_field_errors': [
          "You already resubmitted your request. Please wait for its feedback before submitting again."
        ]
      })

    try:
      with transaction.atomic():
        # Save the updated screening info
        instance = serializer.save(
          has_patient_response=True,
          response_description='Resubmitted post treatment medication request',
          status='Pending'
        )

        # Handle uploaded files
        files_dict = {
          key.split("files.")[1]: value
          for key, value in self.request.FILES.items()
          if key.startswith("files.")
        }

        for key, file in files_dict.items():
          # Remove any existing attachment of the same type for this screening
          RequiredAttachment.objects.filter(
            post_treatment=instance,
            doc_type=key
          ).delete()
          
          RequiredAttachment.objects.create(
            post_treatment=instance,
            file=file,
            doc_type=key
          )

    except Exception as e:
      logger.error(f"Error during resubmission: {str(e)}")
      raise ValidationError({"non_field_errors": ["An error occurred while resubmitting the request."]})

class PostTreatmentDetailView(generics.RetrieveAPIView):
  queryset = PostTreatment.objects.all()
  serializer_class = PostTreatmentSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

class PostTreatmentListView(generics.ListAPIView):
  serializer_class = PostTreatmentSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    user = self.request.user
    patient = get_object_or_404(Patient, user=user)
    # patient_id = self.kwargs.get("patient_id")
    return PostTreatment.objects.filter(patient=patient)

class PostTreatmentCancelRequestView(generics.DestroyAPIView):
  queryset = PostTreatment.objects.all()
  serializer_class = PostTreatmentSerializer
  lookup_field = 'id'

  permission_classes = [IsAuthenticated]

class PostTreatmentResultUploadView(APIView):
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def patch(self, request, id):
    post_treatment = get_object_or_404(PostTreatment, id=id)

    if post_treatment.uploaded_result and not request.user.is_superuser:
      raise ValidationError ({'non_field_errors': ['You can only submit once. Please wait for it\'s feedback before submitting again.']})
    
    result_file = request.FILES.getlist('file')
    # print('Attachments: ', attachments)

    validate_attachment(result_file[0])

    post_treatment.uploaded_result = result_file[0]
    post_treatment.has_patient_response = True
    post_treatment.response_description = 'Uploaded post-treatment lab results.'
    post_treatment.save()

    return Response({"message": "Result uploaded successfully."}, status=status.HTTP_200_OK)

# -----------------------
# Hormonal Replacement Views
# -----------------------
class HormonalReplacementRequestView(generics.CreateAPIView):
  queryset = HormonalReplacement.objects.all()
  serializer_class = HormonalReplacementSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]

  def perform_create(self, serializer):
    try:
      with transaction.atomic():
        patient = self.request.user.patient # Stop here
        cancer_treatment = get_object_or_404(CancerTreatment, patient=patient)
        service_completed = cancer_treatment.service_type
        existing_request = HormonalReplacement.objects.filter(
          patient=patient,
          status__in=['Pending', 'Approved']
        ).first()

        if existing_request:
          raise ValidationError({
            'non_field_errors': [
              "You already have an ongoing request. Please wait for its feedback before submitting another."
            ]
          })
    
        instance = serializer.save(
          patient=self.request.user.patient,  # ensure patient is set
          service_completed=service_completed
        )

        files_dict = {}
        for key, value in self.request.FILES.items():
          if key.startswith("files."):
            field_name = key.split("files.")[1] 
            files_dict[field_name] = value

        for key, file in files_dict.items():
          HormonalReplacementRequiredAttachment.objects.create(
            hormonal_replacement=instance,
            file=file,
            doc_type=key 
          )

    except Exception as e:
      logger.error(f"Error creating hormonal replacement request: {str(e)}")
      raise e
    
class HormonalReplacementDetailView(generics.RetrieveAPIView):
  queryset = HormonalReplacement.objects.all()
  serializer_class = HormonalReplacementSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

class HormonalReplacementListView(generics.ListAPIView):
  serializer_class = HormonalReplacementSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    user = self.request.user
    patient = get_object_or_404(Patient, user=user)
    # patient_id = self.kwargs.get("patient_id")
    return HormonalReplacement.objects.filter(patient=patient)

class HormonalReplacementUpdateView(generics.UpdateAPIView):
  queryset = HormonalReplacement.objects.all()
  serializer_class = HormonalReplacementSerializer
  parser_classes = [MultiPartParser, FormParser]
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

  def perform_update(self, serializer):
    instance = self.get_object()

    if instance.has_patient_response:
      raise ValidationError({
        'non_field_errors': [
          "You already resubmitted your request. Please wait for its feedback before submitting again."
        ]
      })

    try:
      with transaction.atomic():
        # Save the updated screening info
        instance = serializer.save(
          has_patient_response=True,
          response_description='Resubmitted hormonal replacement medication request',
          status='Pending'
        )

        # Handle uploaded files
        files_dict = {
          key.split("files.")[1]: value
          for key, value in self.request.FILES.items()
          if key.startswith("files.")
        }

        for key, file in files_dict.items():
          # Remove any existing attachment of the same type for this screening
          HormonalReplacementRequiredAttachment.objects.filter(
            hormonal_replacement=instance,
            doc_type=key
          ).delete()
          
          HormonalReplacementRequiredAttachment.objects.create(
            hormonal_replacement=instance,
            file=file,
            doc_type=key
          )

    except Exception as e:
      logger.error(f"Error during resubmission: {str(e)}")
      raise ValidationError({"non_field_errors": ["An error occurred while resubmitting the request."]})

class HormonalReplacementCancelView(generics.DestroyAPIView):
  queryset = HormonalReplacement.objects.all()
  serializer_class = HormonalReplacementSerializer
  lookup_field = 'id'

  permission_classes = [IsAuthenticated]

# -----------------------
# Home Visit Views
# -----------------------
class HomeVisitListView(generics.ListAPIView):
  serializer_class = HomevisitSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    user = self.request.user
    patient = get_object_or_404(Patient, user=user)
    return PatientHomeVisit.objects.filter(patient=patient)

class HomeVisitDetailView(generics.RetrieveAPIView):
  queryset = PatientHomeVisit.objects.all()
  serializer_class = HomevisitSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = 'id'

class HomeVisitUpdateView(generics.UpdateAPIView):
  queryset = PatientHomeVisit.objects.all()
  serializer_class = HomevisitSerializer
  permission_classes = [IsAuthenticated]
  lookup_field = "id"   # so you can update by /<id> in the URL

  def perform_update(self, serializer):
    # instance = serializer.save(
    #   has_patient_response=True,
    #   response_description='Submitted Well being form.'
    # )
    serializer.save(
      has_patient_response=True,
      response_description='Submitted Well-being form.'
    )
    # return super().perform_update(serializer)

def validate_attachment(file):
  max_size_mb = 5
  allowed_types = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',  # .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # .docx
  ]

  if file.size > max_size_mb * 1024 * 1024:
    raise ValidationError({
      "non_field_errors": [
        f"File '{file.name}' exceeds {max_size_mb}MB limit."
      ]
    })

  if file.content_type not in allowed_types:
    raise ValidationError({
      "non_field_errors": [
        f"Unsupported file type: '{file.content_type}' for file '{file.name}'."
      ]
    })

