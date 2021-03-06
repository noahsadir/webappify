/* -------------------------------- *
 * App.js                           *
 * -------------------------------- *
 * Central point of the app.        *
 * -------------------------------- */

import React from "react";
import './App.css';

//MUI core components
import { withStyles } from '@material-ui/core/styles';
import {
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  TextField,
  Paper,
  InputBase,
  FormGroup,
  FormControlLabel,
  Switch,
  IconButton,
  Icon,
  CircularProgress,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@material-ui/core';
import { Alert, ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Typing, {Cursor} from 'react-typing-animation';
import {JSON_RETRIEVE} from './Requests';

const darkTheme = createMuiTheme({ palette: { type: "dark"} });
const ExpandingTabs = withStyles((theme) => ({
  root: {
    width: "100%",
    minWidth: 256,
  },
  grouped: {
    width: "50%",
  },
}))(ToggleButtonGroup);


var developmentMode = false;

//Indicates whether a certain action was attempted, primarily for callback purposes.
var didAttempt = {
  fetchWebsiteData: false,
  uploadImage: false,
  generateApp: false,
};

//Indicates whether a certain action was successful
var wasSuccess = {
  fetchWebsiteData: false,
  uploadImage: false,
  generateApp: false,
}

//Contains the state of the web app to generate.
var appToGenerate = {
  id: null,
  name: "Web App",
  link: "https://",
  rounded: true,
}

var imageUrlToUpload = "https://webappify.noahsadir.io/static/webappify_default.png";
var generatedAppLink = "https://webappify.noahsadir.io";

/*
 * The React Component which primarily controls the UI and
 * handles user input and interaction.
 */
export default class App extends React.Component {
  constructor(props) {
    super(props);

    /*
    //Possible new layout for state variables
    timing: {
      didContinueToGenerate: false,
      didFinishTypingAnimation: false,
      isCurrentlyFetching: false,
    },
    snackbar: {
      message: "Error",
      severity: "error",
      visible: false,
    },
    customImage: {
      maxSize: 10000000,
      maxSizeDisplay: "10 MB",
      exists: false,
      result: null,
      image: null,
    },
    instructionsDialog: {
      open: false,
    },
    */

    this.state = {
      didContinueToGenerate: false,
      didFinishTypingAnimation: false,
      isCurrentlyFetching: false,
      fetchMessage: "Loading",
      showSnackbarMessage: false,
      snackbarMessage: "Error",
      snackbarSeverity: "error",
      maxImageSize: 10000000,
      maxImageSizeDisplay: "10 MB",
      hasCustomImage: false,
      customImageResult: null,
      customImage: null,
      instructionsDialogOpen: false,
    }
  }

  render() {

    //Update web app title
    const handleTitleTextFieldChange = (title) => {
      appToGenerate.name = title
      this.setState({state: this.state})
    }

    //If user hits enter on URL textfield, treat it as if the "Go" button was clicked
    const handleUrlKeyPressed = (event) => {
      if(event.key === 'Enter') {
        handleGoButtonClick(event);
      }
    }

    //User hit arrow or pressed enter on textfield; try to autofill some to make the web app
    const handleGoButtonClick = (url) => {
      appToGenerate.link = url;
      this.setState({isCurrentlyFetching: true});
      didAttempt.fetchWebsiteData = false;
      JSON_RETRIEVE("UNIQUE_ID");
      waitUntilTrue("fetchWebsiteData", () => {
        this.setState({isCurrentlyFetching: false});
        if (wasSuccess.fetchWebsiteData) {
          this.setState({state: this.state, didContinueToGenerate: true});
        } else {
          this.setState({showSnackbarMessage: true, snackbarMessage: "An unexpected error occurred.", snackbarSeverity: "error"});
        }
      });
    }

    //Open instructions dialog
    const handleInstructionsButtonClick = (event) => {
      this.setState({instructionsDialogOpen: true});
    }

    //Close instructions dialog
    const handleInstructionsDialogClose = (event) => {
      this.setState({instructionsDialogOpen: false});
    }

    //Upload custom image
    const handleCustomImageButtonClick = (event) => {
      //See if any files were uploaded
      if (event.target.files.length > 0) {
        didAttempt.uploadImage = false;
        console.log("Found file with size " + event.target.files[0].size);
        //Should display 10 MB limit to user, but allow 15% tolerance
        if (event.target.files[0].size < this.state.maxImageSize) {
          var reader = new FileReader();
          reader.onload = (readerEvent) => {
            //Save data for uploaded image
            this.setState({hasCustomImage: true, customImageResult: readerEvent.target.result, customImage: event.target.files[0], showSnackbarMessage: true, snackbarMessage: "Added custom image.", snackbarSeverity: "success"});
          };
          reader.readAsDataURL(event.target.files[0]);
        } else{
          //Notify user that image is too large
          this.setState({showSnackbarMessage: true, snackbarMessage: "Image must be " + this.state.maxImageSizeDisplay + " or less.", snackbarSeverity: "error"});
        }
      }
    }

    //Toggle setting for whether icon corners should be rounded
    const handleRoundCornersSwitchChange = (event) => {
      appToGenerate.rounded = event.target.checked;
      this.setState({state: this.state});
    }

    //Upload desired image and generate the web app
    const handleGenerateButtonClick = () => {

      //Make sure app generation request wasn't already made (prevents duplicate requests)
      if (wasSuccess.generateApp) {
        this.setState({showSnackbarMessage: true, snackbarMessage: "An app was already generated.", snackbarSeverity: "warning"});
      } else if (!wasSuccess.generateApp && this.state.isCurrentlyFetching) {
        this.setState({showSnackbarMessage: true, snackbarMessage: "An app is currently generating.", snackbarSeverity: "warning"});
      } else{

        //No app has been generated yet, so do it now
        didAttempt.generateApp = false;
        this.setState({isCurrentlyFetching: true});

        //Upload image file directly if one was given, otherwise upload image from the specified URL
        if (this.state.hasCustomImage) {
          JSON_RETRIEVE("SAVE_IMAGE",{id: appToGenerate.id, image: this.state.customImage});
        } else {
          JSON_RETRIEVE("SAVE_IMAGE_URL",{id: appToGenerate.id, image_url: imageUrlToUpload});
        }

        //After image is uploaded, generate the app
        waitUntilTrue("uploadImage", () => {
          if (wasSuccess.uploadImage) {
            JSON_RETRIEVE("GENERATE_APP", appToGenerate);
            waitUntilTrue("generateApp", () =>{
              this.setState({isCurrentlyFetching: false});

              //Couldn't generate app; notify user
              if (!wasSuccess.generateApp) {
                this.setState({showSnackbarMessage: true, snackbarMessage: "Error generating app.", snackbarSeverity: "error"});
              }
            });
          } else{

            //Can't upload image; don't generate app
            this.setState({isCurrentlyFetching: false});
            this.setState({showSnackbarMessage: true, snackbarMessage: "Error uploading image.", snackbarSeverity: "error"});
          }
        });
      }
    }

    return (
      <div id="main-content" style={{display:"flex",backgroundColor: "#111115",height:"100%",width:"100%",position:"fixed",flexFlow:"column"}}><MuiThemeProvider theme={darkTheme}>
        <div style={{flexGrow: (this.state.didContinueToGenerate ? 0 : 1),animation:(this.state.didContinueToGenerate ? "flexToZero 1s" : "")}}>
        </div>
        <div style={{flexGrow: 1,maxHeight:128}}>
          <p className="dynamicWebappifyTitle" style={{margin: 0,marginTop:32,color:"#ffffff",fontFamily:'monospace',textAlign:"center",fontWeight:300}}>
            <span style={{color:"#3f51b5",display:"inline"}}>{"<"}</span>
            <Typing onFinishedTyping={() => {this.setState({didFinishTypingAnimation: true})}} speed={75} className="inline" cursor={<Cursor className="cursor"/>}>
              <span>webappify</span>
            </Typing>
            <span style={{color:"#3f51b5",display:"inline"}}>{"/>"}</span>
          </p>
        </div>
        <AppGeneratedView
          onInstructionsButtonClick={handleInstructionsButtonClick}/>
        <WebsiteURLView
          onUrlEntered={handleGoButtonClick}
          didFinishTypingAnimation={this.state.didFinishTypingAnimation}
          didContinueToGenerate={this.state.didContinueToGenerate}
          isCurrentlyFetching={this.state.isCurrentlyFetching}/>
        <AppConfigurationView
          didContinueToGenerate={this.state.didContinueToGenerate}
          shouldRoundCorners={appToGenerate.rounded}
          hasCustomImage={this.state.hasCustomImage}
          customImageResult={this.state.customImageResult}
          onAppTitleChange={handleTitleTextFieldChange}
          onRoundCornersToggle={handleRoundCornersSwitchChange}
          onCustomImageButtonClick={handleCustomImageButtonClick}
          onGenerateButtonClick={handleGenerateButtonClick}/>
        <Dialog aria-labelledby="simple-dialog-title" open={this.state.didContinueToGenerate && this.state.isCurrentlyFetching}>
          <div style={{display:"flex"}}>
            <DialogTitle style={{flex:"1 0 auto",color:"#ffffff"}} id="simple-dialog-title">{this.state.fetchMessage}</DialogTitle>
            <CircularProgress style={{flex: "1 0 auto", padding: 16, width:32,height:32}}/>
          </div>
        </Dialog>
        <InstallInstructionsDialog
          instructionsDialogOpen={this.state.instructionsDialogOpen}
          onDialogClose={handleInstructionsDialogClose}/>
        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }}  open={this.state.showSnackbarMessage} autoHideDuration={6000} onClose={() => {this.setState({showSnackbarMessage: false})}}>
          <Alert onClose={() => {this.setState({showSnackbarMessage: false})}} severity={this.state.snackbarSeverity}>
            {this.state.snackbarMessage}
          </Alert>
        </Snackbar>
      </MuiThemeProvider></div>
    );
  }
}

