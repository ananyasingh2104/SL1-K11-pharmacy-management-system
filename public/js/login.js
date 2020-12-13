const inputs = document.querySelectorAll(".input");

function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}

function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}

inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});

function login(){
	let username = document.getElementById("username").value
	let password = document.getElementById("password").value;

	let row = { username, password };

    fetch("/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(row)
    }).then((res) => res.json())
    .then(res => {
        if(res.success === true) {
            fetch("/", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
        else {
            alert("Invalid username or password!")
    }
    })
        .catch((err) => console.log(err))
}