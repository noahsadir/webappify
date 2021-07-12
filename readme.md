# Webappify

Turn any website into a standalone web app!

## How to use

- Visit [webappify.noahsadir.io](https://webappify.noahsadir.io). Alternatively, you can build and host it yourself.
- Enter the URL of the desired website and click enter or the arrow (->) button.
- Adjust the configuration of the web app, such as the name and icon.
- Click "Generate" and follow the instructions to install the web app.

## Implementation Details

The front-end is written using React with several 3rd party libraries. The back-end, originally written in PHP, now uses Django, which allows for a much more scalable and feature-rich Implementation.

### Front-end

The front-end is primarily responsible for gathering this information with the help of the user and a couple of backend.

In order to generate the web app, a couple details are needed:
- Unique app ID
- App name
- App icon
- Website URL
- Theme & background color

The backend contains some API calls to help get this information (details are listed below). After this information is collected, a request is made to the backend to generate the app.

Several icons are generated based on the provided image and the remaining info is uploaded to the database.

After generation, the app can be accessible from the following link:
```
https://webappify.noahsadir.io/apps/UNIQUE_APP_ID
```

### Back-end

The back-end is written with Django and consists of two parts: a REST API and content delivery system.

#### API

The API handles app generation and assists with gathering data necessary for generation.

The following API calls are accessible from the following url:
```
https://webappify.noahsadir.io/api/
```

- ```unique_id```

Generates a unique app ID which is used to identify assets and metadata unique to the web app.

- ```upload_image```

Uploads a user-provided icon which is associated with the app ID.

- ```upload_image_from_url```

Uploads an image from a provided URL, typically from the website specified by the user, or the location of the default icon which is used when no other icon is provided.

- ```website_metadata```

Attempts to retrieve a title and icon from the specified website.

- ```generate_app```

Generates a web app associated with a unique ID.

#### Content Delivery

With the help of templates, Django dynamically serves content based on the information specific to the web app.

The following files are accessible from the following URL:
```
https://webappify.noahsadir.io/apps/UNIQUE_APP_ID/
```

- ```index.html```

This page is what the user first sees when the link is visited. It redirects to the desired website after the app is installed.

- ```worker.js```

This is the service worker which is required in order to make the app installable. Since this web app is just a wrapper for a website, not much needs to be done besides basic caching and version control.

- ```manifest.webmanifest```

Also required for PWA qualification, the manifest contains all of the app's metadata and locates all of the required assets, such as the starting point, service worker, and app icons.

- ```main-icon.png```

A 1024x1024 PNG file which serves as the large main icon.

- ```main-icon-512.png```

A 512x512 PNG file which serves as the medium main icon.

- ```main-icon-192.png```

A 192x192 PNG file which serves as the small main icon.

- ```apple-touch-icon.png```

A 1024x1024 PNG file which serves as the icon for Apple devices.

- ```favicon.ico```

A 32x32 ICO file which serves as the website favicon.

## Notes

The server configuration for this is quite complicated.

In order for Django and React to work simultaneously, Apache needs to be configured so that Django is accessible through the domain root and the React app is accessible through a specific subdirectory, such as ```home/```.

The Apache configuration for ```webappify.noahsadir.io``` has the following properties:
- It's set up as a virtual host
- The document root points to ```django_webappify```
- The WSGIScriptAlias points to ```django_webappify\django_webappify\wsgi.py```
- The WSGIDaemonProcess points to the Python virtual environment at ```django_env```
- An alias for subdirectory ```home/``` points to the React app at ```react_webappify/build/```
- An alias for subdirectory ```static/``` points to the static Django files at ```django_webappify/static```

Django needs the following libraries installed, preferably in a virtual environment:
```
pillow
bs4
requests
```

React needs the following packages installed:
```
react-typing-animation
@material-ui/core
@material-ui/lab
```

I wrote a script does most of the heavy lifting. Please note that it assumes that everything (Node, Yarn, Python, Apache, etc.) is installed and configured properly.
```
wget https://noahsadir.io/resources/scripts/webappify-fresh-install.sh
```
