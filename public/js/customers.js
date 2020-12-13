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

function searchCustomer() {
  let input = document.getElementById("msearch").value.toUpperCase();
  let table = document.getElementById("customers");
  let tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    let td = tr[i].getElementsByTagName("td")[2];
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

// ERROR MESSAGE FOR SEARCH----------------------------------------------
function setError(input) {
  let formControl = input.parentElement;
  formControl.className = "sbar  error";
}

function editCustomer(value) {
  let id = parseInt(value);
  window.location.href = `http://localhost:3000/update/customer/${id}`;
}

function viewOrders(value) {
  let cid = parseInt(value);
  window.location.href = `http://localhost:3000/view/orders/${cid}`;
}