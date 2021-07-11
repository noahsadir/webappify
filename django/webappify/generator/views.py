from django.shortcuts import render
from django.http import HttpResponse
from django.http import FileResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from apps.models import WebApp
from .forms import CreateWebAppForm, ImageUploadForm
from PIL import Image
import uuid
import os
import favicon
from bs4 import BeautifulSoup
import requests
from io import BytesIO

# Handles output and which actions to take
@csrf_exempt
def generate(request):

    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        form = CreateWebAppForm(request.POST, request.FILES)
        if form.is_valid():
            generatedApp = saveAndGenerateWebApp(form.cleaned_data)
            if generatedApp is not None:
                webappifyLink = "https://webappify.noahsadir.io/apps/" + generatedApp['app_id']
                return JsonResponse({'success': True, 'link': webappifyLink})
        return JsonResponse({'success': False, 'message': 'Unable to create web app.'})

    # Not a POST request; generate and display form
    form = CreateWebAppForm()
    return render(request, 'generator/index.html', {'form': form})

def availableApps(request):
    return JsonResponse({'success': False, 'message': 'It works, but not really.'})

def uploadImage(request):
    projectRoot = os.path.abspath(os.path.join(os.path.dirname(__file__),".."))

    if request.method == 'POST':
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            appID = form.cleaned_data['app_id']
            uploadedFile = form.cleaned_data['image']
            if uploadedFile.size <= 10000000:
                file = open(projectRoot + "/icons/tmp/" + appID, "wb")
                file.write(uploadedFile.read())

                return JsonResponse({'success': True, 'message': 'Successfully uploaded image.'})
            else:
                return JsonResponse({'success': False, 'message': 'Image must be under 10 MB.'})
        return JsonResponse({'success': False, 'message': 'Unable to upload image.'})

    form = ImageUploadForm()
    return render(request, 'generator/index.html', {'form': form})

def uploadImageUrl(request):
    projectRoot = os.path.abspath(os.path.join(os.path.dirname(__file__),".."))
    app_id = request.GET.get('app_id')
    image_url = request.GET.get('image_url')
    if app_id is not None and image_url is not None:
        response = requests.get(image_url)
        if len(response.content) <= 10000000:
            img = Image.open(BytesIO(response.content))
            img.save(projectRoot + "/icons/tmp/" + app_id, format="png", optimize=True)
            return JsonResponse({'success': True, 'message': 'Successfully uploaded image'})
        else:
            return JsonResponse({'success': False, 'message': 'Image must be under 10 MB.'})
    return JsonResponse({'success': False, 'message': 'Unable to upload image.'})


def uniqueID(request):
    appID = str(uuid.uuid4())
    return JsonResponse({'id': appID})

def websiteMetadata(request):
    url = request.GET.get('url')
    if url is not None:
        preferredIcon = None
        websiteTitle = ''
        icons = favicon.get(url)
        iconurls = []
        maxSize = 0
        urlRequest = requests.get(url)
        soup = BeautifulSoup(urlRequest.text, 'html.parser')

        for title in soup.find_all('title'):
            websiteTitle = title.get_text()

        for icon in icons:
            if icon.width > maxSize:
                preferredIcon = icon.url
                maxSize = icon.width
            iconurls.append(icon.url)

        return JsonResponse({'success': True, 'icon_url': preferredIcon, 'title': websiteTitle})
    return JsonResponse({'success': False, 'message': 'Invalid parameters.'})

# Create a database entry for the app and generate icon set
def saveAndGenerateWebApp(cleanedData):
    appID = cleanedData['app_id']
    appTitle = cleanedData['app_title']
    appLink = cleanedData['app_link']
    appBackground = cleanedData['app_background']
    appTheme = cleanedData['app_theme']
    imageIsRounded = cleanedData['image_is_rounded']
    if createIcons(appID, imageIsRounded):
        webAppObject = WebApp(app_id=appID, app_title=appTitle, app_link=appLink, app_background=appBackground, app_theme=appTheme)
        webAppObject.save()
        return webAppObject.data()
    return None

# Generate app icons and save to server
def createIcons(appID, shouldRoundCorners):
    projectRoot = os.path.abspath(os.path.join(os.path.dirname(__file__),".."))

    pilIcon = Image.open(projectRoot + "/icons/tmp/" + appID)
    pilIcon = pilIcon.resize((1024, 1024))
    pilIcon.save(projectRoot + "/icons/image_1024_original/" + appID, format="png", optimize=True)

    pilIcon.save(projectRoot + "/icons/image_1024/" + appID, format="png", optimize=True)
    pilIcon = pilIcon.resize((512, 512))
    pilIcon.save(projectRoot + "/icons/image_512/" + appID, format="png", optimize=True)
    pilIcon = pilIcon.resize((192, 192))
    pilIcon.save(projectRoot + "/icons/image_192/" + appID, format="png", optimize=True)
    pilIcon = pilIcon.resize((32, 32))
    pilIcon.save(projectRoot + "/icons/favicon/" + appID, format="ico")

    os.remove(projectRoot + "/icons/tmp/" + appID)
    return True