/*
 * Container for website URL textfield.
 */
class WebsiteURLView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      urlTextField: "https://",
    }
  }

  render() {

    const handleUrlKeyPressed = (event) => {
      if(event.key === 'Enter') {
        handleGoButtonClick(event);
      }
    }

    const handleUrlTextFieldChange = (event) => {
      this.setState({urlTextField: event.target.value});
    }

    const handleGoButtonClick = (event) => {
      if (this.props.onUrlEntered != null) {
        this.props.onUrlEntered(this.state.urlTextField);
      }
    }

    return (
      <div style={{flexGrow: 1,display:"flex",maxHeight:96}}>
        <div style={{flexGrow: 1}}></div>
        <div style={{flexGrow: 2, paddingTop: (this.props.didFinishTypingAnimation ? 0 : 64),opacity: (wasSuccess.generateApp ? 1 : 0),animation: (this.props.didFinishTypingAnimation ? (wasSuccess.generateApp ? "fadeToHidden 1s forwards 0.5s" : "fadeToVisible 1s forwards 0.5s") : "")}}>
          <TextField inputProps={{autoComplete:"off",type:"url"}} autoComplete="off" onKeyDown={handleUrlKeyPressed} variant="outlined" disabled={this.props.didContinueToGenerate} onChange={handleUrlTextFieldChange} style={{color:"#ffffff",width:"100%"}} value={this.state.urlTextField}></TextField>
          <IconButton onClick={handleGoButtonClick} variant="outlined" color="background" style={{flexGrow: 1,width:64,height:64,marginLeft:-64,position:"absolute", display: (this.props.didContinueToGenerate || this.props.isCurrentlyFetching ? "none" : "inline-flex")}}>
            <Icon style={{fontSize: 24, color:"#ffffff !important"}}>arrow_forward</Icon>
          </IconButton>
          <CircularProgress color="background" style={{flexGrow: 1,width:32,height:32,padding:16,marginLeft:-64,position:"absolute",display: ((!this.props.didContinueToGenerate && this.props.isCurrentlyFetching) ? "inline-flex" : "none")}}/>
        </div>
        <div style={{flexGrow: 1}}></div>
      </div>
    );
  }
}

