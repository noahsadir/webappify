/*
--------------
    App.js
--------------
*/

import React from "react";
import './App.css';
import { withStyles } from '@material-ui/core/styles';

//MUI core components
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
  CircularProgress } from '@material-ui/core';

import { Alert } from '@material-ui/lab';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Typing, {Cursor} from 'react-typing-animation';
import {JSON_RETRIEVE} from './Requests';

const darkTheme = createMuiTheme({ palette: { type: "dark"} });

var didFetchWebsiteData = false;
var didUploadImage = false;
var didGenerateApp = false;

var didAttemptFetchWebsiteData = false;
var didAttemptUploadImage = false;
var didAttemptGenerateApp = false;

var savedUrl = "";
var imagePath = "../api/resources/webappify_default.png";
var titleValue = "Web App";
var uniqueID = "null";
var generatedAppLink = "https://www.example.com";

const StyledInputBase = withStyles((theme) => ({
  root:{
    width:"calc(100% - 8px)",
    margin:8,
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    fontSize: 16,
    height: 20,
    padding: '13px 26px 13px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      ].join(','),
      '&:focus': {
    borderRadius: 4,
    borderColor: '#80bdff',
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
  },
},
}))(InputBase);

/* UI code */
export default class App extends React.Component {
  constructor(props){
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
    }
    //Note: If modifying maxImageSize, make sure to adjust server-side limit
    //      in save_image.php
  }

  render(){
    var textFieldStyle = {
      underline:{'&:after': {border: '2px solid red'  }}
    };

    const handleUrlTextFieldChange = (event) => {
      this.setState({urlTextField: event.target.value});
    }

    const handleTitleTextFieldChange = (event) => {
      this.setState({appTitle: event.target.value});
    }

    const handleUrlKeyPressed = (event) => {
      if(event.key === 'Enter'){
        handleGoButtonClick(event);
      }
    }

    const handleGoButtonClick = (event) => {
      savedUrl = this.state.urlTextField;
      this.setState({isCurrentlyFetching: true});
      didAttemptFetchWebsiteData = false;
      JSON_RETRIEVE("UNIQUE_ID");
      waitUntilRequestFinished(() => {
        this.setState({isCurrentlyFetching: false});
        if (didFetchWebsiteData){
          this.setState({state: this.state,didContinueToGenerate: true,appTitle: titleValue});
        }else{
          this.setState({showSnackbarMessage: true, snackbarMessage: "An unexpected error occurred.", snackbarSeverity: "error"});
        }
      });
    }

    const handleInstructionsButtonClick = (event) => {
      this.setState({showSnackbarMessage: true, snackbarMessage: "Not implemented yet!", snackbarSeverity: "warning"});
    }

    const handleCustomImageButtonClick = (event) => {
      //IMPORTANT TODO: Change code so that image is only uploaded when generate button is clicked
      if (event.target.files.length > 0){
        didAttemptUploadImage = false;
        console.log("Found file with size " + event.target.files[0].size);
        //Should display 3MB limit to user, but allow 15% tolerance
        if (event.target.files[0].size < this.state.maxImageSize){
          var reader = new FileReader();
          reader.onload = (readerEvent) => {
            this.setState({hasCustomImage: true, customImageResult: readerEvent.target.result, customImage: event.target.files[0], showSnackbarMessage: true, snackbarMessage: "Added custom image.", snackbarSeverity: "success"});
          };
          reader.readAsDataURL(event.target.files[0]);

        }else{
          this.setState({showSnackbarMessage: true, snackbarMessage: "Image must be " + this.state.maxImageSizeDisplay + " or less.", snackbarSeverity: "error"});
        }
      }
    }

    const handleGenerateButtonClick = (event) => {
      if (didGenerateApp){
        this.setState({showSnackbarMessage: true, snackbarMessage: "An app was already generated.", snackbarSeverity: "warning"});
      }else if (!didGenerateApp && this.state.isCurrentlyFetching){
        this.setState({showSnackbarMessage: true, snackbarMessage: "An app is currently generating.", snackbarSeverity: "warning"});
      }else{
        //No app has been generated yet, so do it now
        didAttemptGenerateApp = false;
        this.setState({isCurrentlyFetching: true});

        if (this.state.hasCustomImage){
          JSON_RETRIEVE("SAVE_IMAGE",{id: uniqueID, image: this.state.customImage});
          waitUntilImageUploaded(() => {
            //this.setState({showSnackbarMessage: true, snackbarMessage: "Successfully uploaded image!", snackbarSeverity: "success"});
            if (didUploadImage){
              //Image successfully uploaded
              JSON_RETRIEVE("GENERATE_APP",{
                id: uniqueID,
                link: savedUrl,
                name: this.state.appTitle,
                rounded: this.state.shouldRoundCorners ? "1" : "0",
                siteimg: didUploadImage ? "false" : "true",
              });
              waitUntilGenerateFinished(() =>{
                this.setState({isCurrentlyFetching: false});
                if (didGenerateApp){
                  //this.setState({showSnackbarMessage: true, snackbarMessage: "Generated app WITH custom icon", snackbarSeverity: "success"});
                }else{
                  this.setState({showSnackbarMessage: true, snackbarMessage: "Error generating app.", snackbarSeverity: "error"});
                }
              });
            }else{
              this.setState({isCurrentlyFetching: false});
              this.setState({showSnackbarMessage: true, snackbarMessage: "Error uploading image.", snackbarSeverity: "error"});
            }
          });
        }else{
          JSON_RETRIEVE("GENERATE_APP",{
            id: uniqueID,
            link: savedUrl,
            name: this.state.appTitle,
            rounded: this.state.shouldRoundCorners ? "1" : "0",
            siteimg: didUploadImage ? "false" : "true",
          });
          waitUntilGenerateFinished(() =>{
            this.setState({isCurrentlyFetching: false});
            if (didGenerateApp){
              //this.setState({showSnackbarMessage: true, snackbarMessage: "Generated app W/O custom icon", snackbarSeverity: "success"});
            }else{
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
      <div id="main-content" style={{display:"flex",backgroundColor: "#111115",height:"100%",width:"100%",position:"fixed",flexFlow:"column"}}>
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
        <div style={{flexGrow: 1,display:"flex",maxHeight:96}}>
          <div style={{flexGrow: 1}}></div>
          <div style={{flexGrow: 2, paddingTop: (this.state.didFinishTypingAnimation ? 0 : 64),opacity: (didGenerateApp ? 1 : 0),animation: (this.state.didFinishTypingAnimation ? (didGenerateApp ? "fadeToHidden 1s forwards 0.5s" : "fadeToVisible 1s forwards 0.5s") : "")}}>
            <MuiThemeProvider theme={darkTheme}>
              <TextField inputProps={{autoComplete:"off",type:"url"}} autoComplete="off" onKeyDown={handleUrlKeyPressed} variant="outlined" disabled={this.state.didContinueToGenerate} onChange={handleUrlTextFieldChange} style={{color:"#ffffff",width:"100%"}} value={this.state.urlTextField}></TextField>
              <IconButton onClick={handleGoButtonClick} variant="outlined" color="background" style={{flexGrow: 1,width:64,height:64,marginLeft:-64,position:"absolute", display: (this.state.didContinueToGenerate || this.state.isCurrentlyFetching ? "none" : "inline-flex")}}>
                <Icon style={{fontSize: 24, color:"#ffffff !important"}}>arrow_forward</Icon>
              </IconButton>
              <CircularProgress color="background" style={{flexGrow: 1,width:32,height:32,padding:16,marginLeft:-64,position:"absolute",display: ((!this.state.didContinueToGenerate && this.state.isCurrentlyFetching) ? "inline-flex" : "none")}}/>
            </MuiThemeProvider>
          </div>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{display:"flex",flexFlow:"column",animation:"flexTo4 3s",animation: (this.state.didContinueToGenerate ? (didGenerateApp ? "fadeToHidden 1s forwards 0.5s" : "flexToFour 1s") : ""),flex: (this.state.didContinueToGenerate ? "4" : "2") + " 0 auto",visibility: (this.state.didContinueToGenerate ? "visible" : "hidden")}}>
          <div style={{display: "flex", flexGrow: 1}}>
            <div style={{flexGrow: 1}}></div>
            <div style={{flexGrow: 2,display:"flex",flexFlow:"column"}}>

            <Paper style={{display:"flex",flexGrow: 0,height:"fit-content",backgroundColor:"#222225 !important"}}>
              <div style={{flexGrow: 2,marginRight:16,display:"flex"}}>
                <div style={{flexGrow: 1,width:0,height:"fit-content",marginRight:16}}>
                  <img style={{borderRadius: (this.state.shouldRoundCorners ? "20%" : "0%"),float:"left",maxWidth:"100%"}} src={this.state.hasCustomImage ? this.state.customImageResult : imagePath}/>
                </div>
              </div>
              <div style={{flexGrow: 2}}>
                <MuiThemeProvider theme={darkTheme}>
                  <div style={{display:"flex"}}>
                    <div style={{flexGrow: 1}}></div>
                    <TextField onChange={handleTitleTextFieldChange} style={{flexGrow: 2,color:"#ffffff",width:"100%"}} value={this.state.appTitle}></TextField>
                    <div style={{flexGrow: 1}}></div>
                  </div>
                  <FormControlLabel
                    style={{marginTop:16}}
                    control={<Switch checked={this.state.shouldRoundCorners} onChange={handleRoundCornersSwitchChange} name="roundCornersSwitch" color="primary"/>}
                    label={<span style={{color:"#ffffff"}}>Round corners</span>}>
                  </FormControlLabel>
                  <div style={{width:"100%"}}>
                    <Button variant="outlined" color="background" style={{width:"100%",marginTop:16}}>Custom Image<input onChange={handleCustomImageButtonClick} type="file" style={{position:"absolute",width:"100%",height:"100%",opacity:0}}/></Button>
                  </div>
                  <div style={{width:"100%"}}>
                    <Button onClick={handleGenerateButtonClick} variant="contained" color="primary" style={{width:"100%",height:48,marginTop:16}}>Generate</Button>
                  </div>
                </MuiThemeProvider>
              </div>
            </Paper>
            <div style={{flexGrow: 1}}></div>

            </div>

            <div style={{flexGrow: 1}}></div>
          </div>
        </div>
        <Dialog aria-labelledby="simple-dialog-title" open={this.state.didContinueToGenerate && this.state.isCurrentlyFetching}>
          <div style={{display:"flex"}}>
            <DialogTitle style={{flex:"1 0 auto",color:"#ffffff"}} id="simple-dialog-title">{this.state.fetchMessage}</DialogTitle>
            <CircularProgress style={{flex: "1 0 auto", padding: 16, width:32,height:32}}/>
          </div>
        </Dialog>
        <MuiThemeProvider theme={darkTheme}>
          <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }}  open={this.state.showSnackbarMessage} autoHideDuration={6000} onClose={() => {this.setState({showSnackbarMessage: false})}}>
            <Alert onClose={() => {this.setState({showSnackbarMessage: false})}} severity={this.state.snackbarSeverity}>
              {this.state.snackbarMessage}
            </Alert>
          </Snackbar>
        </MuiThemeProvider>
      </div>
    );
  }
}

/* Callbacks */
function waitUntilGenerateFinished(callback){
  var requestTimeout = window.setInterval(() => {
    if (didAttemptGenerateApp){
      callback();
      window.clearInterval(requestTimeout);
    }
  }, 500);
}

function waitUntilRequestFinished(callback){
  var requestTimeout = window.setInterval(() => {
    if (didAttemptFetchWebsiteData){
      callback();
      window.clearInterval(requestTimeout);
    }
  }, 500);
}

function waitUntilImageUploaded(callback){
  var requestTimeout = window.setInterval(() => {
    if (didAttemptUploadImage){
      callback();
      window.clearInterval(requestTimeout);
    }
  }, 500);
}

/* API Listener */
export function REQUEST_LISTENER(type, success, data){
  console.log("Request " + type + " was " + (success ? "successful" : "unsuccessful") + " and returned data:");
  console.log(data);

  if (type == "UNIQUE_ID"){
    if (data.id != null){
      uniqueID = data.id;
    }
    JSON_RETRIEVE("WEBSITE_METADATA",{url: savedUrl});
  }else if (type == "WEBSITE_METADATA"){
    if (success){
      if (data.apple_touch_icon_exists == true){
        imagePath = savedUrl + "/apple-touch-icon.png";
      }else{
        imagePath = "../api/resources/webappify_default.png";
      }
      if (data.title != null){
        titleValue = data.title;
      }else{
        titleValue = "Web App";
      }
    }
    didFetchWebsiteData = true;
    didAttemptFetchWebsiteData = true;
  }else if (type == "SAVE_IMAGE"){
    if (success){
      if (data.success == true){
        imagePath = "../api/tmp/" + uniqueID + ".png";
        didUploadImage = true;
      }
    }
    didAttemptUploadImage = true;
  }else if (type == "GENERATE_APP"){
    if (success){
      if (data.success == true){
        generatedAppLink = data.link;
        didGenerateApp = true;
      }
    }
    didAttemptGenerateApp = true;
  }
}
