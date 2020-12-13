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

// Validation for Mode of Payment------------------------------------------------
function isOneChecked() {

    let chec = document.getElementsByTagName('input');
    for (var i = 0; i < chec.length; i++) {
        if (chec[i].type == 'radio' && chec[i].checked) {
            return true;
        }
    }
    return false;
}


function getDate() {
    let fdate = document.getElementById("fdate").value;
    let tdate = document.getElementById("tdate").value;
    let customers = document.getElementById("customers").checked;
    let flag = 1;

    if (!fdate || !tdate) {
        flag = 0;
    }

    if (flag === 0) {
        alert('Please enter the date range correctly!');
        return false;
    }

    if (!isOneChecked()) {
        flag = 0;
    }

    if (flag === 0) {
        alert('Please select an option for "Report by"!');
        return false;
    }

    let row = { fdate, tdate };

    fetch("/salesreport/period", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(row)
    }).then((res) => res.json())
        .then(res => {
            if (res.success === false) {
                alert("No sale between these dates!")
                location.reload();
            }
            else {
                if (!customers) window.location.href = `http://localhost:3000/salesreport/medicines/${fdate}/${tdate}`;
                else window.location.href = `http://localhost:3000/salesreport/customers/${fdate}/${tdate}`;
            }
        })
        .catch((err) => console.log(err))
}