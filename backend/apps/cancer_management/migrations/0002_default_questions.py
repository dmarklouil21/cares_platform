from django.db import migrations

def create_default_questions(apps, schema_editor):
  WellBeingQuestion = apps.get_model("cancer_management", "WellBeingQuestion")

  default_questions = [
    {
      "text_en": "I feel my body is doing well",
      "text_ceb": "Pamati nako lagsik akong lawas",
    },
    {
      "text_en": "There are times that I suddenly feel dizzy",
      "text_ceb": "Naay mga panahon nga kalit ko malipong",
    },
    {
      "text_en": "I can still help my family",
      "text_ceb": "Makatabang gihapon ko sa akong pamilya",
    },
    {
      "text_en": "The side effects of the medicine are a hassle",
      "text_ceb": "Nahasolan ko sa side effects sa tambal",
    },
    {
      "text_en": "I am still able to do my daily activities",
      "text_ceb": "Kaya nako maglihok-lihok taga adlaw",
    },
    {
      "text_en": "The things and activities that I do are meaningful",
      "text_ceb": "Akong mga buhat ug lihok kay naay hinungdan",
    },
    {
      "text_en": "I have lost weight even without dieting",
      "text_ceb": "Nawad-an kog timbang bisan walay diyeta",
    },
    {
      "text_en": "I have gained weight",
      "text_ceb": "Nisaka akong timbang",
    },
    {
      "text_en": "I have lost appetite in eating",
      "text_ceb": "Nawad-an kog gana sa pagkaon",
    },
    {
      "text_en": "I feel tired most of the time nearly every day",
      "text_ceb": "Bati-on ko ug kapoy kanunay halos kada adlaw",
    },
  ]

  for q in default_questions:
    WellBeingQuestion.objects.get_or_create(**q)

def reverse_func(apps, schema_editor):
  WellBeingQuestion = apps.get_model("cancer_management", "WellBeingQuestion")
  WellBeingQuestion.objects.all().delete()

class Migration(migrations.Migration):

  dependencies = [
    ("cancer_management", "0001_initial"),  # replace with your real initial migration
  ]

  operations = [
    migrations.RunPython(create_default_questions, reverse_func),
  ]
