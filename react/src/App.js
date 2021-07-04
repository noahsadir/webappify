/* ------------------- *
 *       App.js        *
 * ------------------- */

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

var didFetchWebsiteData = false;
var didUploadImage = false;
var didGenerateApp = false;


var didAttempt = {
  fetchWebsiteData: false,
  uploadImage: false,
  generateApp: false,
};

var savedUrl = "";
var imagePath = "../api/resources/webappify_default.png";
var titleValue = "Web App";
var uniqueID = "null";
var generatedAppLink = "https://www.example.com";

/**
 * The React Component which primarily controls the UI and
 * handles user input and interaction.
 */
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      urlTextField: "https://",
      appTitle: "Web App",
      didContinueToGenerate: false,
      didFinishTypingAnimation: false,
      shouldRoundCorners: true,
      isCurrentlyFetching: false,
      fetchMessage: "Loading",
      showSnackbarMessage: false,
      snackbarMessage: "Error",
      snackbarSeverity: "error",
      maxImageSize: 3500000,
      maxImageSizeDisplay: "3 MB",
      hasCustomImage: false,
      customImageResult: null,
      customImage: null,
      instructionsDialogOpen: false,
      instructionsDeviceType: "chrome",
    }
    //Note: If modifying maxImageSize, make sure to adjust server-side limit
    //      in save_image.php
  }

  render() {
    var textFieldStyle = {
      underline:{'&:after': {border: '2px solid red'  }}
    };

    const handleTitleTextFieldChange = (title) => {
      this.setState({appTitle: title});
    }

    const handleUrlKeyPressed = (event) => {
      if(event.key === 'Enter') {
        handleGoButtonClick(event);
      }
    }

    const handleGoButtonClick = (savedUrl) => {
      this.setState({urlTextField: savedUrl, isCurrentlyFetching: true});
      didAttempt.fetchWebsiteData = false;
      JSON_RETRIEVE("UNIQUE_ID");
      waitUntilTrue("fetchWebsiteData", () => {
        this.setState({isCurrentlyFetching: false});
        if (didFetchWebsiteData) {
          this.setState({state: this.state,didContinueToGenerate: true,appTitle: titleValue});
        } else{
          this.setState({showSnackbarMessage: true, snackbarMessage: "An unexpected error occurred.", snackbarSeverity: "error"});
        }
      });
    }

    const handleInstructionsButtonClick = (event) => {
      this.setState({instructionsDialogOpen: true});
    }

    const handleInstructionsDialogClose = (event) => {
      this.setState({instructionsDialogOpen: false});
    }

    const handleCustomImageButtonClick = (event) => {
      //IMPORTANT TODO: Change code so that image is only uploaded when generate button is clicked
      if (event.target.files.length > 0) {
        didAttempt.uploadImage = false;
        console.log("Found file with size " + event.target.files[0].size);
        //Should display 3MB limit to user, but allow 15% tolerance
        if (event.target.files[0].size < this.state.maxImageSize) {
          var reader = new FileReader();
          reader.onload = (readerEvent) => {
            this.setState({hasCustomImage: true, customImageResult: readerEvent.target.result, customImage: event.target.files[0], showSnackbarMessage: true, snackbarMessage: "Added custom image.", snackbarSeverity: "success"});
          };
          reader.readAsDataURL(event.target.files[0]);

        } else{
          this.setState({showSnackbarMessage: true, snackbarMessage: "Image must be " + this.state.maxImageSizeDisplay + " or less.", snackbarSeverity: "error"});
        }
      }
    }

    const handleGenerateButtonClick = () => {
      if (didGenerateApp) {
        this.setState({showSnackbarMessage: true, snackbarMessage: "An app was already generated.", snackbarSeverity: "warning"});
      } else if (!didGenerateApp && this.state.isCurrentlyFetching) {
        this.setState({showSnackbarMessage: true, snackbarMessage: "An app is currently generating.", snackbarSeverity: "warning"});
      } else{
        //No app has been generated yet, so do it now
        didAttempt.generateApp = false;
        this.setState({isCurrentlyFetching: true});

        if (this.state.hasCustomImage) {
          JSON_RETRIEVE("SAVE_IMAGE",{id: uniqueID, image: this.state.customImage});
          waitUntilTrue("uploadImage", () => {
            //this.setState({showSnackbarMessage: true, snackbarMessage: "Successfully uploaded image!", snackbarSeverity: "success"});
            if (didUploadImage) {
              //Image successfully uploaded
              JSON_RETRIEVE("GENERATE_APP",{
                id: uniqueID,
                link: savedUrl,
                name: this.state.appTitle,
                rounded: this.state.shouldRoundCorners ? "1" : "0",
                siteimg: didUploadImage ? "false" : "true",
              });
              waitUntilTrue("generateApp", () =>{
                this.setState({isCurrentlyFetching: false});
                if (didGenerateApp) {
                  //this.setState({showSnackbarMessage: true, snackbarMessage: "Generated app WITH custom icon", snackbarSeverity: "success"});
                } else{
                  this.setState({showSnackbarMessage: true, snackbarMessage: "Error generating app.", snackbarSeverity: "error"});
                }
              });
            } else{
              this.setState({isCurrentlyFetching: false});
              this.setState({showSnackbarMessage: true, snackbarMessage: "Error uploading image.", snackbarSeverity: "error"});
            }
          });
        } else{
          JSON_RETRIEVE("GENERATE_APP",{
            id: uniqueID,
            link: savedUrl,
            name: this.state.appTitle,
            rounded: this.state.shouldRoundCorners ? "1" : "0",
            siteimg: didUploadImage ? "false" : "true",
          });
          waitUntilTrue("generateApp", () =>{
            this.setState({isCurrentlyFetching: false});
            if (didGenerateApp) {
              //this.setState({showSnackbarMessage: true, snackbarMessage: "Generated app W/O custom icon", snackbarSeverity: "success"});
            } else{
              this.setState({showSnackbarMessage: true, snackbarMessage: "Error generating app.", snackbarSeverity: "error"});
            }
          });
        }
      }
    }

    const handleRoundCornersSwitchChange = (event) => {
      this.setState({shouldRoundCorners: event.target.checked});
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
          appTitle={this.state.appTitle}
          didContinueToGenerate={this.state.didContinueToGenerate}
          shouldRoundCorners={this.state.shouldRoundCorners}
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
        <div style={{flexGrow: 2, paddingTop: (this.props.didFinishTypingAnimation ? 0 : 64),opacity: (didGenerateApp ? 1 : 0),animation: (this.props.didFinishTypingAnimation ? (didGenerateApp ? "fadeToHidden 1s forwards 0.5s" : "fadeToVisible 1s forwards 0.5s") : "")}}>
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
        this.props.onRoundCornersToggle();
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
      <div style={{display:"flex",flexFlow:"column",animation:"flexTo4 3s",animation: (this.props.didContinueToGenerate ? (didGenerateApp ? "fadeToHidden 1s forwards 0.5s" : "flexToFour 1s") : ""),flex: (this.props.didContinueToGenerate ? "4" : "2") + " 0 auto",visibility: (this.props.didContinueToGenerate ? "visible" : "hidden")}}>
        <div style={{display: "flex", flexGrow: 1}}>
          <div style={{flexGrow: 1}}></div>
            <div style={{flexGrow: 2,display:"flex",flexFlow:"column"}}>
            <Paper style={{display:"flex",flexGrow: 0,height:"fit-content",backgroundColor:"#222225 !important"}}>
              <div style={{flexGrow: 2,marginRight:16,display:"flex"}}>
                <div style={{flexGrow: 1,width:0,height:"fit-content",marginRight:16}}>
                  <img style={{borderRadius: (this.props.shouldRoundCorners ? "20%" : "0%"),float:"left",maxWidth:"100%"}} src={this.props.hasCustomImage ? this.props.customImageResult : imagePath}/>
                </div>
              </div>
              <div style={{flexGrow: 2}}>
                <div style={{display:"flex"}}>
                  <div style={{flexGrow: 1}}></div>
                  <TextField onChange={handleTitleTextFieldChange} style={{flexGrow: 2,color:"#ffffff",width:"100%"}} value={this.props.appTitle}></TextField>
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
      <div style={{visibility: "hidden",height:0.01,display: (didGenerateApp ? "flex" : "none"),animation: (didGenerateApp ? "displayAndFadeToVisible 1s forwards 1.5s" : "")}}>
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
 * @param requestType the string name of the boolean to scan for in the didAttempt object
 * @param callback the function to call when boolIsTrue becomes true
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
 * @param type a string representing the type of API call
 * @param success a boolean indicating whether the call was successful
 * @param data the data returned by the API; typically a JSON object or plain string
*/
export function REQUEST_LISTENER(type, success, data) {
  console.log("Request " + type + " was " + (success ? "successful" : "unsuccessful") + " and returned data:");
  console.log(data);

  if (type == "UNIQUE_ID") {
    if (data.id != null) {
      uniqueID = data.id;
    }
    JSON_RETRIEVE("WEBSITE_METADATA",{url: savedUrl});
  } else if (type == "WEBSITE_METADATA") {
    if (success) {
      if (data.apple_touch_icon_exists == true) {
        imagePath = savedUrl + "/apple-touch-icon.png";
      } else{
        imagePath = "../api/resources/webappify_default.png";
      }
      if (data.title != null) {
        titleValue = data.title;
      } else{
        titleValue = "Web App";
      }
    }
    didFetchWebsiteData = true;
    didAttempt.fetchWebsiteData = true;
  } else if (type == "SAVE_IMAGE") {
    if (success) {
      if (data.success == true) {
        imagePath = "../api/tmp/" + uniqueID + ".png";
        didUploadImage = true;
      }
    }
    didAttempt.uploadImage = true;
  } else if (type == "GENERATE_APP") {
    if (success) {
      if (data.success == true) {
        generatedAppLink = data.link;
        didGenerateApp = true;
      }
    } else if (developmentMode) {
      generatedAppLink = "about:blank"
      didGenerateApp = true;
    }
    didAttempt.generateApp = true;
  }
}
