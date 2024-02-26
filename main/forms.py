from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms
from django.contrib.auth.forms import SetPasswordForm


# class UserRegisterForm(UserCreationForm):
#     first_name = forms.CharField(label="Ім'я", max_length=20)
#     last_name = forms.CharField(label="Прізвище", max_length=20)
#
#     class Meta:
#         model = User
#         fields = ['first_name', 'last_name', 'username', 'password1', 'password2']
#
#
