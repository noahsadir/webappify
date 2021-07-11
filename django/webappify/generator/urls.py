from django.urls import path
from . import views

urlpatterns = [
    path('unique_id', views.uniqueID),
    path('upload_image', views.uploadImage),
    path('upload_image_from_url', views.uploadImageUrl),
    path('generate_app', views.generate),
    path('available_apps', views.availableApps),
    path('website_metadata', views.websiteMetadata),
]
