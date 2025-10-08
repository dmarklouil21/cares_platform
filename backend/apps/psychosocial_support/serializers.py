from rest_framework import serializers
from .models import Activity
import json
from django.utils import timezone


class ActivityCreateSerializer(serializers.ModelSerializer):
    # Store as plain text; we'll coerce various inputs into a comma-separated string
    patients = serializers.CharField(allow_blank=True, required=False)
    # Make date parsing explicit
    date = serializers.DateField(input_formats=['%Y-%m-%d'])

    class Meta:
        model = Activity
        fields = ['id', 'title', 'description', 'date', 'photo', 'attachment', 'patients']

    def to_internal_value(self, data):
        # Make a shallow copy we can mutate safely
        try:
            mutable = data.copy()
        except Exception:
            mutable = dict(data)

        raw = mutable.get('patients')
        if raw is not None:
            names_list = []
            # If provided as JSON string (common in multipart)
            if isinstance(raw, str):
                try:
                    loaded = json.loads(raw)
                except Exception:
                    # Fallback: comma-separated string
                    loaded = [s.strip() for s in raw.split(',') if s.strip()]
                if isinstance(loaded, (list, tuple)):
                    names_list = [str(x) for x in loaded if str(x).strip()]
                elif isinstance(loaded, dict):
                    try:
                        items = [loaded[k] for k in sorted(loaded.keys(), key=lambda k: int(k) if str(k).isdigit() else k)]
                    except Exception:
                        items = list(loaded.values())
                    names_list = [str(x) for x in items if str(x).strip()]
                else:
                    names_list = [str(loaded)] if str(loaded).strip() else []
            elif isinstance(raw, (list, tuple)):
                names_list = [str(x) for x in raw if str(x).strip()]
            elif isinstance(raw, dict):
                try:
                    items = [raw[k] for k in sorted(raw.keys(), key=lambda k: int(k) if str(k).isdigit() else k)]
                except Exception:
                    items = list(raw.values())
                names_list = [str(x) for x in items if str(x).strip()]

            # Join into comma-separated string for storage
            mutable['patients'] = ', '.join(names_list)

        return super().to_internal_value(mutable)

    def validate_date(self, value):
        # Ensure date is today or in the future
        today = timezone.localdate()
        if value < today:
            raise serializers.ValidationError("Date cannot be in the past.")
        return value

    def validate_patients(self, value):
        # Ensure it's a simple string (already joined in to_internal_value). Handle direct strings too.
        if value is None:
            return ""
        if isinstance(value, (list, tuple, dict)):
            # Safety net: convert to string
            try:
                if isinstance(value, dict):
                    items = [value[k] for k in sorted(value.keys(), key=lambda k: int(k) if str(k).isdigit() else k)]
                else:
                    items = list(value)
            except Exception:
                items = list(value) if not isinstance(value, dict) else list(value.values())
            return ', '.join([str(x).strip() for x in items if str(x).strip()])
        return str(value)


class ActivitySerializer(serializers.ModelSerializer):
    # Simple serializer that exposes patients as plain text
    photo_url = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'title', 'description', 'date',
            'photo', 'attachment', 'photo_url', 'attachment_url',
            'patients', 'created_at'
        ]

    def get_photo_url(self, obj):
        try:
            if obj.photo and hasattr(obj.photo, 'url'):
                request = self.context.get('request')
                url = obj.photo.url
                return request.build_absolute_uri(url) if request else url
        except Exception:
            return None
        return None

    def get_attachment_url(self, obj):
        try:
            if obj.attachment and hasattr(obj.attachment, 'url'):
                request = self.context.get('request')
                url = obj.attachment.url
                return request.build_absolute_uri(url) if request else url
        except Exception:
            return None
        return None
