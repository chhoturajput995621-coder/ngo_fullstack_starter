from django.db import models


class Campaign(models.Model):
    title = models.CharField(max_length=150)
    category = models.CharField(max_length=80)
    description = models.TextField()
    image_url = models.URLField(blank=True)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def progress(self):
        if not self.target_amount:
            return 0
        return min(
            100,
            round((self.raised_amount / self.target_amount) * 100)
        )

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=80, blank=True)
    message = models.TextField()
    is_visible = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Volunteer(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=160)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"


class Donation(models.Model):
    donor_name = models.CharField(max_length=120)
    email = models.EmailField()
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    campaign = models.ForeignKey(
        Campaign,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    payment_status = models.CharField(
        max_length=30,
        default="pending"
    )

    razorpay_order_id = models.CharField(
        max_length=120,
        blank=True
    )

    razorpay_payment_id = models.CharField(
        max_length=120,
        blank=True
    )

    razorpay_signature = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.donor_name} - ₹{self.amount}"