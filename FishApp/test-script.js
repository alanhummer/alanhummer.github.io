//To do's:
//1) X Store Lat / Long so don't query alwasy...time out in 1 hour
//2) X API Keys for Weather and Open AI in local storage? Get from server? Or setup host relay?
//2b) X Deno as a relay server w/Keys
//2c) X  If not keys, ask for key and store in local storage
//3) Camera storage thumbs of inventory to pick from instead of taking pic
//4) Stored pics select them from camera storage - use date / loc on pic for weather 
//5) X Gen user GUID and store, then to pass with requests
//6) Lock screen rotation w/full screen
//7) Flash on camera and/or use native camera
//8) Camera usage sticks to 1 browser instance....when mult open, flip to active

//We use https://openweathermap.org/
//For Historical: https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=39.099724&lon=-94.578331&dt=1643803200&appid=
//Fish info here: https://platform.openai.com/docs/overview

//TimeStamp converter: const toTimestamp = date => Math.floor(date.getTime() / 1000); 
//TimeStamp reverse: const fromTimestamp = timestamp => new Date(timestamp * 1000) 
 


const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const statusDiv = document.getElementById('status');
const weatherInfoDiv = document.getElementById('weather-info');
const weatherAPIInfoDiv = document.getElementById('weather-api-info');
const openAIAPIInfoDiv = document.getElementById('open-ai-api-info');

const captureBtn = document.getElementById('captureBtn');
const getAnotherBtn = document.getElementById('getAnotherBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
//const fishPictureBtn = document.getElementById('fishPictureBtn');
const weatherBtn = document.getElementById('weatherBtn');
const mapBtn = document.getElementById('mapBtn');
const fishInfoBtn = document.getElementById('fishInfoBtn');

//This holds our image stream
var imageData = ""; 
var imageDescription = "";

//API URLs
var apiOpenWeatherURL = "https://i-saw-your-fish.deno.dev/getweatherinfo";
var apiOpenWeatherMapURL = "https://i-saw-your-fish.deno.dev/getlocationinfo";
var apiOpenAIURL = "https://i-saw-your-fish.deno.dev/getfishinfo";

//Hold our GUID
var keyUserGUID = getStorage("keyUserGUID");

//Hold our location and weather and other stuff
var latitude = null;
var longitude = null;
var locationTime = null;
var weatherMessage = "";
var blnGotPicture = false;

//We need user GUID or not?
if (!keyUserGUID) {
  keyUserGUID = genGUID();
  setStorage("keyUserGUID", keyUserGUID);
}

//Zap any local storage keys if i have them
var keyAPIOpenAI = getStorage("keyAPIOpenAI");
if (keyAPIOpenAI) {
  deleteStorage("keyAPIOpenAI");
}
var keyAPIOpenWeatherMap = getStorage("keyAPIOpenWeatherMap");
if (keyAPIOpenWeatherMap) {
  deleteStorage("keyAPIOpenWeatherMap");
}

//Lock the screen orientation
document.documentElement.requestFullscreen().catch(() => {});
if (screen.orientation) {
  screen.orientation.lock("portrait").catch(() => {});
}

// Access the camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(error => {
    console.error("Error accessing the camera", error);
    statusDiv.textContent = "Camera access is required to take a photo.";
});

toggleDisplay("capture-image-container"); //This is our starting point

// Capture photo
captureBtn.addEventListener('click', () => {
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Show the captured image
  imageData = canvas.toDataURL('image/png');
  imageDescription = "";
  document.getElementById('fish-info').innerText = imageDescription;
  photo.src = imageData;
  photo.style.display = "block";
  blnGotPicture = true;

  //console.log("imageData", imageData);

  //Show captured display
  toggleDisplay("capture-image-container", false); //2nd parm is boolean, false is dont show camer, show pic
  
});

// Capture photo
getAnotherBtn.addEventListener('click', () => {
  toggleDisplay("capture-image-container", true); //2nd parm is boolean, show camera
});

// Capture Another Photo
tryAgainBtn.addEventListener('click', () => {

  //Show capture display
  if (tryAgainBtn.disabled) {
    return;
  }  
  toggleDisplay("capture-image-container", !blnGotPicture); //2nd parm is boolean, show camera

});

