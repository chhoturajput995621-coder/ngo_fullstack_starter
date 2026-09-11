from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CampaignViewSet,
    TestimonialViewSet,
    VolunteerViewSet,
    ContactMessageViewSet,
    DonationViewSet,
    health_check,
    create_razorpay_order,
    verify_razorpay_payment,
)


router = DefaultRouter()

router.register("campaigns", CampaignViewSet)
router.register("testimonials", TestimonialViewSet)
router.register("volunteers", VolunteerViewSet)
router.register("contacts", ContactMessageViewSet)
router.register("donations", DonationViewSet)


urlpatterns = [
    path(
        "health/",
        health_check,
        name="health"
    ),

    path(
        "payments/create-order/",
        create_razorpay_order,
        name="create-razorpay-order"
    ),

    path(
        "payments/verify/",
        verify_razorpay_payment,
        name="verify-razorpay-payment"
    ),
]

urlpatterns += router.urls