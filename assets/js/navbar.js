import { auth, db } from "./firebase.js"
import { signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // firebase CDN

const logoutBtn = document.getElementById("logout-btn");
const userEmail = document.getElementById("user-email");

/* Listener for logout button click event*/
logoutBtn.addEventListener("click", async function(event) {
    event.preventDefault();
    console.log("clicking button");
    try {
        await signOut(auth);
    } catch(error) {
        console.log(error.code);
    }
});

auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("user is logged in");
        userEmail.textContent = user.email;
    } else {
        console.log("user is logged out");
        window.location.href = "login.html";
    }
});