// This script handles the "TUBS Access" page. Only TUBS can upload found items:
// entering the TUBS access code signs into the shared TUBS account behind the scenes,
// then sends TUBS on to the "Upload Found Item" page.
import { auth } from "./firebase.js"
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"; // firebase CDN

// The shared TUBS account's email (created in the Firebase console). The access code is this account's password.
const TUBS_EMAIL = "ucctubs@gmail.com";

// Select the elements from HTML
const accessForm = document.getElementById("tubs-access-form");
const accessCodeInput = document.getElementById("access-code");
const accessCodeError = document.getElementById("access-code-error");
const accessButton = document.getElementById("access-btn");

// If TUBS already entered the code in this browser session, skip straight to the upload page
auth.onAuthStateChanged((user) => {
    if (user && user.email === TUBS_EMAIL) {
        window.location.href = "upload-founditem.html";
    }
});

// When the access code is submitted, check it by signing into the TUBS account
accessForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // prevent form from refreshing page
    accessButton.disabled = true;
    accessCodeError.classList.add("hidden");

    try {
        // Stay verified only until the browser is closed
        await setPersistence(auth, browserSessionPersistence);
        await signInWithEmailAndPassword(auth, TUBS_EMAIL, accessCodeInput.value);
        // Correct code: go to the upload page
        window.location.href = "upload-founditem.html";
    } catch (error) {
        console.log(error.code);
        accessCodeError.classList.remove("hidden");
        if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
            accessCodeError.textContent = "Incorrect access code";
        } else if (error.code === "auth/too-many-requests") {
            accessCodeError.textContent = "Too many attempts. Please wait a few minutes and try again.";
        } else {
            accessCodeError.textContent = "Could not check the access code. Please try again.";
        }
        accessButton.disabled = false;
    }
});