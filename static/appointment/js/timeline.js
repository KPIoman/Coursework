let isDown = false;
let offsetX, trackWidth, draggableWidth, ServiceTimeInPx, booked;
let adhesionLines = [];
let step = 1;

let timeline = document.getElementById('timeline');
let slider = document.getElementById('slider');
let background = document.getElementById('background');
let loadGif = document.getElementById('load-timeline-gif');

let limits = document.querySelectorAll('#background .limit');
let draggable = document.querySelector('#draggable');

// draggable.addEventListener('mouseup', function() {
//     let closestLimit = getClosestLimit();
//
//     draggable.style.transition = '0.5s ease-in-out';
//     draggable.style.left = closestLimit.offsetLeft + 'px';
//
//     setTimeout(function() {
//         draggable.style.transition = 'none';
//     }, 1000);
// });
//
// function getClosestLimit() {
//     return Array.from(limits).reduce(function(prev, curr) {
//         return (Math.abs(curr.offsetLeft - draggable.offsetLeft) < Math.abs(prev.offsetLeft - draggable.offsetLeft) ? curr : prev);
//     });
// }

function setTimelineSizes() {
    let draggable = document.getElementById('draggable');
    background.innerHTML = "";
    timeline.style.width = "";
    slider.style.width = "";
    background.style.width = "";

    let position = parseInt(draggable.style.left) / step
    trackWidth = slider.clientWidth;
    if (trackWidth === 0) return;  // Значить, хтось дудосить сторінку кліками
    step = Math.floor(trackWidth / 10);
    trackWidth = step * 10;

    draggable.parentNode.style.width = trackWidth + 'px';
    timeline.style.width = trackWidth + 'px';
    background.style.width = trackWidth + 'px';
    draggable.style.left = position * step + 'px';

    ServiceTimeInPx = (serviceTime + 2 * masterArrivalTime) / 60 * step;
    Array.from(document.getElementsByClassName('master-drive-time')).forEach(function(element) {
        element.style.width = (masterArrivalTime) / 60 * step + 'px'
    });
    draggable.style.width = ServiceTimeInPx + 'px';
    let overflow = parseInt(draggable.style.left) + parseInt(draggable.style.width) - parseInt(slider.style.width);
    if (overflow > 0) {
        draggable.style.left = parseInt(draggable.style.left) - overflow + 'px';
    }
    draggable.style.display = 'flex';
    updateTime(parseInt(draggable.style.left))

    finalArray = [];
    let bookedTimes = [];

    for (let time = 0; time < booked.length; time++) {
        let startTime = booked[time].start_time.split('T')[1];
        // console.log(startTime)
        let endTime = booked[time].end_time.split('T')[1];
        // console.log(endTime)
        let startPointInCell = parseInt(startTime.split(':')[0]) - 8 + parseInt(startTime.split(':')[1]) / 60
        let endPointInCell = parseInt(endTime.split(':')[0]) - 8 + parseInt(endTime.split(':')[1]) / 60
        bookedTimes.push([startPointInCell * step, endPointInCell * step])
    }

    adhesionLines = [];
    for (let i = 0; i <= trackWidth; i += step/2) {
        adhesionLines.push(i); // додаємо відстань до списку
    }


    for(let line = 0; line < adhesionLines.length-1; line++){
        let div = document.createElement('div')
        div.style.width = step / 2 + 'px';
        if (line % 2 !== 0) {
            div.className = 'limit';
        }
        for (let i1 = 0; i1 < bookedTimes.length; i1++) {
            if (bookedTimes[i1][0] === adhesionLines[line] || (bookedTimes[i1][0] <= adhesionLines[line] && adhesionLines[line] < bookedTimes[i1][1])) {
                div.style.background = '#D3555C'
            }
        }
        background.append(div)
    }
}

function addTimelineEventListeners() {

    let draggable = document.getElementById('draggable');

    draggable.addEventListener('mousedown', function(e) {
        isDown = true;
        offsetX = e.clientX - parseFloat(draggable.style.left)
        draggableWidth = draggable.offsetWidth;
    }, true);

    document.addEventListener('mouseup', function() {
        isDown = false;
    }, true);

    document.addEventListener('mousemove', function(event) {
        event.preventDefault();
        if (isDown) {
            let x = event.clientX - offsetX;

            // Обмеження зліва
            if (x < 0) x = 0;

            // Обмеження справа
            if (x > trackWidth - draggableWidth) x = trackWidth - draggableWidth;

            let closest = adhesionLines.reduce((prev, curr) => {
                return (Math.abs(x - draggableWidth / 2 - curr) < Math.abs(prev - x - draggableWidth / 2) ? curr : prev);
            });


            let nearestLineIndex = adhesionLines.indexOf(closest) // найближча лінія до центру draggable

            let leftEdgeDistance = Math.abs(closest - x); // відстань від лівого краю до найближчої лінії

            let rightEdgeDistance = Math.abs(x + draggableWidth - closest); // відстань від правого краю до найближчої лінії

            if (leftEdgeDistance < rightEdgeDistance && leftEdgeDistance < 20) {
                if (x - closest > 0) {
                    x -= leftEdgeDistance
                    updateTime(x);
                } else {
                    x += leftEdgeDistance
                    updateTime(x);
                }
            } else if (leftEdgeDistance > rightEdgeDistance && rightEdgeDistance < 20) {
                if ((x + draggableWidth) - closest > 0) {
                    x -= rightEdgeDistance
                    updateTime(x);
                } else {
                    x += rightEdgeDistance
                    updateTime(x);
                }
            }

            draggable.style.left = x + 'px';
        }
    }, true);
}

async function getDateData(day) {

    left.style.height = '75%'
    right.style.height = '75%'
    document.getElementById('timeline').style.display = 'block';


    slider.style.display = 'none'
    background.style.display = 'none'
    loadGif.style.display = 'block'

    let url = `/appointment/date_api/`
    booked = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': CSRF.match(/value="([^"]*)"/)[1]
        },
        body: JSON.stringify({ masterNumber: masterNumber,
                                     date: day }),
    })
    booked = await booked.json()
    // console.log(booked)

    loadGif.style.display = 'none'
    slider.style.display = 'block'
    background.style.display = 'flex'

    appointmentDate = new Date(day);

    setTimelineSizes()
    addTimelineEventListeners()
}

function updateTime(leftPosition) {
    let timeInMinutes = Math.round(leftPosition / step * 60) + masterArrivalTime;
    appointmentDate.setHours(8);
    appointmentDate.setMinutes(timeInMinutes);
    // time = appointmentDate.getHours() + "-" + (appointmentDate.getMinutes() < 10 ? '0' : '') + appointmentDate.getMinutes();
    date.innerText = `${months[appointmentDate.getMonth()]}, ${appointmentDate.getDate()}, о ${(appointmentDate.getHours() < 10 ? '0' : '') + appointmentDate.getHours()}:${appointmentDate.getMinutes() + (appointmentDate.getMinutes().toString().length === 1 ? '0' : '')}`;
}