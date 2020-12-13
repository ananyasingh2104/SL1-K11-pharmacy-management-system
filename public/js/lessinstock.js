function editMedicine(value) {
    let id = parseInt(value);
    window.location.href = `http://localhost:3000/update/medicine/${id}`;
  }