/*
 * Container for adjusting web app configuration.
 */
class AppConfigurationView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const handleTitleTextFieldChange = (event) => {
      if (this.props.onAppTitleChange != null) {
        this.props.onAppTitleChange(event.target.value);
      }
    }

    const handleRoundCornersSwitchChange = (event) => {
      if (this.props.onRoundCornersToggle != null) {
        this.props.onRoundCornersToggle(event);
      }
    }

    const handleCustomImageButtonClick = (event) => {
      if (this.props.onCustomImageButtonClick != null) {
        this.props.onCustomImageButtonClick(event);
      }
    }

    const handleGenerateButtonClick = (event) => {
      if (this.props.onGenerateButtonClick != null) {
        this.props.onGenerateButtonClick();
      }
    }

    return (
      <div style={{display:"flex",flexFlow:"column",animation:"flexTo4 3s",animation: (this.props.didContinueToGenerate ? (wasSuccess.generateApp ? "fadeToHidden 1s forwards 0.5s" : "flexToFour 1s") : ""),flex: (this.props.didContinueToGenerate ? "4" : "2") + " 0 auto",visibility: (this.props.didContinueToGenerate ? "visible" : "hidden")}}>
        <div style={{display: "flex", flexGrow: 1}}>
          <div style={{flexGrow: 1}}></div>
            <div style={{flexGrow: 2,display:"flex",flexFlow:"column"}}>
            <Paper style={{display:"flex",flexGrow: 0,height:"fit-content",backgroundColor:"#222225 !important"}}>
              <div style={{flexGrow: 2,marginRight:16,display:"flex"}}>
                <div style={{flexGrow: 1,width:0,height:"fit-content",marginRight:16}}>
                  <img style={{borderRadius: (this.props.shouldRoundCorners ? "20%" : "0%"),float:"left",maxWidth:"100%"}} src={this.props.hasCustomImage ? this.props.customImageResult : imageUrlToUpload}/>
                </div>
              </div>
              <div style={{flexGrow: 2}}>
                <div style={{display:"flex"}}>
                  <div style={{flexGrow: 1}}></div>
                  <TextField onChange={handleTitleTextFieldChange} style={{flexGrow: 2,color:"#ffffff",width:"100%"}} value={appToGenerate.name}></TextField>
                  <div style={{flexGrow: 1}}></div>
                </div>
                <FormControlLabel
                  style={{marginTop:16}}
                  control={<Switch checked={this.props.shouldRoundCorners} onChange={handleRoundCornersSwitchChange} name="roundCornersSwitch" color="primary"/>}
                  label={<span style={{color:"#ffffff"}}>Round corners</span>}>
                </FormControlLabel>
                <div style={{width:"100%"}}>
                  <Button variant="outlined" color="background" style={{width:"100%",marginTop:16}}>Custom Image<input onChange={handleCustomImageButtonClick} type="file" style={{position:"absolute",width:"100%",height:"100%",opacity:0}}/></Button>
                </div>
                <div style={{width:"100%"}}>
                  <Button onClick={handleGenerateButtonClick} variant="contained" color="primary" style={{width:"100%",height:48,marginTop:16}}>Generate</Button>
                </div>
              </div>
            </Paper>
            <div style={{flexGrow: 1}}></div>
          </div>
          <div style={{flexGrow: 1}}></div>
        </div>
      </div>
    );
  }
}

