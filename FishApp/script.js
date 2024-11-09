//To do's:
//1) X Store Lat / Long so don't query alwasy...time out in 1 hour
//2) X API Keys for Weather and Open AI in local storage? Get from server? Or setup host relay?
//2b) Replit as a relay server w/Keys
//2c) X  If not keys, ask for key and store in local storage
//3) Camera storage thumbs of inventory to pick from instead of taking pic
//4) Stored pics select them from camera storage - use date / loc on pic for weather 

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const statusDiv = document.getElementById('status');
const weatherInfoDiv = document.getElementById('weather-info');
const weatherAPIInfoDiv = document.getElementById('weather-api-info');
const openAIAPIInfoDiv = document.getElementById('open-ai-api-info');

const captureBtn = document.getElementById('captureBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const fishPictureBtn = document.getElementById('fishPictureBtn');
const weatherBtn = document.getElementById('weatherBtn');
const fishInfoBtn = document.getElementById('fishInfoBtn');
const apiKeysUpdateBtn = document.getElementById('apiKeysUpdateBtn');

//This holds our image stream
var imageData = ""; 
var imageDescription = "";

//Hold our API Keys
var keyAPIOpenAI = getStorage("keyAPIOpenAI");
var keyAPIOpenWeatherMap = getStorage("keyAPIOpenWeatherMap");

//Hold our location and weather and other stuff
var latitude = null;
var longitude = null;
var locationTime = null;
var weatherMessage = "";
var blnGotPicture = false;


document.getElementById("openAIAPI-key").value = keyAPIOpenAI;
document.getElementById("openWeatherMapAPI-key").value = keyAPIOpenWeatherMap;

//We need API keys or not?
if (keyAPIOpenAI && keyAPIOpenWeatherMap) {
  if (keyAPIOpenAI.length > 0 && keyAPIOpenWeatherMap.length > 0) {
    toggleDisplay("capture-image-container");
  }
  else {
    toggleDisplay("api-keys-container");
  }
}
else {
  toggleDisplay("api-keys-container");
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
  toggleDisplay("captured-image-container");
  
});

// Capture Another Photo
tryAgainBtn.addEventListener('click', () => {

  //Show capture display
  if (tryAgainBtn.disabled) {
    return;
  }  
  toggleDisplay("capture-image-container");

});

// Show Picture Again
fishPictureBtn.addEventListener('click', () => {

  //Show capture display
  if (fishPictureBtn.disabled) {
    return;
  }
  toggleDisplay("captured-image-container");

});

// Weather Info
weatherBtn.addEventListener('click', () => {

  if (weatherBtn.disabled) {
    return;
  }

  //Get Location Data - if we timeout of caching it
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
      getWeatherData(43.0731, -89.4012, null); // Coordinates for Madison, WI
      toggleDisplay("weather-info-container");
    
    } else {
      navigator.geolocation.getCurrentPosition(success, error);
    }
  }
  else {
    //Get Weather Data
    getWeatherData(latitude, longitude, null); 
    toggleDisplay("weather-info-container");
  }

  function success(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    locationTime = Date.now();
   
    //Get Weather Data
    getWeatherData(latitude, longitude, null); 
    toggleDisplay("weather-info-container");
  }

  function error() {
    console.log("Unable to retrieve your location");
    
    //Get Weather Data - no geo info available so default
    getWeatherData(43.0731, -89.4012, null); // Coordinates for Madison, WI
    toggleDisplay("weather-info-container");
  }
  
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

// API Keys Update
apiKeysUpdateBtn.addEventListener('click', () => {

  //Update API Keys
  if (document.getElementById("openAIAPI-key").value && document.getElementById("openWeatherMapAPI-key").value) {
    if (document.getElementById("openAIAPI-key").value.length > 0 && document.getElementById("openWeatherMapAPI-key").value.length > 0) {

      keyAPIOpenAI = document.getElementById("openAIAPI-key").value;
      keyAPIOpenWeatherMap = document.getElementById("openWeatherMapAPI-key").value;

      setStorage("keyAPIOpenAI", keyAPIOpenAI);
      setStorage("keyAPIOpenWeatherMap", keyAPIOpenWeatherMap);

      toggleDisplay("capture-image-container");

    }
  }  
});

