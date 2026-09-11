from rest_framework import serializers

from .models import (
    Campaign,
    Testimonial,
    Volunteer,
    ContactMessage,
    Donation,
)


class CampaignSerializer(serializers.ModelSerializer):
    progress = serializers.IntegerField(read_only=True)

    class Meta:
        model = Campaign
        fields = "__all__"


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"


class VolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volunteer
        fields = "__all__"


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = "__all__"
