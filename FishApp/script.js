//I Saw Your Fish! PWA App - just take a picture and we gather:
// - Location
// - Date / Time Taken
// - Weather details - lots of them
// - Species and Size of the fish

//To Do: Get lake/body of water name from GeoNames API and show it on weather page and on location


//First up, register the service worker - part of PWA's

if ('serviceWorker' in navigator) {
  window.addEventListener('load' , () => {
      navigator.serviceWorker.register('/sw.js')
                .then(registration => {
          console.log('Service Worker registered with scope:' , registration.scope);
      }).catch(error => {
          console.log('Service Worker registration failed:' , error);
      });
  });
}

//Setup for mobile console debugging
// Reference to an output container, use 'pre' styling for JSON output
var consoleOutput;
var oldLog;

const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('debug');

if (myParam == "true") {

  consoleOutput = document.createElement('pre');
  document.body.appendChild(consoleOutput);

  // Reference to native method(s)
  oldLog = console.log;

  console.log = function( ...items ) {

      // Call native method first
      oldLog.apply(this,items);

      // Use JSON to transform objects, all others display normally
      items.forEach( (item,i)=>{
          items[i] = (typeof item === 'object' ? JSON.stringify(item,null,4) : item);
      });
      consoleOutput.innerHTML += items.join(' ') + '<br /><br /><br />';

  };
};

//Exif data is the meta data stored with the picture - we will use it for storing our stuff
import ExifReader from "https://esm.sh/exifreader";

//Display areas
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const statusDiv = document.getElementById('status');
const weatherInfoDiv = document.getElementById('weather-info');

//Set the version in the status
statusDiv.textContent = "v2025.01.11.05";

//Buttons
const captureBtn = document.getElementById('captureBtn'); //Take Picture
const getAnotherBtn = document.getElementById('getAnotherBtn'); //Reset to turn camera on
const tryAgainBtn = document.getElementById('tryAgainBtn'); //Back to the camera/capture content
const weatherBtn = document.getElementById('weatherBtn'); //Show Weather info
const mapBtn = document.getElementById('mapBtn'); //Show Map info
const fishInfoBtn = document.getElementById('fishInfoBtn'); //Show Fish info
const loadPictureBtn = document.getElementById('loadPictureBtn'); //Load existing picture
const savePictureBtn = document.getElementById('savePictureBtn'); //Save picture w/meta data
const retryBtn = document.getElementById('retryBtn'); //Retry image / fish info

//This holds our image stream and data
var imageData = ""; 
var imageDataBinary = "";
var imageDescription = "";
var imageQuery = "IMAGE_QUERY";
var imageType = "FISH";
var topMessage = "I saw your fish!";

//API URLs
var apiOpenWeatherURL = "https://i-saw-your-fish.deno.dev/getweatherinfo";
var apiGeoLocationURL = "https://i-saw-your-fish.deno.dev/getlocationinfo";
var apiOpenAIURL = "https://i-saw-your-fish.deno.dev/getfishinfo";

//Hold our GUID
var keyUserGUID = getStorage("keyUserGUID");

//Hold our location and weather and other stuff
var latitude = null;
var longitude = null;
var locationTime = null;
var locationInfoText = "";
var imageTitle = "";
var imageSubject = "";
var imageLocation = "";
var placeName = "";
var weatherMessage = "";
var mapMessage = "";
var blnGotPicture = false;
var blnGotPictureLocation = false;
var blnGotPictureLocationTime = false;
var blnImageLoaded = false;
var imageOrientation = "portrait";

//We need user GUID or not?
if (!keyUserGUID) {
  keyUserGUID = genGUID();
  setStorage("keyUserGUID", keyUserGUID);
}

//Lock the screen orientation, if we can
if (document.documentElement.requestFullscreen) {
  document.documentElement.requestFullscreen().catch(() => {});
}

//Make sure screen.orientation exists, and then for Safari, have to make sure screen.orientation.lock exists
if (screen.orientation) {
  if (screen.orientation.lock) {
    try {
      await screen.orientation.lock("portrait");
      console.log("Orientation locked to portrait");
    } catch (error) {
        console.error("Failed to lock orientation:", error);
        try {
          await document.documentElement.requestFullscreen();
          await screen.orientation.lock("portrait");
        } catch (fullscreenError) {
            console.error("Fullscreen mode failed:", fullscreenError);
        }
    }
  }  
}

// Access the camera
setupCamera();

toggleDisplay("capture-image-container"); //This is our starting point

// Capture photo button
captureBtn.addEventListener('click', async () => {

  //We got a picture
  blnGotPicture = true;

  toggleDisplay("loading-message-container", false);

  //Draw it on the page
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Show the captured image
  imageData = canvas.toDataURL('image/jpeg');
  imageDataBinary = context.getImageData(0, 0, canvas.width, canvas.height);
  imageDescription = "";
  document.getElementById('fish-info').innerText = imageDescription;
  photo.src = imageData;
  photo.style.display = "block";

  //Reset some data
  imageTitle = "";
  imageSubject = "";
  imageLocation = "";

   //Get Location Data - if we timeout of caching it (1 hour)
  await getLocationData();

  //All good, lets also get location name for use
  locationInfoText = await getLocationInfo();
  
  //Then add these
  imageOrientation = "portrait";

  //Show captured display
  toggleDisplay("capture-image-container", false); //2nd parm is boolean, false is dont show camer

  //And get Image Type
  identifyImage(imageTitle, imageSubject);

  console.log("Here we go");


});

