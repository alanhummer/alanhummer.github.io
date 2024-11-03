const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const captureBtn = document.getElementById('captureBtn');
const statusDiv = document.getElementById('status');
const tryAgainBtn = document.getElementById('tryAgainBtn');

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

// Capture photo
tryAgainBtn.addEventListener('click', () => {

  //Show capture display
  toggleDisplay("capture-image");
  
});

function toggleDisplay(inputType) {

  document.getElementById("capture-image").style.display = "none";
  document.getElementById("captured-image").style.display = "none";
  document.getElementById(inputType).style.display = "block";

}


