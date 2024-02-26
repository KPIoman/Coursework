from django.contrib import admin
from .models import Appointment


class AppointmentAdmin(admin.ModelAdmin):
    exclude = ('end_time', 'calendar_event_id')


# Register your models here.
admin.site.register(Appointment, AppointmentAdmin)