// Capture photo
getAnotherBtn.addEventListener('click', async () => {
  
  //Reset all of of data element
  initializeApp();

  toggleDisplay("capture-image-container", true); //2nd parm is boolean, show camera
});

// Capture Another Photo
tryAgainBtn.addEventListener('click', () => {

  //Show capture display
  if (tryAgainBtn.disabled) {
    return;
  }  

  toggleDisplay("capture-image-container", !blnGotPicture, blnGotPicture); //2nd parm is boolean, show camera

});

// Weather Info
weatherBtn.addEventListener('click', async () => {

  if (weatherBtn.disabled) {
    return;
  }

  weatherMessage = "Loading...";
  toggleDisplay("weather-info-container");

  //Get Weather Data
  getWeatherData(latitude, longitude, locationTime); 

});

//Get location data, if not cached and not cache timed out
async function getLocationData() {

  //TimeStamp first and flag that we got it
  locationTime = new Date();
  blnGotPictureLocation = true;
  blnGotPictureLocationTime = true;

  //Get our location
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by your browser");
  
    //Get Geo Data - no geo info available so default 0
    latitude = 0;
    longitude = 0;

  } else {
    try {

      //Get our position
      const position = await getCurrentPosition();
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
   
    }
    catch (error) {

      //Get Geo Data - no geo info available so default 0
      console.log("Unable to retrieve your location");
      latitude = 0;
      longitude = 0;
    }

  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
}

// Map and GPS 
mapBtn.addEventListener('click', async () => {

  //Show capture display
  if (mapBtn.disabled) {
    return;
  }  
  
  console.log("DOING MAP: " + latitude + " and " + longitude);
  mapMessage = "Loading...";
  if (blnGotPictureLocation) {
    //Now show the map
    showMap(latitude, longitude);
    document.getElementById('map').style.display = "block";
    if (placeName != "") {
      document.getElementById('map-info').innerHTML = placeName + "<br>" + locationInfoText;
    }
    else {
      document.getElementById('map-info').innerHTML = locationInfoText;
    }
    document.getElementById('map-info').style.display = "block";

    switch (imageType.toUpperCase()) {

      case "FISH":
        mapMessage = "Where ya caught em'";
        break;

      case "FOOD":
        mapMessage = "Lookin' to eat!";
        break;

      case "DEER":
        mapMessage = "Where ya got em'";
        break;

      default:
        mapMessage = "Where ya at";
        break;

    }    
  }
  else {
    document.getElementById('map-info').innerHTML = "Unable to show location information or map.";
    document.getElementById('map-info').style.display = "block";
    document.getElementById('map').style.display = "none";
    mapMessage = "Location information not available";
  }

  toggleDisplay("map-info-container");

});

// Fish Info
fishInfoBtn.addEventListener('click', () => {

  if (fishInfoBtn.disabled) {
    return;
  }

  toggleDisplay("fish-info-container");

  //Show info on the image
  identifyFish(imageQuery); // We'll want to pass in the picture here
  document.getElementById('fish-info-photo').src = imageData;
  document.getElementById('fish-info-photo').style.display = "block";
  
});

// Load Picture
loadPictureBtn.addEventListener('click', () => {

  blnGotPicture = false;
  document.getElementById('fileInput').value = null;
  document.getElementById('fileInput').click();

});

