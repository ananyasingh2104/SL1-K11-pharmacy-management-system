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

function getDate(){
    let fdate = document.getElementById("fdate").value;
    let tdate = document.getElementById("tdate").value;

    let row = { fdate, tdate };

    fetch("/salesreport/period", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(row)
    }).then((res) => res.json())
    .then(res => {
        if(res.success === false) {
            alert("No sale between these dates!")
            location.reload();
        }
        else {
            window.location.href=`http://localhost:3000/salesreport/${fdate}/${tdate}`;
    }
    })
        .catch((err) => console.log(err))
}