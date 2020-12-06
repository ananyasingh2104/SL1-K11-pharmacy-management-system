function logout(){
    fetch("/logout", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
    .then(res => {
        if (res.success === true) {
            window.location.href=`http://localhost:3000/login`;    
         }
    })
    .catch((err) => console.log(err))
}

let val_data = 0;

// Validations for INVOICE NUMBER---------------------------------------------------------

function isInvoice(evt, input) {
    let charcode = evt.keyCode;
    if (charcode > 31 && (charcode < 48 || charcode > 57)) {
        search.parentElement.className = "sbar error";
        return false;
    }
    else {
        search.parentElement.className = "sbar";
        return true;
    }
}

function isLength(len, input, type) {
    let letters = /^\d{6}$/;
    if (input.value.length === len && input.value.match(letters) && input.value >= 100000) {
        val_data = 1;
        return true;
    }
    else {
        setErrorMsg(search);
        val_data = 0;
        return false;
    }
}

// SUCCESS AND ERROR MESSAGES----------------------------------------------
function setErrorMsg(input) {
    let formControl = input.parentElement;
    formControl.className = "sbar  error";
}

function searchInvoice() {
    let inumber = parseInt(document.getElementById("search").value);
    let invoice = parseInt(document.getElementById("search").value);

    if (!Number.isInteger(invoice)) {
        alert('Please enter invoice number!');
        return false;
    }
    else if (val_data === 0) {
        alert('Please enter correct invoice number!');
        return false;
    }

    let row = { inumber };

    fetch(`/invoice/data/${inumber}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(row)
    }).then((res) => res.json())
        .then(res => {
            if (res.success === true) {
                window.location.href = `http://localhost:3000/invoice/data/${inumber}`;
            }
            else {
                alert("Invoice not found!");
                location.reload();
            }
        })
        .catch((err) => console.log(err))
}