document.getElementById('fileInput').addEventListener('change', async function(event) {

  //Load message
  toggleDisplay("loading-message-container", false); 

  const file = event.target.files[0];
  const exifTags = await ExifReader.load(file);

  //Reset the fish display
  imageDescription = "";
  document.getElementById('fish-info').innerText = imageDescription;
 
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();

    reader.onload = function(e) {

      photo.src = e.target.result;
      imageData = photo.src;
      photo.style.display = "block";

      photo.onload = function () { //This gets called when the image changes

        //If loaded from camera, skip this
        if (blnGotPicture) {
          return;
        }

        //Reset all of of data element
        initializeApp();

        const width = photo.width;
        const height = photo.height;
        if (width > height) {
          imageOrientation = "landscape";
        }
        else {
          imageOrientation = "portrait";
        }
      
        //We loaded an images
        blnImageLoaded = true;

        console.log("EXIFTAGS:", exifTags);

        //Get Location
        if (exifTags.GPSLongitude && exifTags.GPSLatitude) {
          longitude = (exifTags.GPSLongitude.description) * -1;
          latitude =  exifTags.GPSLatitude.description;
          if (isNumeric(latitude) && isNumeric(longitude)) {
            blnGotPictureLocation = true;
          }
          else {
            longitude = "";
            latitude = "";
            blnGotPictureLocation = false;
          }        
        }
        else {
          blnGotPictureLocation = false;
        }
          
        //Get Timestamp - DateTime, DateTImeDigitized, DateTimeOriginal, Date Taken
        if (exifTags.DateTime) {
          locationTime = new Date(convertToISO(exifTags.DateTime.description));
          if (exifTags.OffsetTime) {
            //Add the offset time
            var mySeconds = convertToSeconds(exifTags.OffsetTime.description);
            locationTime.setTime(locationTime.getTime() + (-1 * mySeconds * 1000)); 
          }
          blnGotPictureLocationTime = true;
        }
        else {
          locationTime = new Date();
          blnGotPictureLocationTime = false;
        }

        //Get Title/Subject
        if (exifTags.ImageDescription) {
          console.log("WE GOT SOMETHIG");
          imageTitle = exifTags.ImageDescription.description;
          imageSubject = exifTags.DocumentName.description.toUpperCase();
          console.log("XPCommnet:", exifTags.XPComment.description);
          if (exifTags.XPComment && !blnGotPictureLocation) {
            imageLocation = exifTags.XPComment.description.toUpperCase();
            if (imageLocation.includes("|")) {
              var locationArray = imageLocation.split("|")
              if (isNumeric(locationArray[1]) && isNumeric(locationArray[2])) {
                latitude = locationArray[1];
                longitude = locationArray[2];
                blnGotPictureLocation = true;
              }
              console.log("WE GOT LOC: " + latitude + " LONG: " + longitude);              
            }
          }
          else {
            imageLocation = "";
          }
          

        }
        else {
          imageTitle = "";
          imageSubject = "";
          imageLocation = "";
        }
        
        blnGotPicture = true;

        //Picture size needs to fit in window....this almost works, but distorts landscape vids
        if (imageOrientation == "landscape") {
          //photo.style.width = '80vw';
          //photo.style.height = 'auto'; // Maintain aspect ratio
        }
        else {
          photo.style.maxHeight = '50vh';
          //photo.style.width = 'auto'; // Maintain aspect ratio    
        } 
        
        //And get Image Type, if we need to
        identifyImage(imageTitle, imageSubject);
      };
    };

    reader.readAsDataURL(file);
  } else {
      photo.style.display = 'none';
      alert('Please select a valid image file.');
  }
});

// Save the picture and info
savePictureBtn.addEventListener('click', () => {

  if (savePictureBtn.disabled) {
    return;
  }

  //Save the picture and the GPS, DateTIme, Fish info
  addExifAndSave();

  toggleDisplay("fish-info-container");
  
});

// Retry picture / fish information
retryBtn.addEventListener('click', () => {

  if (retryBtn.disabled) {
    return;
  }

  //Rest descripation and then reload it
  imageDescription = "";
  imageTitle = "";
  imageSubject = "";
  toggleDisplay("fish-info-container");
  identifyFish(imageQuery);
  
});


