# Delete old subdirectories
rm -r ./cloned_files
rm -r ./react_webappify
rm -r ./django_webappify
rm -r ./django_env

# Clone Repository
git clone https://github.com/noahsadir/webappify
mv ./webappify ./cloned_files

# Create React app and copy files
npx create-react-app react_webappify
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
virtualenv ./django_env
./django_env/bin/pip3 install django
./django_env/bin/pip3 install pillow
./django_env/bin/pip3 install favicon

# Copy Django project files and configure project
cp -r ./cloned_files/django_webappify ./
./django_env/bin/python3 ./django_webappify/manage.py makemigrations apps
./django_env/bin/python3 ./django_webappify/manage.py collectstatic
./django_env/bin/python3 ./django_webappify/manage.py sqlmigrate apps 0001
./django_env/bin/python3 ./django_webappify/manage.py migrate
chown -R www-data:www-data ./django_webappify/

# Do some clean-up
rm -r ./cloned_files
systemctl restart apache2.service
