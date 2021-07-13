# Delete old subdirectories
rm -r ./cloned_files

# Clone Repository
git clone https://github.com/noahsadir/webappify
mv ./webappify ./cloned_files

# Create React app and copy files
rm -r ./react_webappify/public/
rm -r ./react_webappify/src/
cp -r ./cloned_files/react_webappify/public/ ./react_webappify/
cp -r ./cloned_files/react_webappify/src/ ./react_webappify/
cp ./cloned_files/react_webappify/package.json ./react_webappify/package.json

# Install React packages
cd react_webappify
yarn add react-typing-animation
yarn add @material-ui/core
yarn add @material-ui/lab
npm run build
cd ..

# Set up virtual Python environment for Django
./django_env/bin/pip3 install django
./django_env/bin/pip3 install pillow
./django_env/bin/pip3 install favicon

# Copy Django project files and configure project
cp -r ./cloned_files/django_webappify/apps/ ./django_webappify/
cp -r ./cloned_files/django_webappify/generator/ ./django_webappify/
chown -R www-data:www-data ./django_webappify/

# Do some clean-up
rm -r ./cloned_files
systemctl restart apache2.service
