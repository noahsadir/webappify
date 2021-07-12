from django.urls import path
from . import views

urlpatterns = [
    path('<str:app_id>/', views.redirect),
    path('<str:app_id>/index.html', views.redirect),
    path('<str:app_id>/manifest.webmanifest', views.manifest),
    path('<str:app_id>/worker.js', views.serviceWorker),
    path('<str:app_id>/apple-touch-icon.png', views.appleTouchIcon),
    path('<str:app_id>/favicon.ico', views.favicon),
    path('<str:app_id>/main-icon.png', views.mainIconLarge),
    path('<str:app_id>/main-icon-512.png', views.mainIconMedium),
    path('<str:app_id>/main-icon-192.png', views.mainIconSmall)
]
