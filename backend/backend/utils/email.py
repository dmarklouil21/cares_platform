from django.conf import settings
from django.core.mail import send_mail, EmailMessage
from django.core.files.base import ContentFile
from django.utils.html import strip_tags

# ...existing code...

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

from django.conf import settings
from django.core.mail import send_mail
from django.utils.html import strip_tags

def send_registration_email(user, password):
    try:
        # 1. FIX: Ensure absolute URL for the button
        login_link = f"https://cares-platform.vercel.app/beneficiary/login"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Welcome to RAFI-EJACC</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{user.first_name} {user.last_name}</b>,</p>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        Thank you for registering. Your account has been created successfully.
                    </p>

                    <div style="background: #f8f9fa; border-left: 4px solid #005baa; padding: 20px; border-radius: 4px; margin: 25px 0;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">
                            <b>Email:</b><br>
                            <span style="color: #333; font-size: 16px;">{user.email}</span>
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #555;">
                            <b>Temporary Password:</b><br>
                            <span style="color: #005baa; font-weight: bold; font-size: 18px; letter-spacing: 1px;">{password}</span>
                        </p>
                    </div>

                    <div style="background: #fff3cd; padding: 15px; border-radius: 4px; font-size: 13px; color: #856404; margin-bottom: 25px;">
                        <strong>Important:</strong> For your security, please log in and change this password immediately.
                    </div>

                    <div style="text-align: center;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 30px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            Login to Account
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">Need help? Contact us at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">Please do not share your password with anyone.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject="Welcome to RAFI-EJACC: Your Registration Details",
            message=strip_tags(html_message), # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
            html_message=html_message
        )
        return True

    except Exception as e:
        return str(e)

def send_individual_screening_status_email(patient, status, screening_date=None, remarks=None):
    try:
        first_name, last_name, recipient_email = _extract_contact_info(patient)
        if not recipient_email:
            raise ValueError("Recipient email not found for patient.")

        # --- 1. CONFIGURATION ---
        # We define the messages and colors together to avoid typos (like "Approve" vs "Approved")
        status_config = {
            "Approved": {
                "color": "#28a745", # Green
                "message": (
                    "Great news! Your screening request has been <b>approved</b>. "
                    f"Your cancer screening has been scheduled for <b>{screening_date.strftime('%B %d, %Y')}</b>. " if screening_date else ""
                    "Please make sure to arrive at least 15 minutes early and bring any required identification."
                )
            },
            "Completed": {
                "color": "#007bff", # Blue
                "message": "Your screening process has been <b>successfully completed</b>. Thank you for your cooperation and commitment to your health."
            },
            "Rejected": {
                "color": "#dc3545", # Red
                "message": (
                    "Unfortunately, your screening request has been <b>rejected</b>. "
                    "If you believe this decision was made in error, please contact our support team."
                    f"<br><br><b>Remarks:</b> {remarks}" if remarks else ""
                )
            },
            # Default/Fallbacks
            "LOA Generation": { "color": "#17a2b8", "message": "Your LOA is being generated." },
            "In Progress":    { "color": "#ffc107", "message": "Your screening is currently in progress." },
            "default":        { "color": "#6c757d", "message": "Your screening status has been updated." }
        }

        # Select config based on status, or fallback to default
        config = status_config.get(status, status_config["default"])
        
        # FIX: Ensure the link is absolute (e.g., https://rafi.org/login) not relative (/login)
        login_link = f"https://cares-platform.vercel.app/beneficiary"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # --- 2. HTML EMAIL ---
        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Screening Status Update</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{first_name} {last_name}</b>,</p>
                    
                    <div style="display: inline-block; background: {config['color']}; color: white; padding: 6px 14px; border-radius: 16px; font-size: 14px; margin-bottom: 20px; font-weight: bold;">
                        {status}
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">{config['message']}</p>

                    <div style="margin-top: 25px;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            View Your Screening Details
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject="RAFI-EJACC: Screening Status Update",
            message=strip_tags(html_message), # Auto-generate plain text version
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
            html_message=html_message
        )
        return True

    except Exception as e:
        return str(e)

