let months = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];

let currentDate = new Date();
let lastClickedButton = master;
let rightContent = document.getElementById("right_content");

// Бронювання можливо тільки на наступний від сьогоднішнього день

function generateCalendarTemplate() {
    return `
        <div id="calendar_div">
            <table id="calendar">
            </table>
        </div>
    `;
}

function displayCalendar() {
    let currentDayInMonth = currentDate.getDate();
    let currentDayInWeek = currentDate.getDay();
    let tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    let firstDayOfWeek;
    if (0 < currentDayInWeek && currentDayInWeek < 5) { // 5, бо якщо п'ятниця, то бронювання все одно можливо тільки аж в понеділок
        firstDayOfWeek = new Date(tempDate.setDate(currentDayInMonth - ((currentDayInWeek + 6) % 7)));
    } else {
        firstDayOfWeek = new Date(tempDate.setDate(currentDayInMonth + 7 - ((currentDayInWeek + 6) % 7)));
    }

    document.getElementById('right_content').innerHTML = generateCalendarTemplate();
    document.getElementById('load_gif').style.display = 'none';
    rightContent.style.display = 'flex';
    rightContent.style.justifyContent = 'center';

    resizeElements();

    // Вказуєте кількість днів у буднях (барбершоп по вихідних не працює)
    let maxBookingDays = 16;

    // Перетворюю кількість днів для бронювання у дні з вихідними
    tempDate = new Date(currentDate.getTime());
    while (maxBookingDays > 0) {
        tempDate.setDate(tempDate.getDate() + 1);
        if (tempDate.getDay() !== 6 && tempDate.getDay() !== 0) {
            maxBookingDays--;
        }
    }
    maxBookingDays = (tempDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24);
    let endDateOfBooking = new Date(tempDate.getTime());

    let endDateOfBookingWeek = new Date(endDateOfBooking.getTime());
    endDateOfBookingWeek.setDate(endDateOfBooking.getDate() + (7 - endDateOfBooking.getDay() || 7) - 1)

    let calendarElement = document.getElementById('calendar');
    let color = '#00412D';

    let row = calendarElement.insertRow();
    row.style.background = color;
    let cell = row.insertCell();
    cell.colSpan = 5;
    cell.innerHTML = `<div id="first-month-cell"><div id='first-month'>${months[firstDayOfWeek.getMonth()]}</div></div>`;
    row = calendarElement.insertRow();
    row.style.background = color;
    row.innerHTML = `<th style="color: darkred; text-shadow: 0.5px 0.5px 1px #7A0000;">Пн</th>
                     <th style="color: darkred; text-shadow: 0.5px 0.5px 1px #7A0000;">Вт</th>
                     <th style="color: darkred; text-shadow: 0.5px 0.5px 1px #7A0000;">Ср</th>
                     <th style="color: darkred; text-shadow: 0.5px 0.5px 1px #7A0000;">Чт</th>
                     <th style="color: darkred; text-shadow: 0.5px 0.5px 1px #7A0000;">Пт</th>`;
    let rowCount = 0;
    for (let tempDate = new Date(firstDayOfWeek.getTime()); tempDate < endDateOfBookingWeek; tempDate.setDate(tempDate.getDate() + 1)) {
        //console.log(tempDate)
        // Добавляю рядок для нового тижня
        if (tempDate.getDay() === 1) {
            row = calendarElement.insertRow();
            rowCount++;
        }
        if (tempDate.getDate() === 1 && !(tempDate.getDay() === 1 && rowCount === 1)) {
            color = '#ff8893';
        }
        // Відсікаю всі вихідні дні
        if (tempDate.getDay() > 0 && tempDate.getDay() < 6) {
            let cell = row.insertCell();
            cell.style.background = color;

            let div = document.createElement('div');
            div.className = 'date-сell';
            let button = document.createElement('button');
            button.onclick = function() {
                getDateData(this.dataset.date);
            }
            button.innerHTML = tempDate.getDate().toString();
            button.dataset.date = `${tempDate.getFullYear()}-${tempDate.getMonth() + 1}-${tempDate.getDate()}`
            if (tempDate > currentDate && tempDate <= endDateOfBooking ) {
                div.append(button);
            }
            cell.append(div);
            // Для останнього дня місяця
            if (tempDate.getTime() === new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getTime()) {
                div.style.background = '#00412D';
                cell.style.background = '#ff8893';         // Щоб нижній правий куточок був червоним
                if (tempDate.getDay() !== 5) {
                    div.style.borderRadius = '0 0 1vh 0'; // та заокругленим
                }
            }
            // Для першого дня місяця
            if (tempDate.getDate() === 1 && !(tempDate.getDay() === 1 && rowCount === 1)) {
                div.style.background = '#ff8893';
                cell.style.background = '#00412D';         // Щоб нижній верхній куточок був зеленим
                if (tempDate.getDay() !== 1) {
                    div.style.borderRadius = '1vh 0 0 0';
                }
            }
            button.className = color;
        }
    }
    if (color === '#ff8893') {
        row = calendarElement.insertRow();
        row.style.background = color;
        let cell = row.insertCell();
        cell.colSpan = 5;
        cell.innerHTML = `<div id="last-month-cell"><div id='last-month'>${months[(firstDayOfWeek.getMonth() + 1) % 12]}</div></div>`;
    }

    if (appointmentDate) {
        getDateData(`${appointmentDate.getFullYear()}-${appointmentDate.getMonth() + 1}-${appointmentDate.getDate()}`)
    }

}

// Тільки для розробки!!!
// document.getElementById('date_input').click()