from django.contrib import admin

from .models import PostTreatment, RequiredAttachment

# Register your models here.
admin.site.register(PostTreatment)
admin.site.register(RequiredAttachment)