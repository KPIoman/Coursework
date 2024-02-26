from django.shortcuts import render, redirect
from .models import Service
from django.core import serializers
from django.http import HttpResponse
# Create your views here.


def home(request):
    services = Service.objects.all()
    parameters = request.GET
    return render(request, 'services/home.html', {'services': reversed(services)})


def service_page(request, service_number):
    service = Service.objects.get(id=service_number)
    return render(request, 'services/service.html', {'service': service})


def api(request):
    masters = Service.objects.all()
    return HttpResponse(serializers.serialize('json', masters), content_type='application/json')
