from django.db import models

class WebApp(models.Model):
    app_id = models.CharField(max_length=64)
    app_title = models.CharField(max_length=64)
    app_link = models.CharField(max_length=2048)
    app_background = models.CharField(max_length=16)
    app_theme = models.CharField(max_length=16)

    def __str__(self):
        return self.app_title

    def data(self):
        return {
            'app_id': self.app_id,
            'app_title': self.app_title,
            'app_link': self.app_link,
            'app_background': self.app_background,
            'app_theme': self.app_theme
        }