def send_mass_screening_status_email(rhu, status, request_obj=None, remarks=None):
    """Notify RHU about mass screening request status updates."""
    try:
        # 1. Resolve Recipient
        # recipient_email = getattr(getattr(rhu, 'representatives', None), 'email', None)
        rep = rhu.representatives.first()
        recipient_email = rep.email if rep else None
        if not recipient_email:
            raise ValueError("Recipient email not found for RHU.")

        # 2. Extract Data safely
        rhu_name = getattr(rhu, 'lgu', 'Partner')
        title = getattr(request_obj, 'title', None)
        # Format date if it exists, assuming it's a date object, otherwise string
        date_str = str(request_obj.date) if request_obj and getattr(request_obj, 'date', None) else None

        # 3. Configuration (Message & Color)
        status_config = {
            'Verified': {
                'color': '#28a745', # Green
                'message': (
                    "Your mass screening application has been <b>verified</b>. "
                    "Please monitor your dashboard for the next steps regarding the scheduled activity."
                )
            },
            'Rejected': {
                'color': '#dc3545', # Red
                'message': (
                    "Unfortunately, your mass screening application has been <b>rejected</b>. "
                    f"<br><br><b>Remarks:</b> {remarks}" if remarks else ""
                )
            },
            'Done': {
                'color': '#005baa', # RAFI Blue (Completed/Success)
                'message': "Your mass screening activity has been marked as <b>Done</b>. Thank you for your cooperation."
            },
            'Pending': {
                'color': '#ffc107', # Yellow
                'message': "Your application is currently <b>Pending</b>. We will notify you once it has been reviewed."
            },
            # Fallback
            'default': { 'color': '#6c757d', 'message': "Your application status has been updated." }
        }

        config = status_config.get(status, status_config['default'])
        
        # 4. Links & Environment
        login_link = f"http://cares-platform.vercel.app/rhu"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # 5. HTML Template construction
        # We build the "Project Details" block conditionally to keep the HTML clean
        details_html = ""
        if title or date_str:
            details_html = f"""
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef; margin: 20px 0;">
                {f'<p style="margin: 0 0 5px 0; font-size: 14px; color: #555;"><b>Activity:</b> {title}</p>' if title else ''}
                {f'<p style="margin: 0; font-size: 14px; color: #555;"><b>Date:</b> {date_str}</p>' if date_str else ''}
            </div>
            """

        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Mass Screening Update</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{rhu_name}</b>,</p>
                    
                    <div style="display: inline-block; background: {config['color']}; color: { '#000' if status == 'Pending' else '#fff'}; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: bold; text-transform: uppercase;">
                        {status}
                    </div>

                    {details_html}

                    <p style="font-size: 15px; line-height: 1.6; color: #333;">{config['message']}</p>
                    
                    <div style="margin-top: 25px;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            View Application
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject="RAFI-EJACC: Mass Screening Application Update",
            message=strip_tags(html_message), # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
            html_message=html_message
        )
        return True

    except Exception as e:
        return str(e)

