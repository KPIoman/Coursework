from django.urls import path
from django.contrib.auth import views as auth_view
from . import views, email


urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('contacts/', views.contacts, name='contacts'),
    path('login/', views.login_view, name='login'),
    path('reset-password/', views.reset_password, name='reset password'),
    path('reset-password/<uid64>/<token>/', email.get_new_password, name='activate reset password'),
    path('reset-password/done/<uid64>/<token>/', email.set_new_password, name='reset password finally'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('activate/<uid64>/<token>/', email.activate, name='activate'),
]
