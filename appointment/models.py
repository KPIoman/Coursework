from django.db import models
import datetime
from main.models import CustomUser as User
from services.models import Service
from masters.models import Master
from django.core.exceptions import ValidationError
from googleapiclient.discovery import build
from google.oauth2 import service_account
from django.conf import settings
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils import timezone
import os

SERVICE_ACCOUNT_FILE = os.path.join(settings.BASE_DIR, os.environ.get('SERVICE_ACCOUNT_FILE'))
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE)
service = build('calendar', 'v3', credentials=credentials)


# Create your models here.
class Appointment(models.Model):
    user = models.ForeignKey(User, verbose_name="Обліковий запис користувача", on_delete=models.CASCADE, null=True,
                             blank=True)
    first_name = models.CharField("Ім'я клієнта", max_length=30, blank=True)
    last_name = models.CharField("Прізвище клієнта", max_length=30, blank=True)

    master = models.ForeignKey(Master, verbose_name="Обраний майстер", on_delete=models.CASCADE)
    service = models.ForeignKey(Service, verbose_name="Обрана послуга", on_delete=models.CASCADE)

    start_time = models.DateTimeField('Дата та час запису клієнта')
    end_time = models.DateTimeField('Час кінця послуги', blank=True)
    master_arrival_time = models.DurationField('Час доїзду майстра до клієнта', blank=True,
                                               default=datetime.timedelta(minutes=0))

    home_service = models.BooleanField('Чи замовив клієнт додому майстра', default=False)
    latitude = models.CharField('Широта адреси клієнта', max_length=20, default='')
    longitude = models.CharField('Довгота адреси клієнта', max_length=20, default='')
    phone_number = models.CharField('Номер телефону клієнта', max_length=16, default='')

    comment = models.TextField("Коментар до запису", max_length=100, default='')

    calendar_event_id = models.CharField('ID події в календарі', max_length=100)

    def clean(self):
        if self.user is None and (self.first_name == "" or self.last_name == ""):
            raise ValidationError("Якщо користувач не авторизований, то ім'я та прізвище обов'язкові.")

    def save(self, *args, **kwargs):
        if self.latitude != '' and self.longitude != '' and self.master_arrival_time > timezone.timedelta(minutes=0):
            self._create_event('Доїзд до ' + (f'{self.first_name} {self.last_name}' if self.user is None else self.user.__str__()),
                               self.start_time,                               # час початку
                               self.start_time + self.master_arrival_time,    # час закінчення
                               f'{self.latitude} {self.longitude}',)

            self._create_event('Доїзд до барбершопу',
                               self.end_time - self.master_arrival_time,      # час початку
                               self.end_time,)                                # час закінчення

        self._create_event(
            f'{self.first_name} {self.last_name}' if self.user is None else self.user.__str__(),
            self.start_time + self.master_arrival_time,                       # час початку
            self.end_time - self.master_arrival_time,                         # час закінчення
            f'{self.latitude} {self.longitude}',
            f'{self.service.service_name}\n'
            f'{self.phone_number}\n'
            f'{self.comment}',)

        super().save(*args, **kwargs)

    def _create_event(self, summary, start_time, end_time, location='', description=''):
        event = {
            'summary': summary,
            'location': location,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
            },
            'end': {
                'dateTime': end_time.isoformat(),
            },
        }
        created_event = service.events().insert(calendarId=self.master.calendar, body=event).execute()
        self.calendar_event_id += created_event['id'] + ' '

    class Meta:
        app_label = 'masters'
        verbose_name = "запис"
        verbose_name_plural = "Записи"

    def __str__(self):
        if self.user is None:
            name = f'{self.first_name} {self.last_name}'
        else:
            name = self.user

        return f'Запис {name} до {self.master} на {self.service} на {timezone.localtime(self.start_time)}'


@receiver(post_delete, sender=Appointment)
def delete_event_from_calendar(sender, instance, **kwargs):
    for event in instance.calendar_event_id.split():
        service.events().delete(calendarId=instance.master.calendar, eventId=event).execute()
