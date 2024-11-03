const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const statusDiv = document.getElementById('status');
const weatherInfoDiv = document.getElementById('weather-info');

const captureBtn = document.getElementById('captureBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const fishPictureBtn = document.getElementById('fishPictureBtn');
const weatherBtn = document.getElementById('weatherBtn');

//Show the starting content
toggleDisplay("capture-image");

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
  const dataURL = canvas.toDataURL('image/png');
  photo.src = dataURL;
  photo.style.display = "block";

  //Show captured display
  toggleDisplay("captured-image");
  
});

// Capture Another Photo
tryAgainBtn.addEventListener('click', () => {

  //Show capture display
  toggleDisplay("capture-image");
  
});

// Show Picture Again
fishPictureBtn.addEventListener('click', () => {

  //Show capture display
  toggleDisplay("captured-image");
  
});

// Weather Info
weatherBtn.addEventListener('click', () => {

  //Show capture display
  getWeatherData(43.0731, -89.4012); // Coordinates for Madison, WI
  toggleDisplay("weather-info");
  
});

// toggleDisplay for what we want to show
function toggleDisplay(inputType) {

  document.getElementById("capture-image").style.display = "none";
  document.getElementById("captured-image").style.display = "none";
  document.getElementById("weather-info").style.display = "none";
  document.getElementById(inputType).style.display = "block";

}

//***************************
//Here is the code to get the weather data given the GPS location and timesteamp
//***************************

// Function to fetch and parse weather data
async function getWeatherData(latitude, longitude) {
  try {
    // 1. Get the forecast office and grid location based on latitude and longitude
    const pointResponse = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);
    if (!pointResponse.ok) throw new Error(`Point fetch failed: ${pointResponse.statusText}`);
    
    const pointData = await pointResponse.json();
    
    // Extract forecast URL from point data
    const forecastUrl = pointData.properties.forecastHourly;

    // 2. Fetch the hourly forecast data
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) throw new Error(`Forecast fetch failed: ${forecastResponse.statusText}`);
    
    const forecastData = await forecastResponse.json();
    
    // Example: Parse the first forecast period (for demonstration)
    const forecastPeriod = forecastData.properties.periods[0];
    console.log("Forecast Period:", forecastPeriod);

    // Output parsed weather data
    const weatherInfo = {
      temperature: forecastPeriod.temperature,
      temperatureUnit: forecastPeriod.temperatureUnit,
      windSpeed: forecastPeriod.windSpeed,
      windDirection: forecastPeriod.windDirection,
      shortForecast: forecastPeriod.shortForecast,
      detailedForecast: forecastPeriod.detailedForecast,
    };

    console.log("Parsed Weather Data:", weatherInfo);

    // Build weather output
    var weatherInfoText = "Temp:" + weatherInfo.temperature + " degrees " + weatherInfo.temperatureUnit + " and ";
    weatherInfoText = weatherInfoText + "Wind:" + weatherInfo.windSpeed + " from " + weatherInfo.windDirection;
    weatherInfoDiv.textContent = weatherInfoText;

    return weatherInfoText;

  } catch (error) {
    console.error("Error fetching weather data:", error);
    weatherInfoDiv.textContent = "Error fetching weather data";
  }
}

//***************************
//Here is the code to call Open AI and figure out what kind of fish it is
//***************************

async function identifyFish() {
    const apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your OpenAI API key
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image first.");
        return;
    }

    try {
        // Convert the image to base64
        const imageData = await toBase64(file);

        // Prepare the request payload
        const payload = {
            prompt: "What kind of fish is this?",
            image: imageData, // Base64 encoded image
            model: "gpt-4-vision" // Model capable of image recognition
        };

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/images', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Failed to get response from OpenAI");

        const data = await response.json();

        // Display the result
        document.getElementById('result').innerText = `Response: ${data.choices[0].text}`;

    } catch (error) {
        console.error("Error identifying fish:", error);
        document.getElementById('result').innerText = `Error: ${error.message}`;
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

