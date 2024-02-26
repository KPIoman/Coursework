let flickeringImage = document.getElementById('flickeringImage');
let flickerContainer = document.getElementById('flicker-container');

// Function to smoothly change the brightness
function adjustBrightness() {
    let currentBrightness = parseFloat(flickeringImage.style.filter.replace('brightness(', '').replace('%)', ''));
    let newBrightness = (Math.sin(Date.now() / 325) + 1) * 50; // Adjust the factor for desired speed

    flickeringImage.style.filter = 'brightness(' + newBrightness + '%)';
}

// Set an interval to adjust the brightness every 50 milliseconds (adjust as needed)
let intervalId = setInterval(adjustBrightness, 10);

setTimeout(function() {
    function loadHandler() {
        flickerContainer.style.display = 'none';
        clearInterval(intervalId);
        document.getElementById('body').style.display = 'flex'
        moveGradient();
    }

    if(document.readyState === 'complete') {
        loadHandler();
    } else {
        window.addEventListener("load", loadHandler);
    }
}, 1700);

function moveGradient() {
    const gradient = document.getElementById('gradientMask');
    let offset = 0;
    let speed = 1; // Increase this value to speed up the movement
    let interval = 45; // Adjust the interval as needed
    let totalWidth = 153; // Total width of the gradient

    setInterval(() => {
        offset += speed; // Adjust this value to control the speed of the movement

        if (offset >= totalWidth) {
            offset -= totalWidth; // Smoothly continue from the end back to the beginning
        }

        gradient.setAttribute('x1', (offset -50) + '%');
        gradient.setAttribute('x2', (offset + 5) + '%');
    }, interval);
}