// Weather Info
weatherBtn.addEventListener('click', async () => {

  if (weatherBtn.disabled) {
    return;
  }

  //Get Location Data - if we timeout of caching it (1 hour)
  await getLocationData();

  //Get Weather Data
  getWeatherData(latitude, longitude, null); 
  toggleDisplay("weather-info-container");

});

//Get location data, if not cached and not cache timed out
async function getLocationData() {

  var blnGetLocation = false;
  if (latitude && longitude && locationTime) {

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = Date.now() - locationTime;

    // Convert to days
    const millisecondsPerHour = 1000 * 60 * 60;
    const differenceInHours = Math.floor(differenceInMilliseconds / millisecondsPerHour);

    if (differenceInHours > 0) {
      blnGetLocation = true;
    }
  }
  else {
    blnGetLocation = true;
  }

  if (blnGetLocation) {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
    
      //Get Weather Data - no geo info available so default
      latitude = 43.0731;
      longitude = -89.4012; 
      locationTime = Date.now();
   
    } else {
      try {
        const position = await getCurrentPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        locationTime = Date.now();
      }
      catch (error) {
        console.log("Unable to retrieve your location");
        latitude = 43.0731;
        longitude = -89.4012; 
        locationTime = Date.now();
      }

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

  //Get Location Data - if we timeout of caching it (1 hour)
  await getLocationData();

  //Now show the map
  showMap(latitude, longitude);

  toggleDisplay("map-info-container");

});

// Fish Info
fishInfoBtn.addEventListener('click', () => {

  if (fishInfoBtn.disabled) {
    return;
  }

  //Show info on the image
  identifyFish(); // We'll want to pass in the picture here
  toggleDisplay("fish-info-container");
  
});


