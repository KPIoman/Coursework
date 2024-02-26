from django.urls import path
from django.contrib.auth import views as auth_view
from . import views


urlpatterns = [
    path('', views.home, name='services_home'),
    path('api', views.api, name='services_api'),
    path('<int:service_number>', views.service_page, name='service_number')
]