def send_mass_screening_status_email_private(private, status, request_obj=None, remarks=None):
    """Notify Private Organization about mass screening request status updates."""
    try:
        # --- 1. RECIPIENT LOGIC ---
        # Collect emails from representatives first
        recipient_list = []
        reps = getattr(private, 'private_representatives', None)
        
        if reps:
            # Safely extract emails from related users
            recipient_list = [
                rep.user.email for rep in reps.all() 
                if getattr(rep, 'user', None) and getattr(rep.user, 'email', None)
            ]
        
        # Fallback to institution email if no representatives found
        if not recipient_list:
            fallback = getattr(private, 'email', None)
            if fallback:
                recipient_list.append(fallback)
        
        if not recipient_list:
            raise ValueError("Recipient email not found for Private organization.")

        # --- 2. DATA EXTRACTION ---
        org_name = getattr(private, 'institution_name', 'Partner')
        title = getattr(request_obj, 'title', None)
        date_str = str(request_obj.date) if request_obj and getattr(request_obj, 'date', None) else None

        # --- 3. CONFIGURATION ---
        status_config = {
            'Verified': {
                'color': '#28a745', # Green
                'text_color': '#ffffff',
                'message': (
                    "Your mass screening application has been <b>verified</b>. "
                    "Please monitor your dashboard for the next steps regarding the scheduled activity."
                )
            },
            'Rejected': {
                'color': '#dc3545', # Red
                'text_color': '#ffffff',
                'message': (
                    "Unfortunately, your mass screening application has been <b>rejected</b>. "
                    f"<br><br><b>Remarks:</b> {remarks}" if remarks else ""
                )
            },
            'Done': {
                'color': '#005baa', # RAFI Blue
                'text_color': '#ffffff',
                'message': "Your mass screening activity has been marked as <b>Done</b>. Thank you for your cooperation."
            },
            'Pending': {
                'color': '#ffc107', # Yellow
                'text_color': '#000000', # Black text for contrast on yellow
                'message': "Your application is currently <b>Pending</b>. We will notify you once it has been reviewed."
            },
            'default': { 
                'color': '#6c757d', 
                'text_color': '#ffffff', 
                'message': "Your application status has been updated." 
            }
        }

        config = status_config.get(status, status_config['default'])
        
        # Links & Environment
        login_link = f"https://cares-platform.vercel.app/private"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # --- 4. HTML CONSTRUCTION ---
        
        # Conditional Project Details Box
        details_html = ""
        if title or date_str:
            details_html = f"""
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef; margin: 20px 0;">
                {f'<p style="margin: 0 0 5px 0; font-size: 14px; color: #555;"><b>Activity:</b> {title}</p>' if title else ''}
                {f'<p style="margin: 0; font-size: 14px; color: #555;"><b>Date:</b> {date_str}</p>' if date_str else ''}
            </div>
            """

        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Mass Screening Update</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{org_name}</b>,</p>
                    
                    <div style="display: inline-block; background: {config['color']}; color: {config['text_color']}; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: bold; text-transform: uppercase;">
                        {status}
                    </div>

                    {details_html}

                    <p style="font-size: 15px; line-height: 1.6; color: #333;">{config['message']}</p>
                    
                    <div style="margin-top: 25px;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            View Application
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject="RAFI-EJACC: Mass Screening Application Update",
            message=strip_tags(html_message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
            html_message=html_message
        )
        return True

    except Exception as e:
        return str(e)