// toggleDisplay for what we want to show
function toggleDisplay(inputType) {

  document.getElementById("api-keys-container").style.display = "none";
  document.getElementById("capture-image-container").style.display = "none";
  document.getElementById("captured-image-container").style.display = "none";
  document.getElementById("weather-info-container").style.display = "none";
  document.getElementById("fish-info-container").style.display = "none";

  document.getElementById("button-display").style.display = "none";
  document.getElementById("capture-display").style.display = "none";
  document.getElementById("update-apis-display").style.display = "none";

  document.getElementById("tryAgainBtn").disabled = false;
  document.getElementById("fishPictureBtn").disabled = false;
  document.getElementById("weatherBtn").disabled = false;
  document.getElementById("fishInfoBtn").disabled = false;
  document.getElementById("tryAgainBtn").style.opacity = "1";
  document.getElementById("fishPictureBtn").style.opacity = "1";
  document.getElementById("weatherBtn").style.opacity = "1";
  document.getElementById("fishInfoBtn").style.opacity = "1";

  document.getElementById("bottom-message").style.display = "block"; //Message at bottom....usually on

  document.getElementById(inputType).style.display = "flex";

  switch (inputType) {

    case "api-keys-container":
      document.getElementById("top-message").innerHTML = "API Keys";
      document.getElementById("bottom-message").innerHTML = "Cut and past them into here";
      document.getElementById("update-apis-display").style.display = "flex";
      break;  

    case "capture-image-container":
      document.getElementById("top-message").innerHTML = "Catch that fish!";
      document.getElementById("bottom-message").innerHTML = "Take a picture!";
      document.getElementById("capture-display").style.display = "flex";
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("tryAgainBtn").disabled = true;
      document.getElementById("tryAgainBtn").style.opacity = "0.5";
      document.getElementById("bottom-message").style.display = "none"; //Message at bottom..

      break;  

    case "captured-image-container":
      document.getElementById("top-message").innerHTML = "I saw your fish!";
      document.getElementById("bottom-message").innerHTML = "Now you got em'";
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("fishPictureBtn").disabled = true;
      document.getElementById("fishPictureBtn").style.opacity = "0.5";
      break;  
  
    case "weather-info-container":
      document.getElementById("top-message").innerHTML = "I saw your fish!";
      document.getElementById("bottom-message").innerHTML = weatherMessage;
      document.getElementById("button-display").style.display = "flex";
      document.getElementById("weatherBtn").disabled = true;
      document.getElementById("weatherBtn").style.opacity = "0.5";
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
    document.getElementById("fishPictureBtn").disabled = true;
    document.getElementById("fishPictureBtn").style.opacity = "0.5"
    document.getElementById("weatherBtn").disabled = true;
    document.getElementById("weatherBtn").style.opacity = "0.5";
    document.getElementById("fishInfoBtn").disabled = true;
    document.getElementById("fishInfoBtn").style.opacity = "0.5";
  }

}

//***************************
//Here is the code to get the weather data given the GPS location and timesteamp
//***************************

// Function to fetch and parse weather data
async function getWeatherData(latitude, longitude, dateTimeStamp) {

  //From here: https://openweathermap.org/
  //Let's get location description first and then weather info

  try {
    // 1. Get the forecast office and grid location based on latitude and longitude
    const pointResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=imperial&appid=${keyAPIOpenWeatherMap}`);
    
    //For Historical: https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=39.099724&lon=-94.578331&dt=1643803200&appid=
    
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
    const locationResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${keyAPIOpenWeatherMap}`);
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
    weatherInfoDiv.textContent = "Error fetching weather data";
    weatherAPIInfoDiv.textContent = "Error fetching weather data";
    toggleDisplay("api-keys-container");
    weatherMessage = "No weather data";
  }
}

//***************************
//Here is the code to call Open AI and figure out what kind of fish it is
//***************************
async function identifyFish() {

  //From here: https://platform.openai.com/docs/overview

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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keyAPIOpenAI}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
      openAIAPIInfoDiv.textContent = `Error: ${error.message}`;
      toggleDisplay("api-keys-container");
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

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

function setStorage(inputKey, inputValue) {
  localStorage.setItem(inputKey, inputValue);
}

function getStorage(inputKey) {
  var outputValue = localStorage.getItem(inputKey);
  return outputValue;
}

function empericalPressure(inputhPa) {
  
  var outputinHg = inputhPa / 33.863889532611;

  return Math.round(outputinHg);
  
}


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
