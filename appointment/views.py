from django.shortcuts import render, redirect
from masters.models import Master
from services.models import Service
from django.contrib import messages
from django.http import HttpResponse
from masters.models import Master
from .models import Appointment
from masters.models import Master
from services.models import Service
from datetime import datetime
from django.utils import timezone
import json
import pytz


work_day_start = datetime.strptime('08:00:00', '%H:%M:%S').time()
work_day_end = datetime.strptime('18:00:00', '%H:%M:%S').time()


# Create your views here.
def main(request):
    if request.method == "POST":
        print(request.POST)
        master_pk = request.POST.get('master')
        service_pk = request.POST.get('service')
        date_str = request.POST.get('date')

        master_obj = Master.objects.get(pk=master_pk)
        service_obj = Service.objects.get(pk=service_pk)

        service_duration = service_obj.service_time
        start_time = timezone.datetime.strptime(date_str, '%Y-%m-%d-%H-%M')
        kiev = pytz.timezone('Europe/Kiev')
        start_time = kiev.localize(start_time)

        end_time = start_time + timezone.timedelta(minutes=service_duration)

        latitude = request.POST.get('lat')
        longitude = request.POST.get('lng')
        master_arrival_time = request.POST.get('master_arrival_time')

        if not master_arrival_time.isdigit() or int(master_arrival_time) % 30 != 0:
            messages.error(request, 'Виникла помилка з установленням часу доїзду майстра до Вашого місцезнаходження. '
                                    'Сконтактуйте з нами, будь ласка, і ми вирішим цю проблему')
            return redirect('contacts')

        master_arrival_time = timezone.timedelta(minutes=int(master_arrival_time))
        phone = request.POST.get('phone')
        home_service = False
        if latitude != '' and longitude != '' and master_arrival_time > timezone.timedelta(minutes=0):  # Перевіряєм, чи користувач замовив майстра додому
            home_service = True
            start_time = start_time - master_arrival_time
            end_time = end_time + master_arrival_time
            if phone == '':                              # Якщо користувач ввів телефон
                phone = request.user.phone

        if work_day_start <= start_time.time() and end_time.time() <= work_day_end:
            overlapping_bookings = Appointment.objects.filter(
                master=master_obj,
                start_time__lt=end_time,
                end_time__gt=start_time
            )

            if overlapping_bookings.exists():
                messages.error(request,
                               'Виберіть час, який не накладається на вже заброньовані місця чи змініть майстра')
                masters = Master.objects.all()
                return render(request, 'appointment/main_form.html', {'masters': masters})
            else:
                if request.user.is_authenticated and request.POST.get('firstname') == '' \
                        and request.POST.get('lastname') == '':
                    appointment = Appointment.objects.create(
                        user=request.user,
                        master=master_obj,
                        service=service_obj,
                        start_time=start_time,
                        end_time=end_time,
                        master_arrival_time=master_arrival_time,
                        home_service=home_service,
                        latitude=latitude,
                        longitude=longitude,
                        phone_number=phone,
                        comment=request.POST.get('comment'),
                    )
                else:
                    appointment = Appointment.objects.create(
                        first_name=request.POST.get('firstname'),
                        last_name=request.POST.get('lastname'),
                        master=master_obj,
                        service=service_obj,
                        start_time=start_time,
                        end_time=end_time,
                        master_arrival_time=master_arrival_time,
                        home_service=home_service,
                        latitude=latitude,
                        longitude=longitude,
                        phone_number=phone,
                        comment=request.POST.get('comment'),
                    )

                messages.success(request, f'Ви успішно записалися на {service_obj.service_name} до '
                                          f'{master_obj.first_name + " " + master_obj.last_name} на '
                                          f'{start_time + master_arrival_time}')
                return redirect('home')
        else:
            messages.error(request, 'Ви вибрали неправильний час')

    previous_url = request.META.get('HTTP_REFERER')
    master = service = None
    if previous_url:
        previous_url = previous_url.split('/')
        if previous_url[-2] == 'masters' and previous_url[-1].isdigit():
            master = Master.objects.get(pk=int(previous_url[-1]))
        if previous_url[-2] == 'services' and previous_url[-1].isdigit():
            service = Service.objects.get(pk=int(previous_url[-1]))
    if service:
        services = Service.objects.all()
        return render(request, 'appointment/main_form.html', {'services': services,
                                                              'service': service})
    masters = Master.objects.all()
    return render(request, 'appointment/main_form.html', {'masters': masters,
                                                          'master': master})


def api(request):
    data = json.loads(request.body)
    master = data.get('masterNumber')
    date = datetime.strptime(data.get('date'), '%Y-%m-%d')

    appointments = Appointment.objects.filter(master_id=master, start_time__date=date)

    data = [{'start_time': timezone.localtime(appointment.start_time).isoformat(),
             'end_time': timezone.localtime(appointment.end_time).isoformat()} for appointment in appointments]

    data_json = json.dumps(data)

    return HttpResponse(data_json, content_type='application/json')
