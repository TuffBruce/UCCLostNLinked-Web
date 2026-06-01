// This script is responsible for displaying the user's name and role on the dashboard page. 
import { auth, db } from "./firebase.js"
import { signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // firebase CDN
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firebase CDN

// select the element from the HTML
const userName = document.getElementById("user-name");

// observe when user auth status changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("user is logged in");
        // Retrieves user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        // Console log the user data to check if it works
        console.log(userDoc.data());

        // Query the data from firestore user doc
        const userData = userDoc.data(); 

        // Combines the first name, last name, and role of the user into one variable
        userName.textContent = userData.firstName + " " + userData.lastName + " (" + userData.role + ")";
    } else {
        console.log("user is logged out");
        // redirect to login page if not logged in
        window.location.href = "login.html"; 
    }
});