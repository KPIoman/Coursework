const form = document.querySelector('form');
const master = document.querySelector('#master_button');
const service = document.querySelector('#service_button');
const date = document.querySelector('#date_button');

function checkboxChange(element) {
    const checkbox_picture = element.querySelector('img');
    const div = document.getElementById(element.id.replace('checkbox', 'form'));
    const inputs = div.querySelectorAll('input');

    if (div.style.display === 'block'){
        checkbox_picture.src = element.id === 'name_checkbox' ? checkbox1 : checkbox2;
        div.style.display = "none";
        inputs.forEach(input => input.required = false);
    } else {
        checkbox_picture.src = element.id === 'name_checkbox' ? checkbox2 : checkbox1;
        div.style.display = "block";
        inputs.forEach(input => input.required = true);
    }
}

form.addEventListener('submit', evt => {
    evt.preventDefault();
    document.getElementById('master_arrival_time').value = masterArrivalTime;

    if (!masterNumber) {
        alert('Ви не вибрали майстра');
        master.click();
        return;
    }
    document.getElementById('master_input').value = masterNumber;

    if (!serviceNumber) {
        alert('Ви не вибрали послугу');
        service.click();
        return;
    }
    document.getElementById('service_input').value = serviceNumber;

    if (!appointmentDate) {
        alert('Ви не вибрали час запису');
        date.click();
        return;
    }
    document.getElementById('date_input').value =
        `${appointmentDate.getFullYear()}-${appointmentDate.getMonth() + 1}-${appointmentDate.getDate()}-${appointmentDate.getHours()}-${appointmentDate.getMinutes()}`;

    // Якщо користувач замовив майстра додому
    if (homeServiceOn) {
        if (document.getElementById('lat').value === '' || document.getElementById('lng').value === '') {
            alert('Ви не вказали своє місцезнаходження');
            return;
        }
        // Якщо телефон введений неправильно
        if (!phoneValid) {
            // Якщо цей телефон треба вводить
            if (phoneNumber === 'None') {
                alert('Ви не ввели коректний номер телефону');
                return;
            }
        }
    }

    form.submit();
});