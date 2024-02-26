from apscheduler.schedulers.background import BackgroundScheduler
from .models import Appointment
from django.utils import timezone
from datetime import timedelta


def clean_database():
    Appointment.objects.filter(start_time__lt=timezone.now() - timedelta(weeks=1)).delete()
    print('База записів очищена')


def start():
    scheduler = BackgroundScheduler()
    scheduler.add_job(clean_database, 'interval', weeks=1)
    scheduler.start()
