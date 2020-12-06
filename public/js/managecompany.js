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

function editCompany(value){
  let id = parseInt(value);
    window.location.href=`http://localhost:3000/update/company/${id}`;
  }
  