// toggleDisplay for what we want to show
function toggleDisplay(inputType, blnShowCamera = true, blnButtonsEnabled = false) {

  //Main content areas
  document.getElementById("loading-message-container").style.display = "none";
  document.getElementById("capture-image-container").style.display = "none";
  document.getElementById("weather-info-container").style.display = "none";
  document.getElementById("map-info-container").style.display = "none";
  document.getElementById("fish-info-container").style.display = "none";

  //Main control buttons and big capture button containers
  document.getElementById("button-display").style.display = "none";
  document.getElementById("capture-buttons").style.display = "none";

  //And the 2 capture buttons themselves
  document.getElementById("captureBtn").style.display = "none";
  document.getElementById("getAnotherBtn").style.display = "none";

  //Reset the control buttons
  document.getElementById("tryAgainBtn").disabled = false;
  document.getElementById("weatherBtn").disabled = false;
  document.getElementById("mapBtn").disabled = false;
  document.getElementById("fishInfoBtn").disabled = false;
  document.getElementById("tryAgainBtn").style.opacity = "1";
  document.getElementById("weatherBtn").style.opacity = "1";
  document.getElementById("mapBtn").style.opacity = "1";
  document.getElementById("fishInfoBtn").style.opacity = "1";

  document.getElementById("bottom-message").innerHTML = "Loading...";
  document.getElementById("bottom-message").style.display = "block"; //Message at bottom....usually on
  document.getElementById("bottom-message-save").style.display = "none";

  switch (inputType) {

    case "loading-message-container":

      if (blnShowCamera) {
        document.getElementById("top-message").innerHTML = "Catch that fish!";
        document.getElementById("capture-image").style.display = "block"; //Camera
        document.getElementById("captured-image").style.display = "none"; //Picture Took
        document.getElementById("captureBtn").style.display = "block";
      }
      else {
        document.getElementById("top-message").innerHTML = topMessage;
        document.getElementById("capture-image").style.display = "none"; //Camera
        document.getElementById("captured-image").style.display = "block"; //Picture Took
        document.getElementById("getAnotherBtn").style.display = "block";
      }

      document.getElementById("capture-buttons").style.display = "flex"; //Big buttons
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("tryAgainBtn").disabled = true;
      document.getElementById("tryAgainBtn").style.opacity = "0.5";
      document.getElementById("bottom-message").style.display = "none"; //Message at bottom..here we have button instead
      document.getElementById("bottom-message-save").style.display = "none";
      break;  

    case "capture-image-container":

      if (blnShowCamera) {
        document.getElementById("top-message").innerHTML = topMessage;
        document.getElementById("capture-image").style.display = "block"; //Camera
        document.getElementById("captured-image").style.display = "none"; //Picture Took
        document.getElementById("captureBtn").style.display = "block";
      }
      else {
        document.getElementById("top-message").innerHTML = topMessage;
        document.getElementById("capture-image").style.display = "none"; //Camera
        document.getElementById("captured-image").style.display = "block"; //Picture Took
        document.getElementById("getAnotherBtn").style.display = "block";

      }

      document.getElementById("tryAgainBtn").disabled = true;
      document.getElementById("tryAgainBtn").style.opacity = "0.5";

      if (!blnButtonsEnabled) {
        document.getElementById("weatherBtn").disabled = true;
        document.getElementById("weatherBtn").style.opacity = "0.5";
        document.getElementById("mapBtn").disabled = true;
        document.getElementById("mapBtn").style.opacity = "0.5";
        document.getElementById("fishInfoBtn").disabled = true;
        document.getElementById("fishInfoBtn").style.opacity = "0.5";
      }

      document.getElementById("capture-buttons").style.display = "flex"; //Big buttons
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("bottom-message").style.display = "none"; //Message at bottom..here we have button instead
      document.getElementById("bottom-message-save").style.display = "none"; 

      break;  

    case "weather-info-container":
      document.getElementById("top-message").innerHTML = topMessage;
      document.getElementById("bottom-message").innerHTML = weatherMessage;
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("weatherBtn").disabled = true;
      document.getElementById("weatherBtn").style.opacity = "0.5";
      document.getElementById("bottom-message-save").style.display = "none";
      break;  

    case "map-info-container":
      document.getElementById("top-message").innerHTML = topMessage;
      document.getElementById("bottom-message").innerHTML = mapMessage;
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("mapBtn").disabled = true;
      document.getElementById("mapBtn").style.opacity = "0.5";
      document.getElementById("bottom-message-save").style.display = "none";
      break;  
  
    case "fish-info-container":
      document.getElementById("top-message").innerHTML = topMessage;
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("fishInfoBtn").disabled = true;
      document.getElementById("fishInfoBtn").style.opacity = "0.5";
      document.getElementById("bottom-message").style.display = "none";
      document.getElementById("bottom-message-save").style.display = "block";

      switch (imageType.toUpperCase()) {

        case "FISH":
          document.getElementById("bottom-message-save-detail").innerHTML = "Any size?";
          break;
  
        case "FOOD":
          document.getElementById("bottom-message-save-detail").innerHTML = "Them's vittles!";
          break;
  
        case "DEER":
          document.getElementById("bottom-message-save-detail").innerHTML = "That's a nice one...";
          break;
  
        default:
          document.getElementById("bottom-message-save-detail").innerHTML = "Any size?";
          break;
  
      }    
      break;  
      
    default:
      break;  

  }

  if (!blnGotPicture) {
    document.getElementById("tryAgainBtn").disabled = true;
    document.getElementById("tryAgainBtn").style.opacity = "0.5";
    document.getElementById("weatherBtn").disabled = true;
    document.getElementById("weatherBtn").style.opacity = "0.5";
    document.getElementById("mapBtn").disabled = true;
    document.getElementById("mapBtn").style.opacity = "0.5";
    document.getElementById("fishInfoBtn").disabled = true;
    document.getElementById("fishInfoBtn").style.opacity = "0.5";
  }

  document.getElementById(inputType).style.display = "flex";

}

//***************************
//Here is the code to get the weather data given the GPS location and timesteamp
//***************************

