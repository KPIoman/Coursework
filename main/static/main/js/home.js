document.addEventListener("DOMContentLoaded", function () {
    // Код для кнопки реєстрації
    const signupButton = document.getElementById("signup-button");
    const typedText = document.getElementById('typed-text');

    signupButton.style.display = "none"; // Hide the button initially

    signupButton.addEventListener("click", function () {
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
            this.style.transform = "scale(1)";
        }, 200);
    });

    signupButton.addEventListener("mousemove", function (e) {
        const xPos = e.clientX - this.getBoundingClientRect().left;
        const gradientShift = (xPos / this.offsetWidth) * 100;

        gsap.to(this, {
            "--gradientShift": `${gradientShift}%`,
            duration: 0.3,
        });
    });

    signupButton.addEventListener("mouseleave", function () {
        gsap.to(this, {
            "--gradientShift": "50%",
            duration: 0.3,
        });
    });

    var text = "Ласкаво просимо до GOLD'S Barberia - вашого міського оазису для бездоганного догляду в самому серці Києва. Відчуйте щось більше, ніж просто стрижка: завітайте до GOLD'S Barberia. Запишіться зараз, щоб отримати свіжий образ, який буде виразно відрізнятися від інших!";
    var speed = 6;
    var i = 0;

    setTimeout(function () {
        function typeWriter() {
            if (i < text.length) {
                typedText.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // Text typing animation is complete, show the button
                signupButton.style.display = "inline-block";
                revealButton(signupButton);
            }
        }

        typeWriter();
    }, 2000);

    function revealButton(element) {
        element.style.transform = "scale(1)"; // Reset the scale
        element.style.transition = "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
        setTimeout(() => {
            element.style.transform = "scale(1.1)";
        }, 50);
        setTimeout(() => {
            element.style.transform = "scale(1)";
        }, 500);
    }

    window.addEventListener("scroll", function () {
        var offset = window.pageYOffset;
        // parallax.style.backgroundPositionY = offset * 0.7 + "px";
    });

    // Код для карточок
    const cardsContainer = document.querySelector(".cards");
    const cardsContainerInner = document.querySelector(".cards__inner");
    const cards = Array.from(document.querySelectorAll(".card"));
    const overlay = document.querySelector(".overlay");
    const heading = Array.from(document.querySelectorAll(".main__heading"));
    const applyOverlayMask = (e) => {
        const overlayEl = e.currentTarget;
        const x = e.pageX - cardsContainer.offsetLeft;
        const y = e.pageY - cardsContainer.offsetTop;
        overlayEl.style = `--opacity: 1; --x: ${x}px; --y:${y-890}px;`;
    };
    const createOverlayCta = (overlayCard, ctaEl) => {
        const overlayCta = document.createElement("div");
        overlayCta.classList.add("cta");
        overlayCta.textContent = ctaEl.textContent;
        overlayCta.setAttribute("aria-hidden", true);
        overlayCard.append(overlayCta);
    };
    const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            const cardIndex = cards.indexOf(entry.target);
            let width = entry.borderBoxSize[0].inlineSize;
            let height = entry.borderBoxSize[0].blockSize;
            if (cardIndex >= 0) {
                overlay.children[cardIndex].style.width = `${width}px`;
                overlay.children[cardIndex].style.height = `${height}px`;
            }
        });
    });
    const initOverlayCard = (cardEl) => {
        const overlayCard = document.createElement("div");
        overlayCard.classList.add("card");
        createOverlayCta(overlayCard, cardEl.lastElementChild);
        overlay.append(overlayCard);
        observer.observe(cardEl);
    };
    cards.forEach(initOverlayCard);
    document.body.addEventListener("pointermove", applyOverlayMask);
});


// querySelector(".price")
