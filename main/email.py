from django.core.mail import EmailMessage, send_mail
from .models import CustomUser
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import render, redirect
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from Barberia import settings
from django.utils.html import strip_tags


def email_confirmation(request, existing_user, new_name):
    current_site = get_current_site(request)
    email_subject = "Підтвердження email"
    message = render_to_string('main/registration/email_confirmation.html', {
        'name': new_name,
        'domain': current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(existing_user.pk)),
        'token': generate_token.make_token(existing_user)
    })
    send_mail(
        email_subject,
        strip_tags(message),
        f"GOLD'S Barberia <{settings.EMAIL_HOST_USER}>",
        [existing_user.email],
        html_message=message
    )


class TokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return str(user.pk) + str(timestamp) + str(user.is_active)


generate_token = TokenGenerator()


def activate(request, uid64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uid64))
        user = CustomUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        user = None

    if user is not None and generate_token.check_token(user, token):
        user.is_active = True
        user.save()
        login(request, user)
        messages.success(request, "Ваш акаунт був успішно активований!")
        return redirect('profile')
    else:
        return render(request, 'main/registration/activation_failed.html')


def send_password_reset_email(user, current_site_domain):
    email_subject = 'Скидання пароля'
    message = render_to_string('main/password_reset/reset_password_email.html', {
        'user': user,
        'domain': current_site_domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': generate_token.make_token(user),
    })
    send_mail(
        email_subject,
        strip_tags(message),
        f"GOLD'S Barberia <{settings.EMAIL_HOST_USER}>",
        [user.email],
        html_message=message
    )


def get_new_password(request, uid64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uid64))
        user = CustomUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        user = None

    if user is not None and generate_token.check_token(user, token):
        return render(request, 'main/password_reset/get_new_password.html', {'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                                                              'token': generate_token.make_token(user)})
    else:
        return render(request, 'main/password_reset/password_reset_failed.html')


def set_new_password(request, uid64, token):
    if request.method == 'POST':
        try:
            uid = force_str(urlsafe_base64_decode(uid64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None

        if user is not None and generate_token.check_token(user, token):
            user.set_password(request.POST.get('password1'))
            user.save()
            messages.success(request, 'Ви успішно змінили пароль, спробуйте увійти знову')
            return redirect('login')
        else:
            return render(request, 'main/password_reset/password_set_failed.html')