// Function to fetch and parse weather data
async function getWeatherData(latitude, longitude, dateTimeStamp) {

  var noWeatherMessage = "";
  var blnGotNeccessaryWeatherData = false;

  if (blnImageLoaded) { //Uploade from afile
    if (!blnGotPictureLocationTime && !blnGotPictureLocation) {
      noWeatherMessage = "Unable to show any weather informatation";
      weatherMessage = "Location and Time of Picture Not Available";
    }
    else {
      if (!blnGotPictureLocation) {
        noWeatherMessage = "Date / Time of Picture is: " + getDateTime(dateTimeStamp) + "<br>But unable to show weather information.";
        weatherMessage = "Location of Picture Not Available";
      } 
      else {
        if (!blnGotPictureLocationTime) {
          locationInfoText = await getLocationInfo();
          noWeatherMessage = "Location of Picture is: <br>Lat: " + latitude + "<br>Lon: " +  longitude + "<br>" + locationInfoText + "<br>But unable to show weather information.";
          weatherMessage = "Time of Picture Not Available";
        }
        else {
          //We got it so we can continue and go get the info
          blnGotNeccessaryWeatherData = true;
        }
      }
    }
  }
  else {
    if (blnGotPictureLocationTime && blnGotPictureLocation) {
      blnGotNeccessaryWeatherData = true;
    }
    else {
      noWeatherMessage = "Unable to show any weather informatation";
      weatherMessage = "Location and Time of Picture Not Available";
    }
  }

  if (!blnGotNeccessaryWeatherData) {
    weatherInfoDiv.innerHTML = noWeatherMessage;
    document.getElementById("bottom-message").innerHTML = weatherMessage;
    return weatherInfoDiv.innerHTML;
  }
  else {
    //We continue on and get the weather info
  }

  //Let's get location description first and then weather info
  try {

    weatherInfoDiv.innerText = "Getting weather data...";

    // 1. Get the forecast office and grid location based on latitude and longitude
    const pointResponse = await fetch(apiOpenWeatherURL + `?guid=${keyUserGUID}&lat=${latitude}&lon=${longitude}&dt=${toTimestamp(locationTime)}`);
    if (!pointResponse.ok) throw new Error(`Point fetch failed: ${pointResponse.statusText}`);
    
    const weatherInfo = await pointResponse.json();

    // Build weather output - wind direction 180 = from South
    var weatherData;
    if (weatherInfo.current) {
      weatherData = weatherInfo.current;
    }
    else {
      weatherData = weatherInfo.data[0];
    }
    var myDesription = toTitleCase(weatherData.weather[0].description);
    var myTempDescription = Math.round(weatherData.temp) + "&deg F";

    var weatherInfoText = "Temp: " + myTempDescription + "<br>";
    weatherInfoText = weatherInfoText + "Wind: " + Math.round(weatherData.wind_speed) + " MPH at " + weatherData.wind_deg + "&deg " + windDirection(weatherData.wind_deg) + "<br>";
    weatherInfoText = weatherInfoText + "Pressure: " + Math.round(weatherData.pressure) + " hPa / " + empericalPressure(Math.round(weatherData.pressure)) + " inHg<br>";
    weatherInfoText = weatherInfoText + "Dew Point: " + Math.round(weatherData.dew_point) + "&deg F<br>";
    weatherInfoText = weatherInfoText + "Description: " + myDesription + "<br>";

    //All good, lets also get location name
    locationInfoText = await getLocationInfo();

    //Add latitude, longitue, time
    var latLongTime = "<hr>Latt:  " + latitude + "<br>Long: " + longitude + "<br>Time: " + getDateTime(dateTimeStamp);

    //And our weather display buckets
    if (placeName != "") {
      weatherInfoDiv.innerHTML = placeName + "<br>" + weatherInfoText + latLongTime;
    }
    else {
      weatherInfoDiv.innerHTML = locationInfoText + weatherInfoText + latLongTime;
    }


    weatherMessage = myDesription + " " + myTempDescription;

    document.getElementById("bottom-message").innerHTML = weatherMessage;

    return weatherInfoDiv.innerHTML;

  } catch (error) {
    console.error("Error fetching weather data:", error);
    weatherInfoDiv.innerHTML = "Error fetching weather data";
    return weatherInfoDiv.innerHTML;
    weatherMessage = "No weather data";
  }
}

//Find location information
async function getLocationInfo() {

  //AJH THIS IS WHERE WE PARSE DIFFERENT RESULT WHEN CHANGE OUT GEOLOCTION

  var addressLines = "";
  var locationInfoText = "";

  const locationResponse = await fetch(apiGeoLocationURL + `?guid=${keyUserGUID}&lat=${latitude}&lon=${longitude}&type=${imageType}`);
  if (!locationResponse.ok) throw new Error(`Location fetch failed: ${locationResponse.statusText}`);
  const locationinfo = await locationResponse.json();
  if (locationinfo.locationInfo.includes(" - ")) {
    //We have a place name to parse
    var arrayAddressLinePieces = locationinfo.locationInfo.split(' - ');
    placeName = arrayAddressLinePieces[0].trim();
    addressLines = arrayAddressLinePieces[1].trim();
  }
  else {
    placeName = "";
    addressLines = locationinfo.locationInfo;
  }
  if (addressLines.includes(",")) {
    //Split out address lines into pieces
    var arrayAddressPieces = addressLines.split(',');
    locationInfoText = arrayAddressPieces[0].trim() + "<br>" + arrayAddressPieces[1].trim() + " " + arrayAddressPieces[2].trim() + "<br>";
  }
  else {
    locationInfoText = addressLines + "<br>";
  }

  return locationInfoText;

}

