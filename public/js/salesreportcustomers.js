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

function viewDetails(value){
    let inumber = parseInt(value);
    window.location.href=`http://localhost:3000/invoice/data/${inumber}`;
}