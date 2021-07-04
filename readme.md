# webappify

Turn any website into a Progressive Web App!

## How to use

- Visit [webappify.noahsadir.io](https://webappify.noahsadir.io). Alternatively, you can build and host it yourself.
- Enter the URL of the desired website and click enter or the arrow (->) button.
- Adjust the configuration of the web app, such as the name and icon.
- Click "Generate" and follow the instructions to install the web app.

## How to build

- Ensure that your environment is properly set up for React (Node and npm are installed).
- Create an empty react app and navigate to the root of the newly created app.
  ```
  npx create-react-app webappify
  cd webappify
  ```
- Install the required packages
  ```
  @material-ui/core

  @material-ui/lab

  react-typing-animation
  ```
- Copy src, public, api, apps folders from the repository into the current directory, replacing any existing files.
- Copy the package.json file into the current directory.
- Make sure to update folder permissions if necessary.

You should now be able to build the app.
