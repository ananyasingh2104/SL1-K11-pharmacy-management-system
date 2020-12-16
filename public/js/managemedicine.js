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

function searchMedicine() {
  let input = document.getElementById("msearch").value.toUpperCase();
  let table = document.getElementById("medicines");
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

// VALIDATION for BUYING QUANTITY--------------------------------------
function ifQuantity(evt, input) {
  let charcode = evt.keyCode;
  if (charcode > 31 && (charcode < 48 || charcode > 57)) {
    return false;
  }
  else {
    return true;
  }

}

function isQuantity(input) {
  input.value = parseInt(input.value, 10);
}

function addToCart(value1, value2) {
  let mid = parseInt(value1);
  let bquantity = parseInt(document.getElementById(value2).value);

  if (!Number.isInteger(bquantity) || bquantity === 0) {
    alert('Please enter correct quantity value!');
    location.reload();
    return false;
  };

  let row = { mid, bquantity };

  fetch("/manage/medicine", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(row)
  }).then((res) => res.json())
    .then(res => {
      if (res.success === true) {
        alert("Added to cart!")
        location.reload();
      }
      else {
        alert("Please enter correct quantity value!")
        location.reload();
      }
    })
    .catch((err) => console.log(err))


}

function editMedicine(value) {
  let id = parseInt(value);
  window.location.href = `http://localhost:3000/update/medicine/${id}`;
}