//Show off map with icon of location
function showMap(inputLatitude, inputLongitude) {

  var mapOptions = {
      center: { lat: inputLatitude, lng: inputLongitude }, // Replace with your desired coordinates
      zoom: 15 // Adjust zoom level as needed
  };
  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  const marker = new google.maps.Marker({
    position:  { lat: inputLatitude, lng: inputLongitude },
    map: map,
    title: topMessage,
    icon: {
        url: "fish-marker.png", // Custom icon (optional)
        scaledSize: new google.maps.Size(40, 40) // Resize icon
    }
});

}

//***************************
//Here is the code to call Open AI and figure out what kind of fish it is
//***************************
async function identifyFish(inputImageQuery) {

  if (imageData.length <= 0) {
      alert("Please select an image first.");
      return;
  }

  //If we loaded title/subject from image, use it
  if (imageTitle.length > 10 && imageSubject.length > 3) {
    imageDescription = imageTitle;
    if (imageSubject == "FISH" || imageSubject == "FOOD" || imageSubject == "DEER" || "OTHER") {
      imageType = imageSubject;
    }
  }

  if (imageDescription.length > 0) {
    document.getElementById('fish-info').innerHTML = imageDescription;
    document.getElementById('savePictureBtn').style.display = "block";
    document.getElementById('retryBtn').style.display = "block";
    return;
  }

  imageDescription = "Not a fish. Move on.";
  document.getElementById('fish-info').innerText = imageDescription;
  document.getElementById('savePictureBtn').style.display = "none";
  document.getElementById('retryBtn').style.display = "none";
  document.body.style.cursor  = 'default';
  
  switch (imageType.toUpperCase()) {

    case "FISH":
      inputImageQuery = inputImageQuery + "_FISH";
      fishInfoBtn.src = "fish-information.png";
      break;
    case "FOOD":
      inputImageQuery = inputImageQuery + "_FOOD";
      fishInfoBtn.src = "food-information.png";
      break;
    case "DEER":
      fishInfoBtn.src = "deer-information.png";
      inputImageQuery = inputImageQuery + "_DEER";
      break;
    case "OTHER":
      fishInfoBtn.src = "information.png";
      inputImageQuery = inputImageQuery + "_OTHER";
      break;
    default:
      //do nothing
      break;
  }  
  
  try {
    document.body.style.cursor  = 'wait';
    document.getElementById('fish-info').innerText = "Studying picture...";
  
    // Call AI to figure out fish and size
    const response = await fetch(apiOpenAIURL + `?guid=${keyUserGUID}&lat=${latitude}&lon=${longitude}&query=${inputImageQuery}`, {
        method: 'POST',
        body: imageData
    });

    if (!response.ok) throw new Error("Failed to get response from OpenAI");

    const data = await response.json();

    // Display the result
    imageDescription = `${data.choices[0].message.content}`;

    imageDescription = imageDescription.replace("**", "<b>")
    imageDescription = imageDescription.replace("**", ":</b> ")
    imageDescription = imageDescription.replaceAll("\n", "<br>")
    imageDescription = imageDescription.replaceAll("\r", "<br>")

    if (imageDescription.length > 500) {
      imageDescription = imageDescription.substring(0, 500) + "...";
    }

    document.getElementById('fish-info').innerHTML = imageDescription;
    document.getElementById('savePictureBtn').style.display = "block";
    document.getElementById('retryBtn').style.display = "block";
    document.body.style.cursor  = 'default';

  } catch (error) {
      console.error("Error identifying fish:", error);
      document.getElementById('fish-info').innerText = `Error: ${error.message}`;
      document.body.style.cursor  = 'default';
  }
}

//***************************
//Here is the code to get what type of picture this is
//***************************
async function identifyImage(inputImageDescription, inputImageType) {

  if (imageData.length <= 0) {
      alert("Please select an image first.");
      return;
  }

  try {
    document.body.style.cursor  = 'wait';

    topMessage = "Studying picture...";
    document.getElementById("top-message").innerHTML = topMessage;

    if (inputImageDescription != "" && inputImageType != "") {
      imageType = inputImageType;
      imageDescription = inputImageDescription;
    }
    else {

      // Call AI to figure out fish and size
      const response = await fetch(apiOpenAIURL + `?guid=${keyUserGUID}&lat=${latitude}&lon=${longitude}&query=${imageQuery}`, {
          method: 'POST',
          body: imageData
      });

      if (!response.ok) throw new Error("Failed to get response from OpenAI");

      const data = await response.json();

      // Process the result
      imageType = `${data.choices[0].message.content}`;
    
    }
    switch (imageType.toUpperCase()) {

      case "FISH":
        topMessage = "I saw your fish!";
        fishInfoBtn.src = "fish-information.png";
        document.getElementById('fish-info').className = "text-display";
        break;

      case "FOOD":
        topMessage = "Hog Up!";
        fishInfoBtn.src = "food-information.png";
        document.getElementById('fish-info').className = "small-text-display";
        break;

      case "DEER":
        topMessage = "That's not my deer!";
        fishInfoBtn.src = "deer-information.png";
        document.getElementById('fish-info').className = "text-display";
        break;

      default:
        topMessage = "Catch that fish!";
        fishInfoBtn.src = "information.png";
        document.getElementById('fish-info').className = "text-display";
        break;

    }
    document.getElementById("top-message").innerHTML = topMessage;
    toggleDisplay("capture-image-container", false, true); //2nd = show camer, 3rd = enable buttons
    document.body.style.cursor  = 'default';

  } catch (error) {
      console.error("Error identifying fish:", error);
      document.body.style.cursor  = 'default';
  }
}


