"""
WSGI config for django_webappify project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

from pathlib import Path
import os
import time
import traceback
import signal
import sys

siteRoot = Path(__file__).resolve().parent.parent.parent

env_file = os.path.join(siteRoot, "django_env/bin/activate_this.py")
assert os.path.exists(env_file)

# Run the activation
#execfile(env_file, dict(__file__=env_file))
exec(open(env_file).read())

sys.path.append(os.path.join(siteRoot, 'django_webappify/'))
sys.path.append(os.path.join(siteRoot, 'django_env/'))

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_webappify.settings')

application = get_wsgi_application()
