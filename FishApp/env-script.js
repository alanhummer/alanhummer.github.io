const envButton = document.getElementById('push-me'); //Push Button

//Push button and our handler
envButton.addEventListener('click', () => {

    //Get our envirionemt and dsplay
    getEnvironmentVariable();
    
});

//***************************
//Get Environment Variable and show it off
//***************************
async function getEnvironmentVariable() {

    var getURL = "https://i-saw-your-fish.deno.dev/getEnvironmentVariable?key=IMAGE_QUERY&guid=1234";
    var setURL = "";

    var valueDescription = "Loading...";
    document.getElementById('value-description').innerText = valueDescription;

    try {
        document.body.style.cursor  = 'wait';

        // Call AI to figure out fish and size
        const response = await fetch(getURL);
        if (!response.ok) throw new Error("Failed to get response from Server");

        const data = await response.json();
        
        // Display the result
        if (data.includes("Fish n Food")) {
            valueDescription = "Version: Fish n Food";
        }
        else {
            valueDescription = "Version: Original";
        }
        document.getElementById('value-description').innerText = valueDescription;
        document.body.style.cursor  = 'default';

    } catch (error) {
        console.error("Error getting data:", error);
        document.getElementById('value-description').innerText = `Error: ${error.message}`;
        document.body.style.cursor  = 'default';
    }

}