// Helper function to convert file to base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); // Get base64 string only
        reader.onerror = error => reject(error);
    });
}

// Helper function to convert to title case
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

// Helper function to save to local storage
function setStorage(inputKey, inputValue) {
  localStorage.setItem(inputKey, inputValue);
}

// Helper function to get from loca storage
function getStorage(inputKey) {
  var outputValue = localStorage.getItem(inputKey);
  return outputValue;
}

// Helper function to delete from loca storage
function deleteStorage(inputKey) {
  localStorage.removeItem(inputKey);
  return;
}


// Helper function to convert to emperica pressure units
function empericalPressure(inputhPa) {
  
  var outputinHg = inputhPa / 33.863889532611;

  return Math.round(outputinHg);
  
}

// Helper function to translate wind degrees to direction
function windDirection(inputWindDegrees) {

  var responseDirection = "N";

  switch (true) {

    case inputWindDegrees < 12:
      responseDirection = "N";
      break;  

    case inputWindDegrees < 34:
      responseDirection = "NNE";
      break;  
  
    case inputWindDegrees < 57:
      responseDirection = "NE";
      break;  

    case inputWindDegrees < 79:
      responseDirection = "ENE";
      break;          

    case inputWindDegrees < 102:
      responseDirection = "E";
      break;  

    case inputWindDegrees < 124:
      responseDirection = "ESE";
      break;  
  
    case inputWindDegrees < 147:
      responseDirection = "SE";
      break;  

    case inputWindDegrees < 169:
      responseDirection = "SSE";
      break;          

    case inputWindDegrees < 192:
      responseDirection = "S";
      break;  

    case inputWindDegrees < 214:
      responseDirection = "SSW";
      break;  
  
    case inputWindDegrees < 237:
      responseDirection = "SW";
      break;  

    case inputWindDegrees < 259:
      responseDirection = "WSW";
      break;      

    case inputWindDegrees < 282:
      responseDirection = "W";
      break;  

    case inputWindDegrees < 304:
      responseDirection = "WNW";
      break;  
  
    case inputWindDegrees < 327:
      responseDirection = "NW";
      break;  

    case inputWindDegrees < 349:
      responseDirection = "NNW";
      break;      

    default:
      responseDirection = "N";
      break;  
  
  }

  return responseDirection;

}

// Helper function to  get a formatted date/time
function getDateTime(inputDateTIme) {

  var timeStamp;
  var dateStamp;

  if (inputDateTIme) {
    timeStamp = inputDateTIme;
  }
  else {
    timeStamp = Date.now();
  }

  dateStamp = new Date(timeStamp);

  // Format the date
  const formattedDate = dateStamp.toLocaleDateString();
  const formattedTime = dateStamp.toLocaleTimeString();

  var responseDateTime = formattedDate + " " + formattedTime;

  return responseDateTime;

}

// Helper function to  get a GUID
function genGUID() {

  var timeStamp = Date.now();
  var randomNumber = Math.random();
  var myGUID = timeStamp.toString() + randomNumber.toString().replace(".", "-");
  
  return myGUID;

}

function toTimestamp(inputDate) {
  return Math.floor(inputDate.getTime() / 1000);
}

