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

let val_data = [];

// Validation for MEDICINE NAME-----------------------------------------
function isMedicine(input) {
    document.getElementById('mname').value = document.getElementById('mname').value.trim();
    input = input.trim();
    let medicineName = /^[a-zA-Z0-9.,()%/-]+( [a-zA-Z0-9.,()%/-]+)*$/;
    if (input.length >= 2 && input.length <= 50 && input.match(medicineName)) {
        let stack = [];
        for (let i = 0; i < input.length; i++) {
            if (input[i] === '(')
                stack.push('(');
            else if (input[i] === ')') {

                if (stack.length === 0) {
                    setErrorMsg(mname);
                    val_data[0] = 0;
                    return false;
                }
                else {
                    let last = stack.pop();
                    if (last != '(') {
                        setErrorMsg(mname);
                        val_data[0] = 0;
                        return false;
                    }
                }
            }
        }
        if (stack.length === 0);
        else {
            setErrorMsg(mname);
            val_data[0] = 0;
            return false;
        }
        setSuccessMsg(mname);
        val_data[0] = 1;
        return True;
    }
    else {
        setErrorMsg(mname);
        val_data[0] = 0;
        return false;
    }
}

// Validation for QUANTITY-------------------------------------------

function isQuantity(input) {
    document.getElementById('quantity').value = document.getElementById('quantity').value.trim();
    input = input.trim();

    if (isNaN(input)) {
        setErrorMsg(quantity);
        val_data[1] = 0;
        return false;
    }

    let added = (input.match(/\+/g) || []).length;
    let removed = (input.match(/\-/g) || []).length;
    if (added > 1 || removed > 1) {
        setErrorMsg(price);
        val_data[2] = 0;
        return false;
    }
    else {
        document.getElementById('quantity').value = parseInt(input, 10);
        input = parseInt(input, 10);

        if (input.length != 0) {
            setSuccessMsg(quantity);
            val_data[1] = 1;
            return True;
        }
        else {
            setErrorMsg(quantity);
            val_data[1] = 0;
            return false;
        }
    }

}
function ifQuantity(evt, input) {
    let charcode = evt.keyCode;
    if (charcode != 45 && charcode != 43 && charcode > 31 && (charcode < 48 || charcode > 57)) {
        quantity.parentElement.className = "form-control error";
        return false;
    }
    else {
        quantity.parentElement.className = "form-control";
        return true;
    }

}

// VALIDATIONS FOR PRICE---------------------------------------------------

function isPrice(input) {
    document.getElementById('price').value = document.getElementById('price').value.trim();
    input = input.trim();

    let decimal = (input.match(/\./g) || []).length;
    if (decimal > 1) {
        setErrorMsg(price);
        val_data[2] = 0;
        return false;
    }
    else {

        document.getElementById('price').value = parseFloat(input);
        input = parseFloat(input);

        if (input > 0 && input.length != 0) {
            setSuccessMsg(price);
            val_data[2] = 1;
            return True;
        }
        else {
            setErrorMsg(price);
            val_data[2] = 0;
            return false;
        }
    }

}

function ifPrice(evt, input) {
    let charcode = evt.keyCode;
    if (charcode != 46 && charcode > 31
        && (charcode < 48 || charcode > 57)) {
        price.parentElement.className = "form-control error";
        return false;
    }
    else {
        price.parentElement.className = "form-control";
        return true;
    }
}

// SUCCESS AND ERROR functions----------------------------------------------
function setSuccessMsg(input) {
    let formControl = input.parentElement;
    formControl.className = "form-control success";
}
function setErrorMsg(input) {
    let formControl = input.parentElement;
    formControl.className = "form-control  error";
}


function updateMedicine(value) {
    let flag = 1;

    for (let i = 0; i < val_data.length; i++) {
        if (val_data[i] == 0) {
            alert('Please correct the input fields!');
            flag = 0;
            return false;
        }
    }
    if (flag) {
        let cname = (document.getElementById("cname").value).toUpperCase();
        let mname = (document.getElementById("mname").value).toUpperCase();
        let quantity = parseInt(document.getElementById("quantity").value);
        let price = parseInt(document.getElementById("price").value);
        let id = parseInt(value);

        let row = { id, cname, mname, quantity, price };

        fetch(`/update/medicine/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(row)
        }).then((res) => res.json())
            .then(res => {
                if (res.success === false) {
                    alert("Entered medicine already exists or invalid quantity!")
                    location.reload();
                }
                else {
                    alert("Medicine updated!")
                    location.reload();
                }
            })
            .catch((err) => console.log(err))
    }
}