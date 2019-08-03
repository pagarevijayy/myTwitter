console.log("Client-side js loaded..");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");


loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(loginEmail.value);
    console.log(loginPassword.value);
})