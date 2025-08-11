""" import pdfkit
import datetime
import os
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from django.conf import settings

def generate_loa_pdf(individual_screening):
  logo_path = os.path.join(settings.BASE_DIR, "static", "images", "logo_white_text.png")

  context = {
    "loa": individual_screening,
    "serial_no": "DAA275",
    "date": datetime.date.today().strftime("%B %d, %Y"),
    "logo_path": logo_path.replace("\\", "/"), 
  }

  html_string = render_to_string("loa_template.html", context)

  options = {
    "encoding": "UTF-8",
    "enable-local-file-access": None
  }

  # Return PDF bytes instead of file path
  pdf_bytes = pdfkit.from_string(html_string, False, options=options)  # False = return bytes

  file_name = f"loa_{individual_screening.patient.patient_id}.pdf"

  # Save to model FileField (in memory)
  individual_screening.loa_generated.save(file_name, ContentFile(pdf_bytes), save=True)

  return pdf_bytes, file_name
 """