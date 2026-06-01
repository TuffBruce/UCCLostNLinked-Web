// This script is responsible for solely handling the "logout" button functionality and the display of the user's email on the navbar of most pages.
import { auth, db } from "./firebase.js"
import { signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // firebase CDN

// Query the elements from HTML
const logoutBtn = document.getElementById("logout-btn");
const userEmail = document.getElementById("user-email");

// Listens asynchronously for when the user clicks the logout button, then executes the function
logoutBtn.addEventListener("click", async function(event) {
    // When the button is clicked, it prevents the default page-refreshing action of the button.
    event.preventDefault();
    console.log("clicking button");
    try {
        // Signout function from Firebase to log out the user
        await signOut(auth);
    } catch(error) {
        // If there is an error, show in console log for debugging purposes
        console.log(error.code);
    }
});

// Observes asynchronously if the user is logged in or not.
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("user is logged in");
        userEmail.textContent = user.email;
    } else {
        console.log("user is logged out");
        // If not, direct them to login page
        window.location.href = "login.html";
    }
});