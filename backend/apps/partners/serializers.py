from rest_framework import serializers

from apps.partners.models import CancerAwarenessActivity  # adjust path if needed

class CancerAwarenessActivitySerializer(serializers.ModelSerializer):
  uploader_name = serializers.CharField(source="uploader.fullname", read_only=True)

  class Meta:
    model = CancerAwarenessActivity
    fields = [
      "id",
      # "uploader",
      "uploader_name",
      "title",
      "description",
      "date",
      "photo",
      "attachment",
      "created_at",
      # "updated_at",
    ]
    read_only_fields = ["id", "created_at", "uploader_name"]
  
  # def create(self, validated_data):
  #   uploader = self.request.user

  #   cancer_awareness_activity = CancerAwarenessActivity.objects.create(uploader=uploader, **validated_data)
        
  #   return cancer_awareness_activity