function convertToISO(dateString) {
  // Split the input string into date and time parts
  const [datePart, timePart] = dateString.split(' ');

  // Replace colons in the date part with hyphens
  const formattedDate = datePart.replace(/:/g, '-');

  // Combine the formatted date with the time part
  const isoString = `${formattedDate}T${timePart}.000Z`;

  return isoString;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function convertToSeconds(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60;
}


//Here is the file save stuff
 // Helper functions for GPS EXIF formatting
 function toDMS(value) {
  const degrees = Math.floor(value);
  const minutesFloat = (value - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 100) / 100;
  return [
      [degrees, 1],
      [minutes, 1],
      [seconds * 100, 100] // Stored as rational numbers
  ];
}

function getGPSRef(value, positiveRef, negativeRef) {
  return value >= 0 ? positiveRef : negativeRef;
}

// Function to add EXIF metadata and save the image
async function addExifAndSave() {

  var exifObj;
  var imageLocationString = "GPS|" + latitude + "|" + longitude;

  //Take image and make it binary
  const binaryImage = atob(imageData.split(',')[1]);

  // Create an array buffer from the binary image
  const arrayBuffer = new Uint8Array(binaryImage.length);
  for (let i = 0; i < binaryImage.length; i++) {
      arrayBuffer[i] = binaryImage.charCodeAt(i);
  }

  // Current datetime
  if (!locationTime) {
    locationTime = new Date();
  }
  const dateTime = locationTime.toISOString().replace(/-/g, ':').split('T').join(' ').split('.')[0];

  // Insert EXIF metadata using piexifjs
  if (blnGotPictureLocation) {
    exifObj = {
      "0th": {
          [piexif.ImageIFD.ImageDescription]: imageDescription, //Titel and Subject are in this
          [piexif.ImageIFD.DocumentName]: imageType,
          [piexif.ImageIFD.DateTime]: dateTime, // Date and time in the main image metadata
          [piexif.ImageIFD.XPComment]: stringToUCS2Array(imageLocationString) //We will hijack this for location information
      },
      "Exif": {
          [piexif.ExifIFD.DateTimeOriginal]: dateTime, // Original datetime
          [piexif.ExifIFD.DateTimeDigitized]: dateTime // Digitization datetime
      },
      "GPS": {
          [piexif.GPSIFD.GPSLatitudeRef]: getGPSRef(latitude, "N", "S"),
          [piexif.GPSIFD.GPSLatitude]: toDMS(Math.abs(latitude)),
          [piexif.GPSIFD.GPSLongitudeRef]: getGPSRef(longitude, "E", "W"),
          [piexif.GPSIFD.GPSLongitude]: toDMS(Math.abs(longitude))
      }
    };
  }
  else {
    exifObj = {
      "0th": {
          [piexif.ImageIFD.ImageDescription]: imageDescription, //Titel and Subject are in this
          [piexif.ImageIFD.DocumentName]: imageType,
          [piexif.ImageIFD.DateTime]: dateTime // Date and time in the main image metadata
      },
      "Exif": {
          [piexif.ExifIFD.DateTimeOriginal]: dateTime, // Original datetime
          [piexif.ExifIFD.DateTimeDigitized]: dateTime // Digitization datetime
      }
    };
  }


  // Generate EXIF data and insert it into the binary image
  const exifBytes = piexif.dump(exifObj);
  const binaryImageWithExif = piexif.insert(exifBytes, binaryImage);

  // Convert again to array buffer after added exif dat
  const arrayBuffer2 = new Uint8Array(binaryImageWithExif.length);
  for (let i = 0; i < binaryImageWithExif.length; i++) {
      arrayBuffer2[i] = binaryImageWithExif.charCodeAt(i);
  }

  // Create a Blob for saving
  const blob = new Blob([arrayBuffer2], { type: "image/jpeg" });
  const url = URL.createObjectURL(blob);
 
  // Create a download link
  const linkB = document.createElement("a");
  linkB.href = url;
  //linkB.download = "image_with_exif.jpg";
  linkB.download = generateImageName();
  linkB.click();
}

//Generate name of image
function generateImageName() {

  var fileDateTime = getDateTime(locationTime).toString().replaceAll(" ", "-").replaceAll("_", "-").replaceAll("/", "-").replaceAll(":", "-");
  var responseName = "_FILENAME_" + fileDateTime + ".jpg";
  var tempFishInfo = "";

  //See if a fish, and if so, use that in the file name
  if (!imageDescription.includes("This is not a fish.")) {

    //It is a fish and output is in this format
    //Species: Walleye
    //Length: 23.4 in.

    // Split the string into lines
    const tempArray = imageDescription.split(/\r?\n|\r/);

    // Iterate through each line and display it
    tempArray.forEach((line, index) => {

        if (line.includes("Species: ")) {
          tempFishInfo = tempFishInfo + line.replace("Species: ", "") + "-";
        }
        if (line.includes("Length: ")) {
          tempFishInfo = tempFishInfo + line.replace("Length: ", "") + "-";
        }
    });

    //Clean it up
    tempFishInfo = tempFishInfo.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-");
    responseName = responseName.replace("_FILENAME_", "i-saw-your-fish-" + tempFishInfo);
  }
  else {
    responseName = responseName.replace("_FILENAME_", "i-did-not-see-your-fish-");
  }

  return responseName;

}

//Reset all of our key data pieces
function initializeApp() {

  blnGotPictureLocation = false;
  blnGotPictureLocationTime = false;
  blnImageLoaded = false;
  weatherInfoDiv.innerHTML = "Nothing to see here";
  document.getElementById('fish-info').innerText = "Nothing to see here";

}

//Turn Camera on
function setupCamera() {

  if (navigator.mediaDevices) {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          video.srcObject = stream;
        })
        .catch(error => {
          console.error("Error accessing the camera", error);
          statusDiv.textContent = "Camera access is required to take a photo.";
      });
    }
    else {
      console.error("Error accessing the camera");
      statusDiv.textContent = "Camera access is required to take a photo.";
    }
  }
  else {
    console.error("Error accessing the camera");
    statusDiv.textContent = "Camera access is required to take a photo.";
  }

}

function stringToUCS2Array(str) {
  const arr = [];
  for (let i = 0; i < str.length; i++) {
    // 2 bytes per character, low-order byte first
    arr.push(str.charCodeAt(i));  // low-order byte
    arr.push(0);                  // high-order byte
  }
  return arr;
}