def send_cancer_treatment_status_email(patient, status, treatment_date=None, interview_date=None, remarks=None):
    try:
        # --- 1. RECIPIENT & DATA EXTRACTION ---
        first_name = getattr(patient, "first_name", "Patient")
        last_name = getattr(patient, "last_name", "")
        recipient_email = getattr(getattr(patient, 'user', None), 'email', None)

        if not recipient_email:
            raise ValueError("Recipient email not found for patient.")

        # Format dates safely
        t_date_str = treatment_date.strftime("%B %d, %Y") if treatment_date else "to be announced"
        i_date_str = interview_date.strftime("%B %d, %Y") if interview_date else "to be announced"

        # --- 2. CONFIGURATION ---
        # Consolidating Message and Color logic
        status_config = {
            "Approved": {
                "color": "#28a745", # Green
                "text_color": "#ffffff",
                "message": (
                    f"Good news! Your cancer treatment request has been <b>approved</b>. "
                    f"Your treatment is scheduled for <b>{t_date_str}</b>. "
                    "Please arrive at least 15 minutes early and bring a valid ID and any relevant medical records."
                )
            },
            "Interview Process": {
                "color": "#17a2b8", # Teal/Info
                "text_color": "#ffffff",
                "message": (
                    f"Your interview has been scheduled for <b>{i_date_str}</b>. "
                    "Please check your application portal for additional details or required documents."
                )
            },
            "Case Summary Generation": {
                "color": "#ffc107", # Yellow
                "text_color": "#000000", # Black text for readability on yellow
                "message": (
                    "Your case summary and intervention plan are currently being prepared. "
                    "You will receive an update once your summary is available."
                )
            },
            "Completed": {
                "color": "#005baa", # RAFI Blue
                "text_color": "#ffffff",
                "message": (
                    "Your cancer treatment process has been <b>successfully completed</b>. "
                    "We appreciate your trust in RAFI-EJACC and wish you continued good health."
                )
            },
            "Rejected": {
                "color": "#dc3545", # Red
                "text_color": "#ffffff",
                "message": (
                    "We regret to inform you that your cancer treatment request has been <b>rejected</b>. "
                    "If you believe this decision was made in error, please contact our support team."
                    f"<br><br><b>Remarks:</b> {remarks}" if remarks else ""
                )
            },
            "default": {
                "color": "#6c757d", 
                "text_color": "#ffffff",
                "message": "Your treatment request status has been updated. Please check your account for details."
            }
        }

        config = status_config.get(status, status_config["default"])

        # Links & Environment
        login_link = f"https://cares-platform.vercel.app/beneficiary"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'cares_platform@gmail.com')

        # --- 3. HTML CONSTRUCTION ---
        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Treatment Request Update</h2>
                </div>

                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{first_name} {last_name}</b>,</p>

                    <div style="display: inline-block; background: {config['color']}; color: {config['text_color']}; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
                        {status}
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">{config['message']}</p>

                    <div style="margin-top: 25px;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            View Application Details
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject="RAFI-EJACC: Cancer Treatment Request Status Update",
            message=strip_tags(html_message), # Plain text fallback
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
        # 1. Extract Contact Info
        first_name, last_name, recipient_email = _extract_contact_info(patient)
        if not recipient_email:
            raise ValueError("Recipient email not found for patient.")

        # 2. Setup Links & Environment
        # Since there are remarks, the user likely needs to log in to edit their form.
        login_link = f"https://cares-platform.vercel.app/beneficiary"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # 3. HTML Construction
        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Action Required: Submission Returned</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{first_name} {last_name}</b>,</p>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        Your cancer screening submission has been reviewed. We have identified some items that need your attention before we can proceed.
                    </p>

                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 4px; margin: 25px 0;">
                        <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: bold; color: #856404; text-transform: uppercase;">
                            Review Remarks
                        </p>
                        <p style="margin: 0; font-size: 15px; color: #555;">
                            {remarks}
                        </p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        Please log in to your account to update your details and resubmit your application.
                    </p>

                    <div style="margin-top: 25px;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            Update Submission
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject="RAFI-EJACC: Action Required - Return Remarks",
            message=strip_tags(html_message), # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
            html_message=html_message
        )
        return True

    except Exception as e:
        return str(e)

def send_loa_email(recipient_email, file_obj, patient_name=None):
    """
    Sends a Letter of Authorization (LOA) email with an attached file.
    """
    try:
        # 1. Setup Display Name & Links
        name_display = patient_name if patient_name else "Patient"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # 2. HTML Construction
        html_body = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Letter of Authorization</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{name_display}</b>,</p>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        We are pleased to inform you that your application has been <b>approved</b>.
                    </p>

                    <div style="background: #eaf3fb; border-left: 4px solid #005baa; padding: 20px; border-radius: 4px; margin: 25px 0;">
                        <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: bold; color: #005baa; text-transform: uppercase;">
                            Action Required
                        </p>
                        <p style="margin: 0; font-size: 15px; color: #333;">
                            Please find your <b>Letter of Authorization (LOA)</b> attached to this email. Kindly <b>download and print</b> this document to proceed with your screening.
                        </p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        Thank you for your trust and cooperation.
                    </p>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        # 3. Construct Email Object
        message = EmailMessage(
            subject="RAFI-EJACC: Letter of Authorization (LOA) Approved",
            body=html_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
        )
        
        # Set content type to HTML
        message.content_subtype = "html"

        # 4. Attach File
        # Ensure we are at the start of the file stream if it was read previously
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
            
        message.attach(file_obj.name, file_obj.read(), file_obj.content_type)

        # 5. Send
        message.send(fail_silently=False)
        return True

    except Exception as e:
        return str(e)

