from django import forms

class CreateWebAppForm(forms.Form):
    app_id = forms.CharField(label='App ID', max_length=256)
    app_title = forms.CharField(label='App Name', max_length=64)
    app_link = forms.CharField(label='App Link', max_length=2048)
    app_background = forms.CharField(label='Background Color', max_length=16)
    app_theme = forms.CharField(label='Theme Color', max_length=16)
    image_is_rounded = forms.BooleanField(label='Rounded Corners')

class ImageUploadForm(forms.Form):
    app_id = forms.CharField(label='App ID', max_length=256)
    image = forms.FileField(label='Icon')
