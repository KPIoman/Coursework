from django.urls import path
from django.contrib.auth import views as auth_view
from . import views


urlpatterns = [
    path('', views.main, name='appointment'),
    path('date_api/', views.api, name='date_api'),
]