def send_case_summary_email(recipient_email, file_obj, patient_name=None):
    """
    Sends the Case Summary and Intervention Plan with instructions to sign and upload.
    """
    try:
        # 1. Setup Display & Links
        name_display = patient_name if patient_name else "Patient"
        # Assuming there is a specific URL for uploading requirements, otherwise use login
        upload_link = f"cares-platform.vercel.app/beneficiary" 
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # 2. HTML Construction
        html_body = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Case Summary & Plan</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{name_display}</b>,</p>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        We are pleased to inform you that your request for <b>Cancer Treatment</b> has been approved.
                    </p>

                    <div style="background: #eaf3fb; border-left: 4px solid #005baa; padding: 20px; border-radius: 4px; margin: 25px 0;">
                        <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #005baa; text-transform: uppercase;">
                            Next Steps Required
                        </p>
                        <p style="margin: 0 0 5px 0; font-size: 15px; color: #333;">
                            1. <b>Download</b> the Case Summary attached to this email.
                        </p>
                        <p style="margin: 0 0 5px 0; font-size: 15px; color: #333;">
                            2. <b>Print and Sign</b> the document.
                        </p>
                        <p style="margin: 0; font-size: 15px; color: #333;">
                            3. <b>Upload</b> the signed copy back to the portal.
                        </p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        Our team will contact you via email shortly once your specific treatment date has been finalized.
                    </p>

                    <div style="margin-top: 25px;">
                        <a href="{upload_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            Go to Upload Portal
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        # 3. Construct Email Object
        message = EmailMessage(
            subject="RAFI-EJACC: Case Summary and Intervention Plan",
            body=html_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
        )
        message.content_subtype = "html"

        # 4. Attach File
        # Ensure file pointer is at start
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
            
        message.attach(file_obj.name, file_obj.read(), file_obj.content_type)

        # 5. Send
        message.send(fail_silently=False)
        return True

    except Exception as e:
        return str(e)

def send_precancerous_meds_status_email(patient, status, release_date=None, remarks=None, med_request=None):
    try:
        # --- 1. DATA EXTRACTION ---
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

        # Format Date safely
        date_str = release_date.strftime('%B %d, %Y') if hasattr(release_date, 'strftime') else str(release_date) if release_date else ""

        # --- 2. CONFIGURATION ---
        status_config = {
            "Verified": {
                "color": "#28a745", # Green
                "text_color": "#ffffff",
                "message": (
                    "Your pre-cancerous medication application has been <b>approved</b>. "
                    f"You may claim your meds starting on <b>{date_str}</b>. " if date_str else ""
                    "Please monitor your account for any updates."
                )
            },
            "Rejected": {
                "color": "#dc3545", # Red
                "text_color": "#ffffff",
                "message": (
                    "Unfortunately, your pre-cancerous medication application has been <b>rejected</b>. "
                    f"<br><br><b>Remarks:</b> {remarks}" if remarks else ""
                )
            },
            "Done": {
                "color": "#005baa", # RAFI Blue
                "text_color": "#ffffff",
                "message": (
                    "Your pre-cancerous medication application has been <b>completed</b>. "
                    "Thank you for your cooperation. We wish you well."
                )
            },
            "default": {
                "color": "#6c757d", 
                "text_color": "#ffffff",
                "message": "Your application status has been updated."
            }
        }

        config = status_config.get(status, status_config["default"])

        # Links & Environment
        login_link = f"cares-platform.vercel.app/beneficiary"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # --- 3. HTML CONSTRUCTION ---
        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Meds Application Update</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{first_name} {last_name}</b>,</p>
                    
                    <div style="display: inline-block; background: {config['color']}; color: {config['text_color']}; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
                        {status}
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">{config['message']}</p>

                    <div style="margin-top: 25px;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            View Your Application
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject="RAFI-EJACC: Pre-Cancerous Meds Application Update",
            message=strip_tags(html_message), # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
            html_message=html_message
        )
        return True

    except Exception as e:
        return str(e)

