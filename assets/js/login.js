import { auth } from "./firebase.js"
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // firebase CDN

// Select elements from the HTML
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorLabel = document.getElementById("error-label");

// Add event listener to the login form
loginForm.addEventListener("submit", async function(event) {
    event.preventDefault() // prevents the form from refreshing the page
    console.log("clicking button");
    console.log(emailInput.value);
    console.log(passwordInput.value);
    // clear error label
    errorLabel.classList.add('hidden');
    // Call Firebase to log in the user
    try {
        // Uses firebase's signInWithEmailAndPassword function to log in the user
        // with the provided email and password
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        
        // Redirect User to Dashboard Page if successful
        window.location.href = "index.html";
    } catch(error) {
        console.log(error.code);
        errorLabel.classList.remove('hidden');
        errorLabel.textContent = error.message;
        if (error.code === 'auth/invalid-credential') { // the most common error for wrong email or password
            errorLabel.textContent = "Invalid email or password";
        } else {
            errorLabel.textContent = "An error occurred";
        }
    }
});