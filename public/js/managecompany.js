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

function searchCompany() {
  let input = document.getElementById("msearch").value.toUpperCase();
  let table = document.getElementById("companies");
  let tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    let td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      let txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(input) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function editCompany(value){
  let id = parseInt(value);
    window.location.href=`http://localhost:3000/update/company/${id}`;
  }
  