/*
 * View which displays after web app is created successfully.
 */
class AppGeneratedView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const handleInstructionsButtonClick = (event) => {
        if (this.props.onInstructionsButtonClick != null) {
          this.props.onInstructionsButtonClick(event);
        }
    }

    return (
      <div style={{visibility: "hidden",height:0.01,display: (wasSuccess.generateApp ? "flex" : "none"),animation: (wasSuccess.generateApp ? "displayAndFadeToVisible 1s forwards 1.5s" : "")}}>
        <div style={{flexGrow: 1}}></div>
        <Paper style={{flexGrow: 4,margin: 16,padding:8, color: "#ffffff"}}>
          <p style={{width:"100%",textAlign:"center",fontSize:20,fontWeight:500}}>Your web app was created successfully!</p>
          <div style={{width:"100%",display:"flex"}}>
            <div style={{flexGrow: 1}}></div>
            <Button onClick={handleInstructionsButtonClick} variant="contained" color="primary" style={{flexGrow: 1, marginTop:8, marginBottom: 8}}>How to Install</Button>
            <div style={{flexGrow: 1}}></div>
          </div>
          <p style={{width:"100%",textAlign:"center",fontSize:16}}>Alternatively, you can click or copy & paste the link below:</p>
          <p style={{width:"100%",textAlign:"center"}}><a href={generatedAppLink} style={{fontSize:16, color:"#6f83dd",textDecoration:"none",wordBreak:"break-all"}} target="_blank">{generatedAppLink}</a></p>
        </Paper>
        <div style={{flexGrow: 1}}></div>
      </div>
    );
  }
}

/*
 * Dialog for web app installation instructions.
 */
class InstallInstructionsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instructionsDeviceType: "chrome",
    }
  }

  render() {

    const handleInstructionsDeviceChange = (event,newAlignment) => {
      if (newAlignment != null){
        this.setState({instructionsDeviceType: newAlignment});
      }
    }

    const handleInstructionsDialogClose = () => {
      if (this.props.onDialogClose != null) {
        this.props.onDialogClose();
      }
    }

    return (
      <Dialog open={this.props.instructionsDialogOpen} onClose={handleInstructionsDialogClose} aria-labelledby={"alert-dialog-title"}>
        <DialogTitle id="alert-dialog-slide-title">{"Install Web App"}
          <ExpandingTabs value={this.state.instructionsDeviceType} exclusive onChange={handleInstructionsDeviceChange} aria-label="text alignment">
            <ToggleButton value={"chrome"} aria-label="left aligned">Chrome</ToggleButton>
            <ToggleButton value={"ios"} aria-label="right aligned">iOS</ToggleButton>
          </ExpandingTabs>
        </DialogTitle>
        <DialogContent style={{color:"#ffffff", maxWidth: 512}}>
          <DialogContentText id="alert-dialog-slide-description">
            <p style={{width:"100%",textAlign:"center"}}><a href={generatedAppLink} style={{fontSize:16, color:"#6f83dd",textDecoration:"none",wordBreak:"break-all"}} target="_blank">Click or copy this link</a></p>
            <div style={{display: (this.state.instructionsDeviceType == "chrome" ? "block" : "none")}}>
              <p>1) Click the Install button next to Favorites <Icon style={{fontSize: 16, color:"#ffffff !important"}}>star_border</Icon></p>
              <p>2) A small box should pop up, click Install</p>
              <p>3) A new window should open which says "Once the app is installed, it should redirect automatically."</p>
              <p>4) Close the window. A shortcut should be on your desktop or app menu.</p>
              <p style={{fontWeight:600}}>The web app should now be accessible through the newly created shortcut.</p>
            </div>
            <div style={{display: (this.state.instructionsDeviceType == "ios" ? "block" : "none")}}>
              <p>1) Click the Share <Icon style={{fontSize: 16, color:"#ffffff !important"}}>ios_share</Icon> button.</p>
              <p>2) Click on "Add to Home Screen <Icon style={{fontSize: 16, color:"#ffffff !important"}}>add_box</Icon>" (may need to scroll)</p>
              <p>3) Click <span style={{fontWeight:600}}>Add</span> at the top of the popup.</p>
              <p style={{fontWeight:600}}>The web app should now be installed and on your home screen.</p>
              <p style={{fontWeight:600, color:"#dd9800"}}>Unfortunately, there is no way to remove the navigation controls.</p>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInstructionsDialogClose} color="primary">Done</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

/**
 * Performs a scan every 0.5 seconds until desired bool is true.
 * Once the bool is true, the callback funtion is called and the scan stops.
 *
 * PARAMETERS:
 * requestType - the string name of the boolean to scan for in the didAttempt object
 * callback - the function to call when boolIsTrue becomes true
 */
function waitUntilTrue(requestType, callback) {
  var requestTimeout = window.setInterval(() => {
    if (didAttempt[requestType]) {
      callback();
      window.clearInterval(requestTimeout);
    }
  }, 500);
}

/**
 * Function that is called by when a web request (typically an API call)
 * sent from Requests responds back. Primarily for configuring variables
 * and updating UI based on data returned.
 *
 * PARAMETERS:
 * type - a string representing the type of API call
 * success - a boolean indicating whether the call was successful
 * data - the data returned by the API; typically a JSON object or plain string
*/
export function REQUEST_LISTENER(type, success, data) {
  console.log("Request " + type + " was " + (success ? "successful" : "unsuccessful") + " and returned data:");
  console.log(data);

  if (type == "UNIQUE_ID") {
    if (data.id != null) {
      appToGenerate.id = data.id;
    }
    JSON_RETRIEVE("WEBSITE_METADATA",{url: appToGenerate.link});
  } else if (type == "WEBSITE_METADATA") {
    if (success) {
      if (data.icon_url != null) {
        imageUrlToUpload = data.icon_url;
      } else{
        imageUrlToUpload = "https://webappify.noahsadir.io/static/webappify_default.png";
      }

      if (data.title != null) {
        appToGenerate.name = data.title;
      } else{
        appToGenerate.name = "Web App";
      }
    }
    wasSuccess.fetchWebsiteData = true;
    didAttempt.fetchWebsiteData = true;
  } else if (type == "SAVE_IMAGE" || type == "SAVE_IMAGE_URL") {
    if (success) {
      if (data.success == true) {
        wasSuccess.uploadImage = true;
      }
    }
    didAttempt.uploadImage = true;
  } else if (type == "GENERATE_APP") {
    if (success) {
      if (data.success == true) {
        generatedAppLink = data.link;
        wasSuccess.generateApp = true;
      }
    } else if (developmentMode) {
      generatedAppLink = "about:blank"
      wasSuccess.generateApp = true;
    }
    didAttempt.generateApp = true;
  }
}
