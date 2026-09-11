import os
from decimal import Decimal

import razorpay

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    Campaign,
    Testimonial,
    Volunteer,
    ContactMessage,
    Donation,
)

from .serializers import (
    CampaignSerializer,
    TestimonialSerializer,
    VolunteerSerializer,
    ContactMessageSerializer,
    DonationSerializer,
)


@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "ok",
        "service": "backend"
    })


@api_view(["POST"])
def create_razorpay_order(request):
    amount = request.data.get("amount")

    if not amount:
        return Response(
            {"error": "Amount is required"},
            status=400
        )

    try:
        amount_paise = int(float(amount) * 100)
    except (ValueError, TypeError):
        return Response(
            {"error": "Invalid amount"},
            status=400
        )

    if amount_paise <= 0:
        return Response(
            {"error": "Amount must be greater than 0"},
            status=400
        )

    client = razorpay.Client(
        auth=(
            os.getenv("RAZORPAY_KEY_ID"),
            os.getenv("RAZORPAY_KEY_SECRET"),
        )
    )

    order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "payment_capture": 1,
    })

    return Response({
        "order_id": order["id"],
        "amount": amount_paise,
        "currency": "INR",
        "key_id": os.getenv("RAZORPAY_KEY_ID"),
    })


@api_view(["POST"])
def verify_razorpay_payment(request):
    payment_id = request.data.get("razorpay_payment_id")
    order_id = request.data.get("razorpay_order_id")
    signature = request.data.get("razorpay_signature")

    donor_name = request.data.get("donor_name")
    email = request.data.get("email")
    campaign_id = request.data.get("campaign")

    if not payment_id or not order_id or not signature:
        return Response(
            {"error": "Payment verification details are required"},
            status=400
        )

    if not donor_name or not email:
        return Response(
            {"error": "Donor details are required"},
            status=400
        )

    try:
        client = razorpay.Client(
            auth=(
                os.getenv("RAZORPAY_KEY_ID"),
                os.getenv("RAZORPAY_KEY_SECRET"),
            )
        )

        # Check that the order exists in Razorpay
        order = client.order.fetch(order_id)

        # Verify Razorpay payment signature
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })

        # Prevent duplicate donation
        if Donation.objects.filter(
            razorpay_order_id=order_id
        ).exists():
            return Response(
                {"error": "This payment has already been recorded"},
                status=400
            )

        campaign = None

        if campaign_id:
            campaign = Campaign.objects.filter(
                id=campaign_id
            ).first()

        donation = Donation.objects.create(
            donor_name=donor_name,
            email=email,
            amount=Decimal(order["amount"]) / Decimal("100"),
            campaign=campaign,
            payment_status="paid",
            razorpay_order_id=order_id,
            razorpay_payment_id=payment_id,
            razorpay_signature=signature,
        )

        return Response({
            "message": "Payment verified successfully",
            "donation_id": donation.id,
            "payment_status": donation.payment_status,
        })

    except razorpay.errors.SignatureVerificationError:
        return Response(
            {"error": "Payment signature verification failed"},
            status=400
        )

    except Exception as error:
        print(error)

        return Response(
            {"error": "Payment verification failed"},
            status=400
        )


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.filter(
        is_active=True
    ).order_by("-created_at")

    serializer_class = CampaignSerializer


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.filter(
        is_visible=True
    )

    serializer_class = TestimonialSerializer


class VolunteerViewSet(viewsets.ModelViewSet):
    queryset = Volunteer.objects.all().order_by(
        "-created_at"
    )

    serializer_class = VolunteerSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by(
        "-created_at"
    )

    serializer_class = ContactMessageSerializer


class DonationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Donation.objects.all().order_by(
        "-created_at"
    )

    serializer_class = DonationSerializer