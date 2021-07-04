from django.shortcuts import render
from django.http import HttpResponse
from django.core.files import File
from apps.models import WebApp
from urllib.request import urlopen
import binascii
import os

appImage = ''
projectRoot = os.path.abspath(os.path.join(os.path.dirname(__file__),".."))

def webAppData(appID):
    objects = WebApp.objects.all().filter(app_id=appID)
    if len(objects) > 0:
        return objects[0].data()
    return None

def redirect(request, app_id):
    context = webAppData(app_id)
    return render(request, 'apps/index.html', context)

def manifest(request, app_id):
    context = webAppData(app_id)
    return render(request, 'apps/manifest.webmanifest', context)

def serviceWorker(request, app_id):
    context = webAppData(app_id)
    return render(request, 'apps/worker.js', None, "text/javascript")

def favicon(request, app_id):
    global projectRoot
    return HttpResponse(open(projectRoot + '/icons/favicon/' + app_id, 'rb'), content_type="image/ico")

def appleTouchIcon(request, app_id):
    global projectRoot
    return HttpResponse(open(projectRoot + '/icons/image_1024_original/' + app_id, 'rb'), content_type="image/png")

def mainIconLarge(request, app_id):
    global projectRoot
    return HttpResponse(open(projectRoot + '/icons/image_1024/' + app_id, 'rb'), content_type="image/png")

def mainIconMedium(request, app_id):
    global projectRoot
    return HttpResponse(open(projectRoot + '/icons/image_512/' + app_id, 'rb'), content_type="image/png")

def mainIconSmall(request, app_id):
    global projectRoot
    return HttpResponse(open(projectRoot + '/icons/image_192/' + app_id, 'rb'), content_type="image/png")
