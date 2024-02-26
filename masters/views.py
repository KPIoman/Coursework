from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Master, Review
from django.http import Http404
from django.core import serializers
from django.http import HttpResponse

# Create your views here.


def home(request):
    masters = Master.objects.all()
    return render(request, 'masters/home.html', {'masters': masters})


def master_page(request, master_number):
    try:
        master = Master.objects.get(id=master_number)
    except Master.DoesNotExist:
        raise Http404

    if request.method == "POST":
        rating = request.POST.get('rating', 5)
        content = request.POST.get('content', '')

        if 1 <= int(rating) <= 5:
            print(request.POST)
            Review.objects.filter(master=master, created_by=request.user).delete()
            review = Review.objects.create(
                master=master,
                rating=rating,
                content=content,
                created_by=request.user,
            )

            return redirect(f'/masters/{master.id}')

    return render(request, 'masters/master.html', {'master': master,
                                                   'specializations': master.specializations.split(', ')})


def api(request):
    masters = Master.objects.all()
    return HttpResponse(serializers.serialize('json', masters), content_type='application/json')
