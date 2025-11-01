from django.conf import settings
from django.core.mail import send_mail, EmailMessage
from django.core.files.base import ContentFile

import os

# ---------------------------
# Helpers
# ---------------------------
def _extract_contact_info(entity):
  """Return (first_name, last_name, email) for a Patient/Beneficiary-like object.

  Priority for email:
  1) entity.beneficiary.user.email
  2) entity.user.email
  3) entity.beneficiary.email
  4) entity.email
  """
  # Names
  first_name = getattr(getattr(entity, 'beneficiary', None), 'first_name', None) or getattr(entity, 'first_name', '')
  last_name = getattr(getattr(entity, 'beneficiary', None), 'last_name', None) or getattr(entity, 'last_name', '')

  # Email resolution with safe getattr chain
  email = (
    getattr(getattr(getattr(entity, 'beneficiary', None), 'user', None), 'email', None)
    or getattr(getattr(entity, 'user', None), 'email', None)
    or getattr(getattr(entity, 'beneficiary', None), 'email', None)
    or getattr(entity, 'email', None)
  )

  return first_name, last_name, email

def send_registration_email(user, password):
  try:
    send_mail(
      subject="Welcome to RAFI-EJACC: Your Registration Details",
      message="",  # Plain text fallback (optional)
      from_email=settings.DEFAULT_FROM_EMAIL,
      recipient_list=[user.email],
      fail_silently=False,
      html_message=f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: #005baa; padding: 20px; text-align: center;">
                    <img src="https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png" alt="RAFI Logo" style="height: 50px; display: block; margin: 0 auto 10px;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal;">Welcome to RAFI-EJACC</h2>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0;">Dear <b>{user.first_name} {user.last_name}</b>,</p>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #333;">Thank you for registering with <b>RAFI-Eduardo J. Aboitiz Cancer Center (EJACC)</b>.</p>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #333;">Your account has been created successfully. Please find your login credentials below:</p>

                    <!-- Credentials Box -->
                    <div style="background: #eaf3fb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #005baa;">
                        <p style="margin: 0 0 10px 0; font-size: 15px;"><b>Email:</b> {user.email}</p>
                        <p style="margin: 0; font-size: 15px;"><b>Temporary Password:</b> <span style="color: #005baa; font-weight: bold;">{password}</span></p>
                    </div>

                    <!-- Important Notice -->
                    <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
                        <p style="margin: 0; color: #856404; font-size: 14px;"><b>Important:</b> Your account will be activated after resetting your password. Please proceed to log in and reset your password immediately for security purposes.</p>
                    </div>

                    <!-- CTA Button -->
                    <a href="/login" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #005baa; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Login to Your Account
                    </a>

                    <p style="font-size: 15px; line-height: 1.6; color: #333; margin-top: 25px;">If you have any questions or need assistance, please contact our support team.</p>
                </div>

                <!-- Footer -->
                <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    <p>If you have any questions, please contact our support team at <a href="mailto:no-reply@gmail.com" style="color: #005baa;">no-reply@gmail.com</a>.</p>
                    <p>This email was sent by RAFI-EJACC. Please do not share your password with anyone.</p>
                </div>
            </div>
        </div>
      """
    )
    return True
  except Exception as e:
    return str(e)
  
def send_individual_screening_status_email(patient, status, screening_date=None, remarks=None):
  try:
    first_name, last_name, recipient_email = _extract_contact_info(patient)
    if not recipient_email:
      raise ValueError("Recipient email not found for patient.")
    # Friendly but professional messages
    status_messages = {
      "Approved": (
        "Great news! Your screening request has been <b>approved</b>. "
        f"Your cancer screening has been scheduled for <b>{screening_date.strftime('%B %d, %Y')}</b>" if screening_date else ""
        "Please make sure to arrive at least 15 minutes early and bring any required identification."
        # "Please fill out the <b>Screening Procedure Form</b> and upload the required documents to proceed with your application."
      ),
      "Completed": (
        "Your screening process has been <b>successfully completed</b>. "
        "Thank you for your cooperation and commitment to your health."
      ),
      "Rejected": (
        "Unfortunately, your screening request has been <b>rejected</b>. "
        "If you believe this decision was made in error or wish to reapply, please contact our support team."
        f"<br><br><b>Remarks:</b> {remarks}" if remarks else ""
      )
    }

    message_body = status_messages.get(status, "Your screening status has been updated.")

    # Status badge colors
    status_colors = {
      "Approve": "#28a745",
      "LOA Generation": "#17a2b8",
      "In Progress": "#ffc107",
      "Completed": "#007bff",
      "Rejected": "#dc3545"
    }
    badge_color = status_colors.get(status, "#6c757d")

    send_mail(
      subject="RAFI-EJACC: Screening Status Update",
      message="",  # Plain text fallback if needed
      from_email=settings.DEFAULT_FROM_EMAIL,
      recipient_list=[patient.email],
      fail_silently=False,
      html_message=f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: #005baa; padding: 20px; text-align: center;">
                    <img src="https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png" alt="RAFI Logo" style="height: 50px; display: block; margin: 0 auto 10px;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal;">Screening Status Update</h2>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px;">

                    <p style="margin: 0 0 15px 0;">Dear <b>{patient.first_name} {patient.last_name}</b>,</p>
                    
                    <!-- Status Badge -->
                    <div style="display: inline-block; background: {badge_color}; color: white; padding: 5px 12px; border-radius: 12px; font-size: 14px; margin-bottom: 15px;">
                        {status}
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #333;">{message_body}</p>

                    <!-- CTA Button --> <!-- settings.FRONTEND_URL -->
                    <a href="/login" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #005baa; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        View Your Screening Details
                    </a>
                </div>

                <!-- Footer -->
                <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;"> <!-- settings.SUPPORT_EMAIL --> <!-- settings.SUPPORT_EMAIL --> 
                    <p>If you have any questions, please contact our support team at <a href="mailto:no-reply@gmail.com" style="color: #005baa;">no-reply@gmail.com</a>.</p>
                    <p>This is an automated message from RAFI-EJACC. Please do not reply directly to this email.</p>
                </div>
            </div>
        </div>
      """
    )
    return True
  except Exception as e:
    return str(e)
  
