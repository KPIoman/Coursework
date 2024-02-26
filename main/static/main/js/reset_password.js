dataValid = null;
form = document.querySelector('form');

function validateInputData(input) {
    if (input.value !== '') {
        let phone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
        let email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (re.test(input.value)) {
            input.style.border = '1px solid green';
            dataValid = true;
        } else {
            input.style.border = '1px solid red';
            dataValid = false;
        }
    } else {
        input.style.border = '1px solid black';
        dataValid = null;
    }
}

form.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (!dataValid) {
        alert('Ви не ввели коректний номер телефону');
        return;
    }

    form.submit();
});