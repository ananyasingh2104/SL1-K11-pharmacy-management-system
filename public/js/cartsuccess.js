function logout() {
    fetch("/logout", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
        .then(res => {
            if (res.success === true) {
                window.location.href = `http://localhost:3000/login`;
            }
        })
        .catch((err) => console.log(err))
}

let val_data = [];
let cont_data = 0;
let mem_data = 1;

//Validation for SEARCH NUMBER------------------------------------------

function isCont(evt, input) {
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

function isLen(len, input, type) {
    let letters = /^[6-9][0-9]{0,9}$/;
    if (input.value.length === len && input.value.match(letters)) {
        cont_data = 1;
        return true;
    }
    else {
        setError(msearch);
        cont_data = 0;
        return false;
    }
}

// Validations for COMPANY NAME-------------------------------------------------------------

function isPrescribe(input) {
    document.getElementById('prescribedby').value = document.getElementById('prescribedby').value.trim();
    input = input.trim();
    let prescName = /^[a-zA-Z.]+( [a-zA-Z.]+)*$/;
    if (input.length >= 2 && input.length <= 50 && input.match(prescName)) {
        setSuccessMsg(prescribedby);
        val_data = 1;
        return True;
    }
    else {
        setErrorMsg(prescribedby);
        val_data = 0;
        return false;
    }
}
//SUCCESS AND ERROR message-----------------------------------------------------------------
function setSuccessMsg(input) {
    let formControl = input.parentElement;
    formControl.className = "prescribed space success";
}
function setErrorMsg(input) {
    let formControl = input.parentElement;
    formControl.className = "prescribed space error";
}

// Validation for Mode of mode Of Payment------------------------------------------------
function isOneChecked() {

    var chec = document.getElementsByTagName('input');
    for (var i = 0; i < chec.length; i++) {
        if (chec[i].type == 'radio' && chec[i].checked) {
            return true;
        }
    }
    return false;
}

// ERROR MESSAGE FOR SEARCH----------------------------------------------
function setError(input) {
    let formControl = input.parentElement;
    formControl.className = "sbar  error";
}

// VALIDATION for DISCOUNT--------------------------------------
function ifDiscount(evt, input) {
    let charcode = evt.keyCode;
    if (charcode > 31 && (charcode < 48 || charcode > 57)) {
        return false;
    }
    else {
        return true;
    }
}

function isDiscount(input, member) {
    input.value = parseInt(input.value, 10);
    if (input.value > member) {
        mem_data = 0;
        return false;
    }
}

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
            }
            else {
                alert("Error!")
            }
        })
        .catch((err) => console.log(err))

    location.reload();
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
        alert('Please enter contact number!');
        return false;
    }
    else if (cont_data === 0) {
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
                alert(yes)
                window.location.href = `http://localhost:3000/cart/success/${number}`;
            }
            else {
                window.location.href = `http://localhost:3000/cart/failure/${number}`;
            }
        })
        .catch((err) => console.log(err))
}

function invoiceGenerate(value1, value2, len) {
    console.log(len);
    len = parseInt(len);
    if (len == 0) {
        alert('No items for purchase.');
        return false;
    }

    let flag = 1;
    let prescribed = prescribedby.value;
    if (prescribed == "") {
        setErrorMsg(prescribedby);
        flag = 0;
    }

    if (!isOneChecked()) {
        flag = 0;
    }

    let disc = parseInt(document.getElementById('discount').value);
    if (!Number.isInteger(disc)) {
        flag = 0;
    };

    if (flag == 0) {
        alert("Please fill all the fields!");
        return false;
    }

    if (val_data == 0) {
        alert('Please correct the input fields!');
        return false;
    }

    if (mem_data == 0) {
        alert('Discount cannot be greater than membership points!');
        return false;
    }

    let cid = parseInt(value1);
    let total = parseInt(value2);
    let pby = document.getElementById("prescribedby").value;
    let cash = document.getElementById("cash").checked;
    let discount = parseInt(document.getElementById("discount").value);
    let fm;

    if (cash) {
        fm = 1;
    }
    else {
        fm = 2;
    }
    fm = parseInt(fm);

    let row = { cid, pby, discount, total, fm };

    fetch(`/cart/success/${cid}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(row)
    }).then((res) => res.json())
        .then(res => {
            if (res.success === true) {
                fetch(`/invoice/data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(row)
                }).then((res) => res.json())
                    .then(res => {
                        if (res.success === true) {
                            window.location.href = `http://localhost:3000/invoice/data/${res.results[0].order_id}`;
                        }
                        else {
                            alert("Invoice not found!");
                            location.reload();
                        }
                    })
                    .catch((err) => console.log(err))
            }
            else {
                alert("Error!")
                location.reload();
            }
        })
        .catch((err) => console.log(err))
}

function netAmount(value) {
    let discount = parseInt(document.getElementById("discount").value);
    let sum = parseInt(value);
    document.getElementById("net").innerHTML = sum - discount;
}