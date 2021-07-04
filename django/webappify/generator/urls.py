from django.urls import path
from . import views

urlpatterns = [
    path('generate_app', views.generate),
]
