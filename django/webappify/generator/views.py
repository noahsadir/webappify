from django.shortcuts import render
from django.http import HttpResponse
from django.http import FileResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from apps.models import WebApp
from .forms import CreateWebAppForm
from PIL import Image
import uuid
import os

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

# Create a database entry for the app and generate icon set
def saveAndGenerateWebApp(cleanedData):
    appID = str(uuid.uuid4())
    appTitle = cleanedData['app_title']
    appLink = cleanedData['app_link']
    appBackground = cleanedData['app_background']
    appTheme = cleanedData['app_theme']
    if createIcons(cleanedData['image'], appID):
        webAppObject = WebApp(app_id=appID, app_title=appTitle, app_link=appLink, app_background=appBackground, app_theme=appTheme)
        webAppObject.save()
        return webAppObject.data()
    return None

# Generate app icons and save to server
def createIcons(uploadedFile, appID):
    if uploadedFile.size < 10000000:
        projectRoot = os.path.abspath(os.path.join(os.path.dirname(__file__),".."))

        file = open(projectRoot + "/icons/tmp/" + appID, "wb")
        file.write(uploadedFile.read())

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
    return False
