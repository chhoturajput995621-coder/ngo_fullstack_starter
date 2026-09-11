from django.contrib import admin
from .models import Campaign, Testimonial, Volunteer, ContactMessage, Donation

admin.site.register(Campaign)
admin.site.register(Testimonial)
admin.site.register(Volunteer)
admin.site.register(ContactMessage)
admin.site.register(Donation)
