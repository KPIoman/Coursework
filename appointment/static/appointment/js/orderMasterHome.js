let homeServiceOn = false;
let scriptLoaded = false;
let marker;
let map;
let directionsService;
let phoneValid = null;
let mapContainer;

function homeService() {
    asyncCounter++;

    const checkbox_picture = document.getElementById('home_service_checkbox_img');
    const div = document.getElementById('home_service_form');
    const inputs = div.querySelectorAll('input');

    if (homeServiceOn){
        checkbox_picture.src = checkbox2;
        div.style.display = "none";
        inputs.forEach((element) => {element.required = false});


        if (map) {
            if (marker) {
                marker.setMap(null);
                marker = null;
            }
            map.panTo({lat: 50.44901603146629, lng: 30.453347378577433});
            document.getElementById('lat').value = '';
            document.getElementById('lng').value = '';
            mapContainer.style.display = 'none';
        }

        homeServiceOn = false;
        resizeElements();

        let masterDriveTime = document.getElementsByClassName('master-drive-time');

        // Щоб при знятті галочки "Замовлення майстра додому" повзунок не з'їжджав назад, а залишався на місці
        draggable.style.left = parseInt(draggable.style.left) + parseInt(masterDriveTime[0].style.width) + 'px';
        masterDriveTime[0].style.width = '0';
        masterDriveTime[1].style.width = '0';

        masterArrivalTime = 0;
        if (lastClickedButton.id === 'date_button' && timeline.style.display === 'block') {
            setTimelineSizes();
        }
    } else {
        checkbox_picture.src = checkbox1;
        div.style.display = "block";
        inputs.forEach((element) => {element.required = true});
        if (phoneNumber !== 'None' && phoneNumber !== '') document.getElementById('phone_input').required = false;

        if (scriptLoaded) {
            mapContainer.style.display = 'block';
        } else {
            mapContainer = document.createElement('div');
            mapContainer.id = 'map_container';
            document.getElementById('content').appendChild(mapContainer);

            let script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBdqumIAXZrMZ8QqGbznRl7chcz-V-4MlE&callback=initMap';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
            scriptLoaded = true;
        }

        homeServiceOn = true;
        resizeElements();

        if (lastClickedButton.id === 'date_button' && timeline.style.display === 'block') {
            setTimelineSizes();
        }
    }
}

function initMap() {
    // Перевірка, чи карта вже завантажена
    if (map) return;

    // document.getElementById('load_gif').style.display = 'none';

    map = new google.maps.Map(mapContainer, {
        zoom: 18,
        center: {lat: 50.44901603146629, lng: 30.453347378577433},
        draggableCursor: 'default',
        draggingCursor: 'grabbing',
    });

    directionsService = new google.maps.DirectionsService();

    map.addListener('click', function(e) {
        placeMarkerAndPanTo(e.latLng);
    });
}

function placeMarkerAndPanTo(latLng) {
    draggable = document.getElementById('draggable')
    // Якщо маркер вже існує, видаліть його
    if (marker) {
        marker.setMap(null);
    }

    // Створіть новий маркер
    marker = new google.maps.Marker({
        position: latLng,
        map: map,
    });

    document.getElementById('lat').value = latLng.lat();
    document.getElementById('lng').value = latLng.lng();

    // Визначте маршрут до нового маркера
    let request = {
        origin: {lat: 50.44901603146629, lng: 30.453347378577433}, // початкова точка
        destination: latLng, // кінцева точка
        travelMode: 'DRIVING' // режим подорожі
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            console.log('Час доїзду -', result.routes[0].legs[0].duration.text)
            masterArrivalTime = Math.ceil(convertDurationToMinutes(result.routes[0].legs[0].duration.text) / 30) * 30;
            if (masterArrivalTime < 0 || masterArrivalTime > 60) {
                masterArrivalTime = 0;
                if (marker) {
                    marker.setMap(null);
                }
                document.getElementById('lat').value = '';
                document.getElementById('lng').value = '';
                console.error("Виберіть інше місце");
                alert('Ваш вибір місця був скасований, виберіть місце ближче до нашого барбершопу')
            }
        } else {
            masterArrivalTime = 0;
            if (marker) {
                marker.setMap(null);
            }
            document.getElementById('lat').value = '';
            document.getElementById('lng').value = '';
            console.error("Виберіть інше місце");
            alert('Ваш вибір місця був скасований, виберіть інше місце')
        }
        ServiceTimeInPx = (serviceTime + 2 * masterArrivalTime) / 60 * step;
        Array.from(document.getElementsByClassName('master-drive-time')).forEach(function(element) {
            element.style.width = (masterArrivalTime) / 60 * step + 'px'
        });
        draggable.style.width = ServiceTimeInPx + 'px';
        let overflow = parseInt(draggable.style.left) + parseInt(draggable.style.width) - parseInt(slider.style.width);
        if (overflow > 0) {
            draggable.style.left = parseInt(draggable.style.left) - overflow + 'px';
        }
        updateTime(parseInt(draggable.style.left));
    });
}


function validatePhoneNumber(input) {
    if (input.value !== '') {
        let re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
        if (re.test(input.value)) {
            input.style.border = '1px solid green';
            phoneValid = true;
        } else {
            input.style.border = '1px solid red';
            phoneValid = false;
        }
    } else {
        input.style.border = '1px solid black';
        phoneValid = null;
    }
}

function resizeElements() {
    if (lastClickedButton.id === 'date_button') {
        left.style.width = '49%';
        right.style.width = '48%';
    } else {
        left.style.width = '65%';
        right.style.width = '32%';
        left.style.height = '100%';
        right.style.height = '100%';
    }

    if (homeServiceOn) {
        document.getElementById('main').style.width = '71%';
        mapContainer.style.width = '23%'
    } else {
        document.getElementById('main').style.width = '96%';
    }
}

function convertDurationToMinutes(duration) {
    let hours = 0;
    let minutes = 0;

    if (duration.includes('год')) {
        let time = duration.split('год');
        hours = parseInt(time[0]);
        if (time[1].includes('хв')) {
            minutes = parseInt(time[1].split('хв')[0]);
        }
    } else if (duration.includes('хв')) {
        minutes = parseInt(duration.split('хв')[0]);
    } else {
        return -1;
    }

    return hours * 60 + minutes;
}

// Тільки для розробки!!!
// window.addEventListener("load", () => {document.getElementById('home_service_checkbox').click()})