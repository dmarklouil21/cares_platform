from django.conf import settings
from django.core.mail import send_mail, EmailMessage
from django.core.files.base import ContentFile

import os

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
    # Friendly but professional messages
    status_messages = {
      "Approve": (
        "Great news! Your screening request has been <b>approved</b>. "
        "Please fill out the <b>Screening Procedure Form</b> and upload the required documents to proceed with your application."
      ),
      "LOA Generation": (
        "Your screening procedure and submitted documents have been <b>approved</b>. "
        "You can now download your <b>Letter of Authorization (LOA)</b> from your account. "
        "Please sign it and upload the scanned copy."
      ),
      "In Progress": (
        f"Your cancer screening has been scheduled for <b>{screening_date.strftime('%B %d, %Y')}</b>. "
        "Please make sure to arrive at least 15 minutes early and bring any required identification."
        if screening_date else
        "Your screening is now in progress. Please prepare any required documents."
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
      recipient_list=[patient.user.email],
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

def send_return_remarks_email(patient, remarks):
  try:
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
      recipient_list=[patient.user.email],  # Recipient list
      fail_silently=False,
      html_message=f"""
        <div style='font-family: Arial, sans-serif; color: #222;'>
            <div style='background: #005baa; padding: 20px; border-radius: 8px 8px 0 0;'>
              <img src='https://rafi.org.ph/wp-content/uploads/2021/03/RAFI-LOGO-1.png' alt='RAFI Logo' style='height: 50px; display: block; margin: 0 auto 10px auto;'>
              <h2 style='color: #fff; text-align: center; margin: 0;'>Return Remarks</h2>
            </div>
            <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;'>
              <p>Dear <b>{patient.first_name} {patient.last_name}</b>,</p>
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
      subject="RAFI-EJACC: Letter of Authorization (LOA) for Your Cancer Screening",
      body=f"""
          {name_text}<br><br>
          We are pleased to inform you that your request for individual cancer screening has been approved.<br><br>
          Please find attached your <b>Letter of Authorization (LOA)</b>. Kindly print and sign the document to proceed with your screening.<br><br>
          Our team will contact you through email shortly once your screening date has been finalized.<br><br>
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