def send_post_treatment_status_email(patient, status, lab_test_date=None, remarks=None):
    try:
        # --- 1. DATA EXTRACTION ---
        first_name, last_name, recipient_email = _extract_contact_info(patient)
        if not recipient_email:
            raise ValueError("Recipient email not found for patient.")

        # Format Date safely
        lab_date_str = lab_test_date.strftime("%B %d, %Y") if lab_test_date else "To be announced"

        # --- 2. CONFIGURATION ---
        # Consolidate messages and colors to keep logic clean
        status_config = {
            "Approved": {
                "color": "#28a745", # Green
                "text_color": "#ffffff",
                "message": (
                    f"Good news! Your post-treatment request has been <b>approved</b>. "
                    f"Your laboratory test is scheduled for <b>{lab_date_str}</b>. "
                    "Your Letter of Authority will be sent shortly via email."
                )
            },
            "Completed": {
                "color": "#007bff", # Blue
                "text_color": "#ffffff",
                "message": (
                    "Your post-treatment process has been <b>successfully completed</b>. "
                    "Please <b>upload your laboratory results</b> through the portal and wait for feedback from our medical team."
                )
            },
            "Follow-up Required": {
                "color": "#17a2b8", # Teal
                "text_color": "#ffffff",
                "message": (
                    "After reviewing your recent results, a <b>follow-up check-up</b> is required. "
                    "We will notify you once the date for your next appointment has been confirmed."
                )
            },
            "Closed": {
                "color": "#ffc107", # Yellow
                "text_color": "#000000", # Black text for contrast
                "message": (
                    "Your post-treatment case has been <b>officially closed</b>. "
                    "Thank you for taking an active role in maintaining your health."
                )
            },
            "Rejected": {
                "color": "#dc3545", # Red
                "text_color": "#ffffff",
                "message": (
                    "We regret to inform you that your post-treatment request has been <b>rejected</b>. "
                    "If you believe this decision was made in error, please contact our support team."
                    f"<br><br><b>Remarks:</b> {remarks}" if remarks else ""
                )
            },
            "default": {
                "color": "#6c757d", 
                "text_color": "#ffffff", 
                "message": "Your post-treatment status has been updated. Please check your patient portal for details."
            }
        }

        config = status_config.get(status, status_config["default"])

        # Links & Environment
        login_link = f"cares-platform.vercel.app/beneficiary"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # --- 3. HTML CONSTRUCTION ---
        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">

                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Post-Treatment Update</h2>
                </div>

                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{first_name} {last_name}</b>,</p>

                    <div style="display: inline-block; background: {config['color']}; color: {config['text_color']}; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
                        {status}
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">{config['message']}</p>
                    
                    <div style="margin-top: 25px;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            Go to Patient Portal
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject="RAFI-EJACC: Post-Treatment Status Update",
            message=strip_tags(html_message), # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
            html_message=html_message
        )
        return True

    except Exception as e:
        return str(e)

def send_hormonal_replacement_status_email(patient, status, release_date=None, remarks=None):
    try:
        # --- 1. DATA EXTRACTION ---
        first_name, last_name, recipient_email = _extract_contact_info(patient)
        if not recipient_email:
            raise ValueError("Recipient email not found for patient.")

        # Format Date safely
        release_date = release_date.strftime("%B %d, %Y") if release_date else "To be announced"

        # --- 2. CONFIGURATION ---
        # Consolidate messages and colors
        status_config = {
            "Approved": {
                "color": "#28a745", # Green
                "text_color": "#ffffff",
                "message": (
                    f"Good news! Your hormonal-replacement medication request has been <b>approved</b>. "
                    f"You can claim your medicine on <b>{release_date}</b>. "
                )
            },
            "Completed": {
                "color": "#007bff", # Blue
                "text_color": "#ffffff",
                "message": (
                    "Your hormonal-replacement process has been <b>successfully completed</b>. "
                    "Thank you for your cooperation. We wish you well."
                )
            },
            "Rejected": {
                "color": "#dc3545", # Red
                "text_color": "#ffffff",
                "message": (
                    "We regret to inform you that your hormonal-replacement request has been <b>rejected</b>. "
                    "If you believe this decision was made in error, please contact our support team."
                    f"<br><br><b>Remarks:</b> {remarks}" if remarks else ""
                )
            },
            "default": {
                "color": "#6c757d", 
                "text_color": "#ffffff", 
                "message": "Your hormonal-replacement status has been updated. Please check your patient portal for details."
            }
        }

        config = status_config.get(status, status_config["default"])

        # Links & Environment
        login_link = f"cares-platform.vercel.app/beneficiary"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # --- 3. HTML CONSTRUCTION ---
        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">

                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Hormonal Replacement Update</h2>
                </div>

                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{first_name} {last_name}</b>,</p>

                    <div style="display: inline-block; background: {config['color']}; color: {config['text_color']}; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
                        {status}
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">{config['message']}</p>
                    
                    <div style="margin-top: 25px;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            Go to Patient Portal
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject="RAFI-EJACC: Hormonal Replacement Status Update",
            message=strip_tags(html_message), # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
            html_message=html_message
        )
        return True

    except Exception as e:
        return str(e)

