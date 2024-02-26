from django.shortcuts import render, redirect
from django.contrib import messages, admin
from .models import CustomUser
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib.auth.views import LoginView
from django.db import IntegrityError
from django.contrib.auth.models import BaseUserManager
from .email import email_confirmation, send_password_reset_email
from datetime import datetime, timedelta
from django.contrib.auth import logout
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from services.models import Service

# Create your views here.


def home(request):
    services = Service.objects.all()
    return render(request, 'main/home.html', {'services': services})


def register(request):
    print(type(request))
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = BaseUserManager.normalize_email(request.POST.get('email'))
        password = request.POST.get('password1')
        try:
            new_user = CustomUser.objects.create_user(first_name=first_name,
                                                      last_name=last_name,
                                                      email=email,
                                                      password=password,
                                                      is_active=False)
        except IntegrityError:
            existing_user = CustomUser.objects.get(email=email)
            if not existing_user.is_active:
                if datetime.now() - existing_user.date_joined.replace(tzinfo=None) >= timedelta(days=1):
                    existing_user.date_joined = datetime.now()
                    existing_user.first_name = first_name
                    existing_user.last_name = last_name
                    existing_user.set_password(password)
                    existing_user.save()
                    email_confirmation(request, existing_user, first_name)
                return render(request, 'main/registration/wait_confirmation.html', {'name': first_name})
            else:
                messages.error(request, 'Такий email вже існує')
                return render(request, 'main/registration/register.html')

        email_confirmation(request, new_user, first_name)
        return render(request, 'main/registration/wait_confirmation.html', {'name': first_name})

    else:
        return render(request, 'main/registration/register.html')


def login_view(request):
    template_name = 'main/login/login.html'
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        next_url = request.POST['next']
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            if not any(x in next_url for x in ['logout', 'login', 'register', 'reset-password']) and next_url != 'None':
                return redirect(next_url)
            elif 'reset-password' in next_url:
                messages.success(request, 'Ви успішно скинули пароль.')
            return redirect('/profile')
        else:
            messages.error(request, 'Ви ввели невірний email або пароль, спробуйте знову')
    return render(request, template_name, {'next': request.META.get('HTTP_REFERER')})


@login_required()
def profile(request):
    if request.method == 'POST':
        print(request.POST)
        old_password = request.POST.get("old_password")
        new_password = request.POST.get("new_password")
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        phone = request.POST.get("phone")
        if first_name and first_name != '':
            request.user.first_name = first_name
        if last_name and last_name != '':
            request.user.last_name = last_name
        if phone and phone != '':
            request.user.phone = phone
        if old_password and old_password != '':
            if request.user.check_password(old_password):
                if not request.user.check_password(new_password):
                    request.user.set_password(new_password)
                    request.user.save()
                    messages.success(request, 'Ви успішно змінили пароль')
                    login(request, request.user)
                    return redirect('home')
                else:
                    messages.error(request, 'Новий пароль збігається із старим, спробуй ще раз')
            else:
                messages.error(request, 'Ти ввів неправильний старий пароль, спробуй ще раз')
            return render(request, 'main/profile.html')
        request.user.save()

    if request.user.is_superuser:
        return redirect('/admin')
    else:
        return render(request, 'main/profile.html')


def logout_view(request):
    logout(request)
    return render(request, 'main/login/logout.html')


def about(request):
    return render(request, 'main/about.html')


def contacts(request):
    return render(request, 'main/contacts.html')


def reset_password(request):
    if request.method == 'POST':
        data = request.POST['data']

        try:
            validate_email(data)
        except ValidationError as e:  # Значить телефон
            user = CustomUser.objects.filter(phone=data).first()
        else:
            user = CustomUser.objects.filter(email=data).first()

        if user:
            send_password_reset_email(user, request.META['HTTP_HOST'])
            return render(request, 'main/password_reset/reset_password_done.html', {'data': data})
        else:
            messages.error(request, 'Ви ввели неіснуючий email або телефон')
    return render(request, 'main/password_reset/reset_password.html')

