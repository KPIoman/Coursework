from django.urls import path
from django.contrib.auth import views as auth_view
from . import views


urlpatterns = [
    path('', views.home, name='masters_home'),
    path('api', views.api, name='masters_api'),
    path('<int:master_number>', views.master_page, name='master_number')
]