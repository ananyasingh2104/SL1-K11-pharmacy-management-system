const inputs = document.querySelectorAll(".input");

function addcl() {
    let parent = this.parentNode.parentNode;
    parent.classList.add("focus");
}

function remcl() {
    let parent = this.parentNode.parentNode;
    if (this.value == "") {
        parent.classList.remove("focus");
    }
}

const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function (e) {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});

inputs.forEach(input => {
    input.addEventListener("focus", addcl);
    input.addEventListener("blur", remcl);
});

let val_data = [];
// Validations for PHARMACY NAME---------------------------------------------------------
function isCustomer(input) {
    document.getElementById('name').value = document.getElementById('name').value.trim();
    input = input.trim();
    let pharmaName = /^[a-zA-Z0-9.&-]+( [a-zA-Z0-9.&-]+)*$/;
    if (input.length >= 2 && input.length <= 50 && input.match(pharmaName)) {
        setSuccessMsg('name');
        val_data[0] = 1;
        return true;
    }
    else {
        setErrorMsg('name');
        val_data[0] = 0;
        return false;
    }
}

// Validations for CONTACT INFORMATION---------------------------------------------------------

function isContact(evt, input) {
    let charcode = evt.keyCode;
    if (charcode > 31 && (charcode < 48 || charcode > 57)) {
        return false;
    }
    else {
        return true;
    }
}

function isLength(len, input, type) {
    let letters = /^[6-9][0-9]{0,9}$/;
    if (input.value.length === len && input.value.match(letters)) {
        setSuccessMsg('contact');
        val_data[1] = 1;
        return true;
    }
    else {
        setErrorMsg('contact');
        val_data[1] = 0;
        return false;
    }
}

// Validation for EMAIL ID----------------------------------------------
function isemail(input) {
    document.getElementById('email').value = document.getElementById('email').value.trim();
    input = input.trim();

    let email1 = /^[^\s]+([a-zA-Z0-9._-])+\@([a-zA-Z0-9])+\.([a-zA-Z]{2,4})$/;
    let email2 = /^[^\s]([a-zA-Z0-9._-])+\@([a-zA-Z0-9])+\.([a-zA-Z]{2,4})+\.([a-zA-Z]{2,4})$/;


    if (input.match(email1) || input.match(email2) || input.length == 0) {
        setSuccessMsg('email');
        val_data[2] = 1;
        return true;
    }
    else {
        setErrorMsg('email');
        val_data[2] = 0;
        return false;
    }
}

// Validation for ADDRESS-----------------------------------------------
function isAddress(input) {
    document.getElementById('address').value = document.getElementById('address').value.trim();
    input = input.trim();

    let addr = /^[A-Za-z0-9,.-/]+( [A-Za-z0-9,.-/]+)*$/;
    if (input.match(addr) || input.length == 0) {
        setSuccessMsg('address');
        val_data[3] = 1;
        return true;
    }
    else {
        setErrorMsg('address');
        val_data[3] = 0;
        return false;
    }
}

// Validation for USERNAME-----------------------------------------------
function isUsername(input) {
    document.getElementById('username').value = document.getElementById('username').value.trim();
    input = input.trim();

    let userName = /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
    if (input.match(userName)) {
        setSuccessMsg('username');
        val_data[4] = 1;
        return true;
    }
    else {
        setErrorMsg('username');
        val_data[4] = 0;
        return false;
    }
}

// Validation for PASSWORD-----------------------------------------------
function isPassword(input) {
    document.getElementById('show').style.visibility = "hidden";
    document.getElementById('password').value = document.getElementById('password').value.trim();
    input = input.trim();

    let passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,16}$/;
    if (input.match(passw)) {
        setSuccessMsg('password');
        val_data[5] = 1;
        return true;
    }
    else {
        setErrorMsg('password');
        val_data[5] = 0;
        return false;
    }
}

function passwordVal() {
    document.getElementById('show').style.visibility = "visible";
}
// Validation for RE-ENTER PASSWORD-----------------------------------------------
function matchPassword(input) {
    document.getElementById('confirm').value = document.getElementById('confirm').value.trim();
    input1 = document.getElementById('password').value;
    input = input.trim();

    if (input === input1 && input.length != 0) {
        setSuccessMsg('confirm');
        val_data[6] = 1;
        return true;
    }
    else {
        setErrorMsg('confirm');
        val_data[6] = 0;
        return false;
    }
}



/* setting ERROR and SUCCESS messages */
function setSuccessMsg(input) {
    let a = document.getElementById(input);
    a.style.borderColor = "#1ADFBC";
}
function setErrorMsg(input) {
    let a = document.getElementById(input);
    a.style.borderColor = "#e74c3c";
}

/* SUBMIT BUTTON ONCLICK*/
function addPharmacy() {
    let flag = 1;
    let nameval = document.getElementById('name').value;
    if (nameval == "") {
        setErrorMsg('name');
        flag = 0;
    }

    let contactval = document.getElementById('contact').value;
    if (contactval == "") {
        setErrorMsg('contact');
        flag = 0;
    }

    let usernameval = document.getElementById('username').value;
    if (contactval == "") {
        setErrorMsg('username');
        flag = 0;
    }

    let passwordval = document.getElementById('password').value;
    if (passwordval == "") {
        setErrorMsg('password');
        flag = 0;
    }

    let confirmval = document.getElementById('confirm').value;
    if (passwordval == "") {
        setErrorMsg('confirm');
        flag = 0;
    }

    if (flag == 0) {
        alert("Please fill all the required fields!");
        return false;
    }

    for (let i = 0; i < val_data.length; i++) {
        if (val_data[i] == 0) {
            if (i == 6)
                alert("Passwords didn't match!");
            else
                alert('Please correct the input fields!');
            flag = 0;
            return false;
        }
    }
    if (document.getElementById("email").value.length == 0)
        document.getElementById("email").value = "NULL";

    if (document.getElementById("address").value.length == 0)
        document.getElementById("address").value = "NULL";

    if (flag) {
        let name = (document.getElementById("name").value).toUpperCase();
        let contact = document.getElementById("contact").value;
        let email = (document.getElementById("email").value).toUpperCase();
        let address = (document.getElementById("address").value).toUpperCase();
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;

        let row = { name, contact, email, address, username, password };

        fetch(`/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(row)
        }).then((res) => res.json())
            .then(res => {
                if (res.success === true) {
                    alert("Pharmacist added!")
                    window.location.href = `http://localhost:3000/`;
                }
                else {
                    alert("Email or username already exists!")
                    location.reload()
                }
            })
            .catch((err) => console.log(err))
    }
}