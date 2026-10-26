// This script is responsible for handling the login authentication procedure on the login page.
import { auth } from "./firebase.js"
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"; // firebase CDN

// Select elements from the HTML
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorLabel = document.getElementById("error-label");
const rememberMeInput = document.getElementById("remember-me");

// If the user chose "Remember me" last time, fill in their email and tick the box
try {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeInput.checked = true;
    }
} catch (e) {
    // browser storage unavailable (e.g. private mode) - just skip
}

// Add event listener to the login form
loginForm.addEventListener("submit", async function(event) {
    // prevents the form from refreshing the page
    event.preventDefault()
    console.log("clicking button");
    console.log(emailInput.value);
    // clear error label
    errorLabel.classList.add('hidden');
    // Call Firebase to log in the user
    try {
        // Uses firebase's signInWithEmailAndPassword function to log in the user
        // with the provided email and password
        // Remember me: stay logged in after closing the browser. Otherwise: log out when the browser closes
        await setPersistence(auth, rememberMeInput.checked ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);

        // Save or forget the email for next time
        try {
            if (rememberMeInput.checked) {
                localStorage.setItem("rememberedEmail", emailInput.value);
            } else {
                localStorage.removeItem("rememberedEmail");
            }
        } catch (e) {
            // browser storage unavailable - just skip
        }
        
        // Redirect User to Dashboard Page if successful
        window.location.href = "index.html";
    } catch(error) {
        console.log(error.code);
        errorLabel.classList.remove('hidden');
        errorLabel.textContent = error.message;
        // All the possible error messages that could occur when trying to login
        if (error.code === 'auth/invalid-credential') { 
            errorLabel.textContent = "Invalid email or password";
        } else {
            errorLabel.textContent = "An error occurred";
        }
    }
});