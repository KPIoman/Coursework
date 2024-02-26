let left = document.getElementById('left');
let right = document.getElementById('right');

let masterArrivalTime = asyncCounter = 0;

let appointmentDate;

function chooseTemplate(borderStyle, buttonId, databaseId,  displayName, link, time) {
    let dataset
    if (time) {
        dataset = "data-time=" + time
    } else {
        dataset = ""
    }
    return `<div class='choose' style="border: ${borderStyle}">
                <div class="choose_name" onclick="selectChoice(this, '${buttonId}')" id="${databaseId}" ${dataset}>
                    ${displayName}
                </div>
                <a href="${link}" target='_blank'>
                    <img src="${information_png}" class="information_png" alt="Інформація">
                </a>
             </div>`
}

function updateBorderStyle(inputId, color) {
    document.getElementById(inputId).style.border = `1px solid ${color}`;
}

async function fetchInfo(button) {

    lastClickedButton = button;


    if (lastClickedButton.id === 'date_button') {
        if(!masterNumber) {
            if (master.style.border !== '1px solid red') {
                master.click()
            }
            alert('Спочатку виберіть майстра');
            return;
        }

        if(!serviceNumber) {
            if (service.style.border !== '1px solid red') {
                service.click();
            }
            alert('Спочатку виберіть послугу');
            return;
        }
    }

    resizeElements();

    asyncCounter++;
    const currentAsync = asyncCounter

    const contentDiv = rightContent.cloneNode(false);
    rightContent.style.display = 'none'
    rightContent.style.justifyContent = 'normal';

    master.style.border = `1px solid ${lastClickedButton.id === 'master_button' ? 'red' : 'black'}`;
    service.style.border = `1px solid ${lastClickedButton.id === 'service_button' ? 'red' : 'black'}`;
    date.style.border = `1px solid ${lastClickedButton.id === 'date_button' ? 'red' : 'black'}`;

    if (lastClickedButton.id === 'date_button') {
        displayCalendar();
        return;
    }

    document.getElementById('load_gif').style.display = 'block';
    document.getElementById('timeline').style.display = 'none';

    const response = await fetch(button.dataset.hrefTemplate)
    const data = await response.json()

    for (let i = 0; i < data.length; i++) {
        let displayName, href, time;
        let databaseId = data[i].pk;
        if (lastClickedButton.id === 'master_button') {
            displayName = `${data[i].fields.first_name} ${data[i].fields.last_name}`;
            href = `/masters/${data[i].pk}`;
        } else if (lastClickedButton.id === 'service_button') {
            displayName = `<div class="name">${data[i].fields.service_name}</div> <div class='services-price'>₴${data[i].fields.price}</div>`;
            href = `/services/${data[i].pk}`;
            time = data[i].fields.service_time;
        }

        const borderStyle = button.innerText === displayName ? '1px solid red' : '1px solid black';
        contentDiv.innerHTML += chooseTemplate(borderStyle, button.id, databaseId, displayName, href, time);
    }

    if (currentAsync === asyncCounter) {
        document.getElementById('load_gif').style.display = 'none';
        rightContent.style.display = 'flex';
        rightContent.innerHTML = contentDiv.innerHTML;
    }
}

function selectChoice(element, buttonId) {
    const choices = document.querySelectorAll('.choose');
    choices.forEach(function(choice) {
        choice.style.border = '1px solid black';
    });

    const name = element.innerHTML;
    console.log()
    element.parentNode.style.border = '1px solid red';
    document.getElementById(buttonId).innerHTML = name;
    if (buttonId === 'master_button') {
        masterNumber = element.id;
    } else if (buttonId === 'service_button') {
        if (appointmentDate) {
            let draggable = document.getElementById('draggable');
            let overflow = parseInt(draggable.style.left) + (parseInt(element.dataset.time) + 2 * masterArrivalTime) / 60 * step - parseInt(slider.style.width);
            if (overflow > 0) {
                let newPosition = parseInt(draggable.style.left) - overflow
                draggable.style.left = newPosition + 'px';
                updateTime(newPosition)
            }
        }
        serviceNumber = element.id;
        serviceTime = parseInt(element.dataset.time)
    } else {
        console.log(element.id)
    }
}