def send_report_email(recipient_email, file_obj, patient_name=None):
    """
    Sends the Home Visitation Report with the file attached.
    """
    try:
        # 1. Setup Display Name & Links
        name_display = patient_name if patient_name else "Patient"
        login_link = f"cares-platform.vercel.app/beneficiary"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # 2. HTML Construction
        html_body = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Home Visitation Report</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{name_display}</b>,</p>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        We are pleased to inform you that your recent <b>home visitation</b> has been successfully completed.
                    </p>

                    <div style="background: #eaf3fb; border-left: 4px solid #005baa; padding: 20px; border-radius: 4px; margin: 25px 0;">
                        <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: bold; color: #005baa; text-transform: uppercase;">
                            Document Attached
                        </p>
                        <p style="margin: 0; font-size: 15px; color: #333;">
                            Your <b>Report and Recommendation</b> is attached to this email. Please review the details carefully for your reference and next steps.
                        </p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        If you have any questions or would like to discuss the recommendations further, please don't hesitate to contact us.
                    </p>
                    
                    <div style="margin-top: 25px;">
                        <a href="{login_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            View Account Dashboard
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">Need assistance? Contact our team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        # 3. Construct Email Object
        message = EmailMessage(
            subject="RAFI-EJACC: Successful Home Visitation and Follow-Up Report",
            body=html_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
        )
        message.content_subtype = "html"

        # 4. Attach File
        # Ensure file pointer is at start (critical if file was read previously)
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
            
        message.attach(file_obj.name, file_obj.read(), file_obj.content_type)

        # 5. Send
        message.send(fail_silently=False)
        return True

    except Exception as e:
        return str(e)

def send_service_registration_email(patient, service_name):
    try:
        # 1. Setup Links & Environment
        # It is usually better to link to the App Login rather than the public website
        # so they can check the status of their request.
        dashboard_link = f"cares-platform.vercel.app/beneficiary"
        support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@rafi.org.ph')

        # 2. HTML Construction
        html_message = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                
                <div style="background: #005baa; padding: 25px; text-align: center;">
                    <h2 style="color: #fff; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Registration Confirmed</h2>
                </div>
                
                <div style="padding: 30px;">
                    <p style="margin: 0 0 15px 0; color: #333;">Dear <b>{patient.first_name} {patient.last_name}</b>,</p>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        We are pleased to inform you that your registration for the <b>{service_name}</b> service at RAFI-EJACC has been successfully created.
                    </p>

                    <div style="background: #eaf3fb; border-left: 4px solid #005baa; padding: 20px; border-radius: 4px; margin: 25px 0;">
                        <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: bold; color: #005baa; text-transform: uppercase;">
                            What Happens Next?
                        </p>
                        <p style="margin: 0; font-size: 15px; color: #333;">
                            Our healthcare team will review your service request shortly. You will be contacted via email or through the portal once the next steps are ready.
                        </p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        If you have any questions or need assistance, feel free to reach out to our support team.
                    </p>

                    <div style="margin-top: 25px;">
                        <a href="{dashboard_link}" style="display: inline-block; padding: 12px 24px; background: #005baa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                            View Request Status
                        </a>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">If you have any questions, please contact our support team at <a href="mailto:{support_email}" style="color: #005baa; text-decoration: none;">{support_email}</a>.</p>
                    <p style="margin: 0;">This is an automated message from RAFI-EJACC.</p>
                </div>
            </div>
        </div>
        """

        send_mail(
            subject=f"RAFI-EJACC: {service_name} Registration Confirmation",
            message=strip_tags(html_message), # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient.email],
            fail_silently=False,
            html_message=html_message
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