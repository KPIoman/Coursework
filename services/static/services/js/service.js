document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById("appointment-button");

    button.addEventListener("mousemove", function(e) {
        const xPos = e.clientX - this.getBoundingClientRect().left;
        const gradientShift = (xPos / this.offsetWidth) * 100;

        gsap.to(this, {
            "--gradientShift": `${gradientShift}%`,
            duration: 0.3,
        });
    });

    button.addEventListener("mouseleave", function() {
        gsap.to(this, {
            "--gradientShift": "50%",
            duration: 0.3,
        });
    });

    button.addEventListener("click", function() {
        this.style.transform = "scale(0.95)"; // Add a click effect
        setTimeout(() => {
            this.style.transform = "scale(1)"; // Reset the scale after a short delay
        }, 200);
    });

    let images = document.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
        images[i].oncontextmenu = function() {
            return false; // Disable right-click context menu on images
        }
    }
});

function handleMouseMove(event) {
    const card = event.currentTarget;
    const boundingRect = card.getBoundingClientRect();
    const offsetX = (event.clientX - boundingRect.left - boundingRect.width / 2) / 8;

    card.style.transform = `rotateY(${offsetX}deg)`;
}

function handleMouseLeave(event) {
    const card = event.currentTarget;
    card.style.transform = 'rotateY(0deg)';
}