// toggleDisplay for what we want to show
function toggleDisplay(inputType, blnShowCamera = true) {

  //Main content areas
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

  document.getElementById("bottom-message").style.display = "block"; //Message at bottom....usually on

  switch (inputType) {

    case "capture-image-container":

      if (blnShowCamera) {
        document.getElementById("top-message").innerHTML = "Catch that fish!";
        document.getElementById("capture-image").style.display = "block"; //Camera
        document.getElementById("captured-image").style.display = "none"; //Picture Took
        document.getElementById("captureBtn").style.display = "block";
      }
      else {
        document.getElementById("top-message").innerHTML = "I saw your fish!";
        document.getElementById("capture-image").style.display = "none"; //Camera
        document.getElementById("captured-image").style.display = "block"; //Picture Took
        document.getElementById("getAnotherBtn").style.display = "block";
      }

      document.getElementById("capture-buttons").style.display = "flex"; //Big buttons
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("tryAgainBtn").disabled = true;
      document.getElementById("tryAgainBtn").style.opacity = "0.5";
      document.getElementById("bottom-message").style.display = "none"; //Message at bottom..here we have button instead

      break;  

    case "weather-info-container":
      document.getElementById("top-message").innerHTML = "I saw your fish!";
      document.getElementById("bottom-message").innerHTML = weatherMessage;
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("weatherBtn").disabled = true;
      document.getElementById("weatherBtn").style.opacity = "0.5";
      break;  

    case "map-info-container":
      document.getElementById("top-message").innerHTML = "I saw your fish!";
      document.getElementById("bottom-message").innerHTML = "Where'd ya catch em?";
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("mapBtn").disabled = true;
      document.getElementById("mapBtn").style.opacity = "0.5";
      break;  
  
    case "fish-info-container":
      document.getElementById("top-message").innerHTML = "I saw your fish!";
      document.getElementById("bottom-message").innerHTML = "Any size?";
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("fishInfoBtn").disabled = true;
      document.getElementById("fishInfoBtn").style.opacity = "0.5";
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

  //Let's get location description first and then weather info
  try {

    weatherInfoDiv.innerText = "Getting weather data...";

    // 1. Get the forecast office and grid location based on latitude and longitude
    const pointResponse = await fetch(apiOpenWeatherURL + `?guid=${keyUserGUID}&lat=${latitude}&lon=${longitude}`);
    if (!pointResponse.ok) throw new Error(`Point fetch failed: ${pointResponse.statusText}`);
    
    const weatherInfo = await pointResponse.json();

    // Build weather output - wind direction 180 = from South
    var myDesription = toTitleCase(weatherInfo.current.weather[0].description);
    var myTempDescription = Math.round(weatherInfo.current.temp) + "&deg F";

    var weatherInfoText = "Temp: " + myTempDescription + "<br>";
    weatherInfoText = weatherInfoText + "Wind: " + Math.round(weatherInfo.current.wind_speed) + " MPH at " + weatherInfo.current.wind_deg + "&deg " + windDirection(weatherInfo.current.wind_deg) + "<br>";
    weatherInfoText = weatherInfoText + "Pressure: " + Math.round(weatherInfo.current.pressure) + " hPa / " + empericalPressure(Math.round(weatherInfo.current.pressure)) + " inHg<br>";
    weatherInfoText = weatherInfoText + "Dew Point: " + Math.round(weatherInfo.current.dew_point) + "&deg F<br>";
    weatherInfoText = weatherInfoText + "Description: " + myDesription + "<br>";

    //All good, lets also get location name
    //AJH Change to use relay: Lat/long/guid
    const locationResponse = await fetch(apiOpenWeatherMapURL + `?guid=${keyUserGUID}&lat=${latitude}&lon=${longitude}`);
    if (!locationResponse.ok) throw new Error(`Location fetch failed: ${locationResponse.statusText}`);
    const locationinfo = await locationResponse.json();
    var locationInfoText = locationinfo[0].name + " " + locationinfo[0].state + "<br>";

    //Add latitude, longitue, time
    var latLongTime = "<hr>Latt:  " + latitude + "<br>Long: " + longitude + "<br>Time: " + getDateTime(dateTimeStamp);

    //And our weather display buckets
    weatherInfoDiv.innerHTML = locationInfoText + weatherInfoText + latLongTime;
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

function showMap(inputLatitude, inputLongitude) {

  var mapOptions = {
      center: { lat: inputLatitude, lng: inputLongitude }, // Replace with your desired coordinates
      zoom: 15 // Adjust zoom level as needed
  };
  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  const marker = new google.maps.Marker({
    position:  { lat: inputLatitude, lng: inputLongitude },
    map: map,
    title: "I saw your fish!",
    icon: {
        url: "fish-marker.png", // Custom icon (optional)
        scaledSize: new google.maps.Size(40, 40) // Resize icon
    }
});

}


//***************************
//Here is the code to call Open AI and figure out what kind of fish it is
//***************************
async function identifyFish() {

  if (imageData.length <= 0) {
      alert("Please select an image first.");
      return;
  }

  if (imageDescription.length > 0) {
    document.getElementById('fish-info').innerText = imageDescription;
    return;
  }

  imageDescription = "Not a fish. Move on.";
  document.getElementById('fish-info').innerText = imageDescription;
  document.body.style.cursor  = 'default';
  
  try {
    document.body.style.cursor  = 'wait';
    document.getElementById('fish-info').innerText = "Studying picture...";
  
    // Convert the image to base64
    //const imageData = await toBase64(file);
    //var imageContent = "data:image/jpeg;base64," + imageData;
    var imageContent = imageData;

    // Prepare the request payload
    const payload = {
        model: "gpt-4o", 
        messages: [
          {
            "role": "user",
            "content": [
              {"type": "text", "text": "What kind of fish is this and how big is it? If it is not a fish, what is it a picture of?"},
              {"type": "image_url", "image_url": { "url": imageContent}}
              ]
            }
        ],
        max_tokens: 300
    };

    // Call OpenAI API
    //AJH Change to use relay Image + GUID
    const response = await fetch(apiOpenAIURL + `?guid=${keyUserGUID}`, {
        method: 'POST',
        body: imageContent
    });

    if (!response.ok) throw new Error("Failed to get response from OpenAI");

    const data = await response.json();

    // Display the result
    imageDescription = `${data.choices[0].message.content}`;

    if (imageDescription.length > 500) {
      imageDescription = imageDescription.substring(0, 500) + "...";
    }

    document.getElementById('fish-info').innerText = imageDescription;
    document.body.style.cursor  = 'default';

  } catch (error) {
      console.error("Error identifying fish:", error);
      document.getElementById('fish-info').innerText = `Error: ${error.message}`;
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

