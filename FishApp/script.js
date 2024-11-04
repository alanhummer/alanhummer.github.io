//To do's:
//1) Store Lat / Long so don't query alwasy...time out in 1 hour
//2) API Keys for Weather and Open AI in local storage? Get from server? Or setup host relay?
//2b) Replit as a relay server?
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

  //console.log("imageData", imageData);

  //Show captured display
  toggleDisplay("captured-image-container");
  
});

// Capture Another Photo
tryAgainBtn.addEventListener('click', () => {

  //Show capture display
  toggleDisplay("capture-image-container");
  
});

// Show Picture Again
fishPictureBtn.addEventListener('click', () => {

  //Show capture display
  toggleDisplay("captured-image-container");
  
});

// Weather Info
weatherBtn.addEventListener('click', () => {

  //Get Location Data
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by your browser");
  
    //Get Weather Data - no geo info available so default
    getWeatherData(43.0731, -89.4012, null); // Coordinates for Madison, WI
    toggleDisplay("weather-info-container");
  
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
   
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

  document.getElementById("capture-image-container").style.display = "none";
  document.getElementById("captured-image-container").style.display = "none";
  document.getElementById("weather-info-container").style.display = "none";
  document.getElementById("fish-info-container").style.display = "none";
  document.getElementById("api-keys-container").style.display = "none";

  document.getElementById("button-display").style.display = "none";
  document.getElementById("capture-display").style.display = "none";
  document.getElementById("update-apis-display").style.display = "none";

  document.getElementById(inputType).style.display = "flex";

  if (inputType == "capture-image-container") {
    document.getElementById("capture-display").style.display = "flex";
  }
  else {
    if (inputType == "api-keys-container") {
      document.getElementById("update-apis-display").style.display = "flex";
    } 
    else {
      document.getElementById("button-display").style.display = "flex";
    }    
  }
}

//***************************
//Here is the code to get the weather data given the GPS location and timesteamp
//***************************

// Function to fetch and parse weather data
async function getWeatherData(latitude, longitude, dateTimeStamp) {

  //From here: https://openweathermap.org/

  try {
    // 1. Get the forecast office and grid location based on latitude and longitude
    const pointResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=imperial&appid=${keyAPIOpenWeatherMap}`);
    
    //For Historical: https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=39.099724&lon=-94.578331&dt=1643803200&appid=
    
    if (!pointResponse.ok) throw new Error(`Point fetch failed: ${pointResponse.statusText}`);
    
    const weatherInfo = await pointResponse.json();

    // Build weather output - wind direction 180 = from South
    var weatherInfoText = "Temp: " + Math.round(weatherInfo.current.temp) + "&deg F<br>";
    weatherInfoText = weatherInfoText + "Wind: " + Math.round(weatherInfo.current.wind_speed) + " MPH at " + weatherInfo.current.wind_deg + "&deg<br>";
    weatherInfoText = weatherInfoText + "Pressure: " + Math.round(weatherInfo.current.pressure) + " hPa<br>";
    weatherInfoText = weatherInfoText + "Dew Point: " + Math.round(weatherInfo.current.dew_point) + "&deg F<br>";
    weatherInfoText = weatherInfoText + "Description: " + toTitleCase(weatherInfo.current.weather[0].description) + "<br>";

    weatherInfoDiv.innerHTML = weatherInfoText;

    return weatherInfoText;

  } catch (error) {
    console.error("Error fetching weather data:", error);
    weatherInfoDiv.textContent = "Error fetching weather data";
    weatherAPIInfoDiv.textContent = "Error fetching weather data";
    toggleDisplay("api-keys-container");
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


