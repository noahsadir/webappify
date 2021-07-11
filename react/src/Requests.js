/*-------------------------------- *
* Requests.js                      *
* -------------------------------- *
* Helper class which fetches data  *
* from various souces and prepares *
* it for processing.               *
* -------------------------------- */

import {REQUEST_LISTENER} from './App';
var testMode = false;

/*        pain         */

export function JSON_RETRIEVE(jobID, args){
  if (testMode){
    //Retrieve sample data if API is not available
  }else{
    //Make request to API for JSON
    var urlValue = "";
    var fetchDetails = {};

    //Determine URL to send request to and the data to send with it.
    if (jobID == "UNIQUE_ID"){
      urlValue = "../api/unique_id";
    }else if (jobID == "SAVE_IMAGE"){
      var formData = new FormData();
      formData.append('app_id', args.id);
      formData.append('image',args.image);
      fetchDetails = {
        method: "POST",
        body: formData,
      };
      urlValue = "../api/upload_image";
    }else if (jobID == "SAVE_IMAGE_URL"){
      urlValue = "../api/upload_image_from_url?app_id=" + args.id + "&image_url=" + args.image_url;
    }else if (jobID == "WEBSITE_METADATA"){
      urlValue = "../api/website_metadata?url=" + args.url;
    }else if (jobID == "GENERATE_APP"){
      var formData = new FormData();
      formData.append('app_id', args.id);
      formData.append('app_title', args.name);
      formData.append('app_link', args.link);
      formData.append('app_background', '#000000');
      formData.append('app_theme', '#222222');
      formData.append('image_is_rounded', args.rounded);
      fetchDetails = {
        method: "POST",
        body: formData,
      };
      urlValue = "../api/generate_app"
      //urlValue = "../api/generate_app.php?" + "id=" + args.id + "&link=" + args.link + "&name=" + args.name + "&rounded=" + args.rounded + "&siteimg=" + args.siteimg;
    }

    console.log("fetching data from " + urlValue);
    //Fetch is not as intuitive as you would think
    fetch(urlValue,fetchDetails)
    .then(function(promise) {
      //Get the type of content
      const contentType = promise.headers.get("content-type");

      if (contentType && contentType.indexOf("application/json") !== -1) {
        //Wait for promise to be fulfilled, then return valid JSON
        return promise.json().then(data => {
          REQUEST_LISTENER(jobID,true,data);
        }).catch(function(error) {
          //Notify listener that request failed with error
          REQUEST_LISTENER(jobID,false,reportError("PROMISE_BROKEN"));
          console.log(error);
        });
      } else {
        return promise.text().then(text => {
          //The request worked, but the data is invalid. Should be JSON.
          //Notify listener that request failed with error
          REQUEST_LISTENER(jobID,false,reportError("NOT_JSON"));

        }).catch(function(error) {

          //Notify listener that request failed with error
          REQUEST_LISTENER(jobID,false,reportError("PROMISE_BROKEN"));
          console.log(error);
        });
      }
    })
    .catch(function(error) {
      //Data couldn't be fetched. Probably a network or config error
      REQUEST_LISTENER(jobID,false,reportError("NO_FETCH"));
      console.log(error);
    });
  }
}

//Generates somewhat nice error message
function reportError(type){
  return "Couldn't fetch data: ERROR_" + type;
}