def send_mass_screening_status_email(rhu, status, request_obj=None, remarks=None):
  """Notify RHU about mass screening request status updates.

  rhu: RHU instance (apps.rhu.models.RHU), expected to have a related User with email.
  status: 'Verified' | 'Rejected' | 'Done' | 'Pending'
  request_obj: optional MassScreeningRequest for contextual info (title, date)
  remarks: optional free text for rejection details
  """
  try:
    # Resolve recipient
    recipient_email = getattr(getattr(rhu, 'user', None), 'email', None) or getattr(rhu, 'email', None)
    if not recipient_email:
      raise ValueError("Recipient email not found for RHU.")

    title = getattr(request_obj, 'title', '') if request_obj is not None else ''
    date = getattr(request_obj, 'date', '') if request_obj is not None else ''

    status_messages = {
      'Verified': (
        "Your mass screening application has been <b>verified</b>. "
        + (f"Your proposed activity is scheduled for <b>{date}</b>. " if date else "")
        + "Please monitor your dashboard for next steps."
      ),
      'Rejected': (
        "Unfortunately, your mass screening application has been <b>rejected</b>. "
        + (f"<br><br><b>Remarks:</b> {remarks}" if remarks else "")
      ),
      'Done': (
        "Your mass screening application has been marked as <b>Done</b>. "
        "Thank you for your cooperation."
      ),
      'Pending': (
        "Your mass screening application is currently <b>Pending</b>. "
        "We will notify you once it is reviewed."
      ),
    }

    message_body = status_messages.get(status, "Your application status has been updated.")

    status_colors = {
      'Verified': '#28a745',
      'Rejected': '#dc3545',
      'Done': '#0d6efd',
      'Pending': '#ffc107',
    }
    badge_color = status_colors.get(status, '#6c757d')

    send_mail(
      subject="RAFI-EJACC: Mass Screening Application Update",
      message="",
      from_email=settings.DEFAULT_FROM_EMAIL,
      recipient_list=[recipient_email],
      fail_silently=False,
      html_message=f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            <div style="background: #005baa; padding: 20px; text-align: center;">
              <img src="https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png" alt="RAFI Logo" style="height: 50px; display: block; margin: 0 auto 10px;">
              <h2 style="color: #fff; margin: 0; font-weight: normal;">Mass Screening Status Update</h2>
            </div>
            <div style="padding: 30px;">
              <p style="margin: 0 0 15px 0;">Dear <b>{getattr(rhu, 'lgu', '')}</b>,</p>
              {(f"<p style='margin: 0 0 10px 0;'><b>Title:</b> {title}</p>" if title else '')}
              {(f"<p style='margin: 0 0 10px 0;'><b>Date:</b> {date}</p>" if date else '')}
              <div style="display: inline-block; background: {badge_color}; color: white; padding: 5px 12px; border-radius: 12px; font-size: 14px; margin: 10px 0 15px 0;">
                {status}
              </div>
              <p style="font-size: 15px; line-height: 1.6; color: #333;">{message_body}</p>
              <a href="/login" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #005baa; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Application
              </a>
            </div>
            <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
              <p>If you have any questions, please contact our support team at <a href="mailto:no-reply@gmail.com" style="color: #005baa;">no-reply@gmail.com</a>.</p>
              <p>This is an automated message from RAFI-EJACC. Please do not reply directly to this email.</p>
            </div>
          </div>
        </div>
      """
    )
    return True
  except Exception as e:
    return str(e)
  
def send_cancer_treatment_status_email(patient, status, treatment_date=None, interview_date=None, remarks=None):
    try:
        # Extract recipient info
        first_name = getattr(patient, "first_name", "")
        last_name = getattr(patient, "last_name", "")
        recipient_email = getattr(patient.user, "email", None)

        if not recipient_email:
            raise ValueError("Recipient email not found for patient.")

        # Format dates
        treatment_date_str = treatment_date.strftime("%B %d, %Y") if treatment_date else "to be announced"
        interview_date_str = interview_date.strftime("%B %d, %Y") if interview_date else "to be announced"

        # Message dictionary (friendly + status-specific)
        status_messages = {
            "Approved": (
                f"Good news! Your cancer treatment request has been <b>approved</b>. "
                f"Your treatment is scheduled for <b>{treatment_date_str}</b>. "
                "Please arrive at least 15 minutes early and bring a valid ID and any relevant medical records."
            ),
            "Interview Process": (
                f"Your interview has been scheduled for <b>{interview_date_str}</b>. "
                "Please check your application portal for additional details or required documents."
            ),
            "Case Summary Generation": (
                "Your case summary and intervention plan are currently being prepared. "
                "You will receive an update once your summary is available."
            ),
            "Completed": (
                "Your cancer treatment process has been <b>successfully completed</b>. "
                "We appreciate your trust in RAFI-EJACC and wish you continued good health."
            ),
            "Rejected": (
                "We regret to inform you that your cancer treatment request has been <b>rejected</b>. "
                "If you believe this decision was made in error or would like to reapply, please contact our support team."
                + (f"<br><br><b>Remarks:</b> {remarks}" if remarks else "")
            ),
        }

        message_body = status_messages.get(
            status, "Your treatment request status has been updated. Please check your account for more details."
        )

        # Badge color per status
        status_colors = {
            "Approved": "#28a745",
            "Interview Process": "#17a2b8",
            "Case Summary Generation": "#ffc107",
            "Completed": "#007bff",
            "Rejected": "#dc3545",
        }
        badge_color = status_colors.get(status, "#6c757d")

        # Build email HTML
        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: #005baa; padding: 20px; text-align: center;">
              <img src="https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png"
                   alt="RAFI Logo"
                   style="height: 50px; display: block; margin: 0 auto 10px;">
              <h2 style="color: #fff; margin: 0; font-weight: normal;">Cancer Treatment Request Update</h2>
            </div>

            <!-- Body -->
            <div style="padding: 30px;">
              <p style="margin: 0 0 15px 0;">Dear <b>{first_name} {last_name}</b>,</p>

              <!-- Status badge -->
              <div style="display: inline-block; background: {badge_color}; color: white; padding: 5px 12px; border-radius: 12px; font-size: 14px; margin-bottom: 15px;">
                {status}
              </div>

              <p style="font-size: 15px; line-height: 1.6; color: #333;">{message_body}</p>

              <!-- CTA -->
              <a href="/login"
                 style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #005baa; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Your Application Details
              </a>
            </div>

            <!-- Footer -->
            <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
              <p>If you have any questions, please contact our support team at
                <a href="#" style="color: #005baa;">cares_platform@gmail.com</a>.
              </p>
              <p>This is an automated message from RAFI-EJACC. Please do not reply directly to this email.</p>
            </div>
          </div>
        </div>
        """

        # Send the email
        send_mail(
            subject="RAFI-EJACC: Cancer Treatment Request Status Update",
            message="Your cancer treatment request status has been updated.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
            html_message=html_message,
        )

        return True

    except Exception as e:
        return str(e)

def send_return_remarks_email(patient, remarks):
  try:
    first_name, last_name, recipient_email = _extract_contact_info(patient)
    if not recipient_email:
      raise ValueError("Recipient email not found for patient.")
    subject = "Return Remarks for Your Cancer Screening"
    # message = (
    #   f"Dear {patient.beneficiary.first_name},\n\n"
    #   "Your cancer screening submission has been reviewed, and we have some remarks for your attention:\n\n"
    #   f"{remarks}\n\n"
    #   "Please review these remarks and make the necessary updates before resubmitting.\n\n"
    #   "Thank you for your cooperation.\n\n"
    #   "Best regards,\n"
    #   "Eduardo J. Aboitiz Cancer Center"
    # )

    send_mail(
      subject=subject,
      message='',
      from_email=settings.DEFAULT_FROM_EMAIL,  # Sender email
      recipient_list=[recipient_email],  # Recipient list
      fail_silently=False,
      html_message=f"""
        <div style='font-family: Arial, sans-serif; color: #222;'>
            <div style='background: #005baa; padding: 20px; border-radius: 8px 8px 0 0;'>
              <img src='https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png' alt='RAFI Logo' style='height: 50px; display: block; margin: 0 auto 10px auto;'>
              <h2 style='color: #fff; text-align: center; margin: 0;'>Return Remarks</h2>
            </div>
            <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;'>
              <p>Dear <b>{first_name} {last_name}</b>,</p>
              <p>Your cancer screening submission has been reviewed, and we have some remarks for your attention:</p>
              <div style='background: #fff3cd; padding: 15px; border-radius: 6px; list-style: none;'>
                <span><b>{remarks}</b></span>
              </div>
              <hr style='margin: 30px 0;'>
              
              <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;"> <!-- settings.SUPPORT_EMAIL --> <!-- settings.SUPPORT_EMAIL --> 
                <p>If you have any questions, please contact our support team at <a href="mailto:no-reply@gmail.com" style="color: #005baa;">no-reply@gmail.com</a>.</p>
                <p>This is an automated message from RAFI-EJACC. Please do not reply directly to this email.</p>
              </div>
            </div>
          </div>
      """
    )
  except Exception as e:
    return str(e)
  
def send_loa_email(recipient_email, file_obj, patient_name=None):
  """
  Sends a Letter of Authorization (LOA) email with an attached file.

  :param recipient_email: str - The email address of the patient.
  :param file_obj: UploadedFile - The LOA file (from request.FILES).
  :param patient_name: str - Optional, patient full name for personalization.
  :return: True if success, or error string if failed.
  """
  try:
    name_text = f"Dear <b>{patient_name}</b>," if patient_name else "Dear Patient,"

    message = EmailMessage(
      subject="RAFI-EJACC: Letter of Authorization (LOA) for Your Application",
      # Our team will contact you through email shortly once your screening date has been finalized.<br><br>
      body=f"""
          {name_text}<br><br>
          We are pleased to inform you that your application has been approved.<br><br>
          Please find attached your <b>Letter of Authorization (LOA)</b>. Kindly print and sign the document to proceed with your screening.<br><br>
          
          Thank you for your trust and cooperation.<br><br>
          Best regards,<br>
          <b>RAFI-EJACC Team</b>
      """,
      from_email=settings.DEFAULT_FROM_EMAIL,
      to=[recipient_email],
    )
    message.content_subtype = "html"

    # Attach uploaded file (works without saving to DB)
    message.attach(file_obj.name, file_obj.read(), file_obj.content_type)

    message.send(fail_silently=False)
    return True
  except Exception as e:
    return str(e)
  
def send_case_summary_email(recipient_email, file_obj, patient_name=None):
  try:
    name_text = f"Dear <b>{patient_name}</b>," if patient_name else "Dear Patient,"

    message = EmailMessage( # RAFI-EJACC: Successful Home Visitation and Follow-Up Report
      subject="RAFI-EJACC: Case Summary and Intervention Plan for Your Cancer Treatment",
      body=f"""
          {name_text}<br><br>
          We are pleased to inform you that your request for cancer treatment - Radiation Therapy has been approved.<br><br>
          Please find attached your <b>Case Summary and Interverntion Plan</b>. Kindly print, sign and upload the document back. For further processing.<br><br>
          Our team will contact you through email shortly once your treatment date has been finalized.<br><br>
          Thank you for your trust and cooperation.<br><br>
          Best regards,<br>
          <b>RAFI-EJACC Team</b>
      """,
      from_email=settings.DEFAULT_FROM_EMAIL,
      to=[recipient_email],
    )
    message.content_subtype = "html"

    # Attach uploaded file (works without saving to DB)
    message.attach(file_obj.name, file_obj.read(), file_obj.content_type)

    message.send(fail_silently=False)
    return True
  except Exception as e:
    return str(e)


def send_precancerous_meds_status_email(patient, status, release_date=None, remarks=None, med_request=None):
  try:
    # Prefer explicit names from PreCancerousMedsRequest when available
    if med_request is not None:
      first_name = getattr(med_request, 'first_name', '') or ''
      last_name = getattr(med_request, 'last_name', '') or ''
      # Email still resolved from patient record
      _, _, recipient_email = _extract_contact_info(patient)
    else:
      first_name, last_name, recipient_email = _extract_contact_info(patient)
    if not recipient_email:
      raise ValueError("Recipient email not found for patient.")
    status_messages = {
      "Verified": (
        "Your pre-cancerous medication application has been <b>verified</b>. "
        + (f"You may claim your meds starting on <b>{release_date.strftime('%B %d, %Y')}</b>. " if hasattr(release_date, 'strftime') else "")
        + "Please monitor your account for any updates."
      ),
      "Rejected": (
        "Unfortunately, your pre-cancerous medication application has been <b>rejected</b>. "
        + (f"<br><br><b>Remarks:</b> {remarks}" if remarks else "")
      ),
      "Done": (
        "Your pre-cancerous medication application has been <b>completed</b>. "
        "Thank you for your cooperation. We wish you well."
      ),
    }

    message_body = status_messages.get(status, "Your application status has been updated.")

    status_colors = {
      "Verified": "#28a745",
      "Rejected": "#dc3545",
      "Done": "#0d6efd",
    }
    badge_color = status_colors.get(status, "#6c757d")

    send_mail(
      subject="RAFI-EJACC: Pre-Cancerous Meds Application Update",
      message="",
      from_email=settings.DEFAULT_FROM_EMAIL,
      recipient_list=[recipient_email],
      fail_silently=False,
      html_message=f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            <div style="background: #005baa; padding: 20px; text-align: center;">
              <img src="https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png" alt="RAFI Logo" style="height: 50px; display: block; margin: 0 auto 10px;">
              <h2 style="color: #fff; margin: 0; font-weight: normal;">Pre-Cancerous Meds Application</h2>
            </div>
            <div style="padding: 30px;">
              <p style="margin: 0 0 15px 0;">Dear <b>{first_name} {last_name}</b>,</p>
              <div style="display: inline-block; background: {badge_color}; color: white; padding: 5px 12px; border-radius: 12px; font-size: 14px; margin-bottom: 15px;">{status}</div>
              <p style="font-size: 15px; line-height: 1.6; color: #333;">{message_body}</p>
              <a href="/login" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #005baa; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Your Application</a>
            </div>
            <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
              <p>If you have any questions, please contact our support team at <a href="mailto:no-reply@gmail.com" style="color: #005baa;">no-reply@gmail.com</a>.</p>
              <p>This is an automated message from RAFI-EJACC. Please do not reply directly to this email.</p>
            </div>
          </div>
        </div>
      """
    )
    return True
  except Exception as e:
    return str(e)

def send_post_treatment_status_email(patient, status, lab_test_date=None, remarks=None):
    try:
        first_name, last_name, recipient_email = _extract_contact_info(patient)
        if not recipient_email:
            raise ValueError("Recipient email not found for patient.")

        # Build message content based on status
        if status == "Approved":
            lab_date_str = lab_test_date.strftime("%B %d, %Y") if lab_test_date else "TBA"
            message_body = (
                f"Good news! Your post-treatment request has been <b>approved</b>. "
                f"Your laboratory test is scheduled for <b>{lab_date_str}</b>. "
                "Your Letter of Authority will be sent to you soon. "
                "Please make sure to arrive at least <b>15 minutes early</b> and bring a valid ID for verification."
            )

        elif status == "Completed":
            message_body = (
                "Your post-treatment process has been <b>successfully completed</b>. "
                "Please upload your laboratory results through your portal and wait for feedback from our medical team. "
                "We appreciate your cooperation and prompt submission of results."
            )

        elif status == "Follow-up Required":
            message_body = (
                "After reviewing your recent results, a <b>follow-up check-up</b> is required. "
                "We will notify you once the date for your next appointment has been confirmed. "
                "Please ensure to arrive on time and bring your previous test results and valid identification."
            )

        elif status == "Closed":
            message_body = (
                "Your post-treatment case has been <b>officially closed</b>. "
                "Thank you for your cooperation and for taking an active role in maintaining your health. "
                "Should you need further assistance, feel free to reach out to our support team."
            )

        elif status == "Rejected":
            message_body = (
                "We regret to inform you that your post-treatment request has been <b>rejected</b>. "
                "If you believe this decision was made in error or wish to reapply, please contact our support team for further assistance."
            )
            if remarks:
                message_body += f"<br><br><b>Remarks:</b> {remarks}"

        else:
            message_body = (
                "Your post-treatment status has been updated. "
                "Please check your patient portal for the latest information and any additional requirements."
            )

        # Status badge colors
        status_colors = {
            "Approved": "#28a745",
            "Completed": "#007bff",
            "Follow-up Required": "#17a2b8",
            "Closed": "#ffc107",
            "Rejected": "#dc3545"
        }
        badge_color = status_colors.get(status, "#6c757d")

        # Send formatted email
        send_mail(
            subject="RAFI-EJACC: Post-Treatment Status Update",
            message="",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
            html_message=f"""
            <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <div style="background: #005baa; padding: 20px; text-align: center;">
                        <img src="https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png" alt="RAFI Logo" style="height: 50px; margin-bottom: 10px;">
                        <h2 style="color: #fff; margin: 0;">Post-Treatment Status Update</h2>
                    </div>

                    <!-- Content -->
                    <div style="padding: 30px;">
                        <p style="margin: 0 0 15px 0;">Dear <b>{first_name} {last_name}</b>,</p>

                        <!-- Status Badge -->
                        <div style="display: inline-block; background: {badge_color}; color: white; padding: 6px 14px; border-radius: 12px; font-size: 14px; margin-bottom: 15px;">
                            {status}
                        </div>

                        <p style="font-size: 15px; line-height: 1.6; color: #333;">{message_body}</p>
                    </div>

                    <!-- Footer -->
                    <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                        <p>If you have any questions, please contact our support team at 
                        <a href="mailto:no-reply@gmail.com" style="color: #005baa;">no-reply@gmail.com</a>.</p>
                        <p>This is an automated message from RAFI-EJACC. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </div>
            """
        )
        return True

    except Exception as e:
        return f"Email failed to send: {e}"


def send_report_email(recipient_email, file_obj, patient_name=None):
  try:
    name_text = f"Dear <b>{patient_name}</b>," if patient_name else "Dear Patient,"

    message = EmailMessage(
      # subject="RAFI-EJACC: Report and Recommendation from your Home Visitation",
      subject="RAFI-EJACC: Successful Home Visitation and Follow-Up Report",
      body=f"""
          {name_text}<br><br>
          We are pleased to inform you that your recent <b>home visitation</b> has been successfully completed.<br><br>
          Attached is your <b>Home Visitation Report and Recommendation</b> prepared by our medical team. 
          Please review the details carefully for your reference and next steps.<br><br>
          If you have any questions or would like to discuss the recommendations further, 
          please don’t hesitate to reach out to us via email or phone.<br><br>
          Thank you for your continued trust and cooperation in your care journey.<br><br>
          Warm regards,<br>
          <b>RAFI-EJACC Team</b>
      """,
      from_email=settings.DEFAULT_FROM_EMAIL,
      to=[recipient_email],
    )
    message.content_subtype = "html"

    # Attach uploaded file (works without saving to DB)
    message.attach(file_obj.name, file_obj.read(), file_obj.content_type)

    message.send(fail_silently=False)
    return True
  except Exception as e:
    return str(e)

def send_service_registration_email(patient, service_name):
    try:
        send_mail(
            subject=f"RAFI-EJACC: {service_name} Registration Confirmation",
            message="",  # Plain text fallback (optional)
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient.email],
            fail_silently=False,
            html_message=f"""
                <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
                    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <div style="background: #005baa; padding: 20px; text-align: center;">
                            <img src="https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png" 
                                 alt="RAFI Logo" 
                                 style="height: 50px; display: block; margin: 0 auto 10px;">
                            <h2 style="color: #fff; margin: 0; font-weight: normal;">Service Registration Confirmed</h2>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 30px;">
                            <p style="margin: 0 0 15px 0;">Dear <b>{patient.first_name} {patient.last_name}</b>,</p>
                            
                            <p style="font-size: 15px; line-height: 1.6; color: #333;">
                                We’re pleased to inform you that your registration for the 
                                <b>{service_name}</b> service at 
                                <b>RAFI - Eduardo J. Aboitiz Cancer Center (EJACC)</b> has been successfully created.
                            </p>

                            <div style="background: #eaf3fb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #005baa;">
                                <p style="margin: 0; font-size: 15px;">
                                    Our healthcare team will review your service request shortly. 
                                    You will be contacted once the next steps are ready.
                                </p>
                            </div>

                            <p style="font-size: 15px; line-height: 1.6; color: #333;">
                                If you have any questions or need assistance, 
                                feel free to reach out to our support team or your assigned health worker.
                            </p>

                            <!-- CTA Button -->
                            <a href="https://rafi.org.ph/ejacc/" 
                               style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #005baa; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                Visit RAFI-EJACC Website
                            </a>

                            <p style="font-size: 14px; line-height: 1.6; color: #555; margin-top: 25px;">
                                Thank you for trusting RAFI-EJACC. Together, we work towards your better health and well-being.
                            </p>
                        </div>

                        <!-- Footer -->
                        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                            <p>
                                For inquiries, contact us at 
                                <a href="mailto:no-reply@gmail.com" style="color: #005baa;">no-reply@gmail.com</a>.
                            </p>
                            <p>
                                This email was sent by RAFI-EJACC. Please do not reply directly to this message.
                            </p>
                        </div>
                    </div>
                </div>
            """
        )
        return True
    except Exception as e:
        return str(e)

# def send_individual_screening_status_email(patient, status, screening_date=None):
#   try:
#     status_messages = {
#       "Approve": "Your screening request has been approved. Fill out the Screening Procedure Form and submit the required documents to proceed with your application.",
#       "LOA Generation": "Your screening procedure and your documents submitted has been approved. Access your account and download your Letter of Authorization (LOA) and submit the file after signing.",
#       "In Progress": f"Congratulations, your cancer screening is scheduled on {screening_date}.",
#       "Completed": "Your screening process has been successfully completed.",
#       "Rejected": "Unfortunately, your screening request has been rejected."
#     }

#     message_body = status_messages.get(status, "Your screening status has been updated.")

#     send_mail(
#       subject="RAFI-EJACC: Screening Status Update",
#       message="",  # optional plain text fallback
#       from_email=settings.DEFAULT_FROM_EMAIL,
#       recipient_list=[patient.beneficiary.user.email],
#       fail_silently=False,
#       html_message=f"""
#           <div style='font-family: Arial, sans-serif; color: #222;'>
#             <div style='background: #005baa; padding: 20px; border-radius: 8px 8px 0 0;'>
#               <img src='https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png' alt='RAFI Logo' style='height: 50px; display: block; margin: 0 auto 10px auto;'>
#               <h2 style='color: #fff; text-align: center; margin: 0;'>Screening Status Update</h2>
#             </div>
#             <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;'>
#               <p>Dear <b>{patient.beneficiary.first_name} {patient.beneficiary.last_name}</b>,</p>
#               <p>{message_body}</p>
#               <p>If you have any questions or concerns, feel free to contact our support team.</p>
#               <hr style='margin: 30px 0;'>
#               <p style='font-size: 13px; color: #888;'>This is an automated message from RAFI-EJACC. Please do not reply directly to this email.</p>
#             </div>
#           </div>
#       """
#     )
#     return True
#   except Exception as e:
#     return str(e)
  
""" def send_loa_email(recipient, pdf_bytes, file_name):
  email = EmailMessage(
    subject='Letter of Authority',
    body='Attached is your Letter of Authority (LOA).',
    from_email=settings.DEFAULT_FROM_EMAIL,
    to=[recipient],
  )

  # Attach PDF directly from bytes
  email.attach(file_name, pdf_bytes, 'application/pdf')
  email.send() """