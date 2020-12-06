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

// Validations for CONTACT INFORMATION---------------------------------------------------------

function isContact(evt, input) {
    let charcode = evt.keyCode;
    if (charcode > 31 && (charcode < 48 || charcode > 57)) {
        msearch.parentElement.className = "sbar error";
        return false;
    }
    else {
        msearch.parentElement.className = "sbar";
        return true;
    }
}

function isLength(len, input, type) {
    let letters = /^[6-9][0-9]{0,9}$/;
    if (input.value.length === len && input.value.match(letters)) {
        val_data = 1;
        return true;
    }
    else {
        setErrorMsg(msearch);
        val_data = 0;
        return false;
    }
}

// SUCCESS AND ERROR MESSAGES----------------------------------------------
function setErrorMsg(input) {
    let formControl = input.parentElement;
    formControl.className = "sbar  error";
}

//----------------------------------------------------------------------------------------------

function removeCart(value1, value2) {
    let mid = parseInt(value1);
    let quantity = parseInt(value2);

    let row = { mid, quantity };

    fetch("/cart", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(row)
    }).then((res) => res.json())
        .then(res => {
            if (res.success === true) {
                alert("Medicine removed from cart!")
                location.reload();
            }
            else {
                alert("Error!")
                location.reload();
            }
        })
        .catch((err) => console.log(err))


}

function searchCustomer(input) {

    input = parseInt(input);
    if (input == 0) {
        alert('Cart is empty! Please add items to the cart.');
        return false;
    }

    let number = document.getElementById("msearch").value;
    let phone = parseInt(document.getElementById("msearch").value);

    if (!Number.isInteger(phone)) {
        alert('Please enter contact number!!!');
        return false;
    }
    else if (val_data === 0) {
        alert('Please enter correct contact number!');
        return false;
    }

    let row = { number };

    fetch(`/cart/${number}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(row)
    }).then((res) => res.json())
        .then(res => {
            if (res.success === true) {
                window.location.href = `http://localhost:3000/cart/success/${number}`;
            }
            else {
                window.location.href = `http://localhost:3000/cart/failure/${number}`;
            }
        })
        .catch((err) => console.log(err))
}
