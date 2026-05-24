import { auth, db } from "./firebase.js"
import { signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // firebase CDN
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firebase CDN

// select the element from the HTML
const userName = document.getElementById("user-name");

// observe when user auth status changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("user is logged in");
        // get user data from firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        console.log(userDoc.data());

        const userData = userDoc.data(); // the data from firestore user doc

        userName.textContent = userData.firstName + " " + userData.lastName + " (" + userData.role + ")";
    } else {
        console.log("user is logged out");
        window.location.href = "login.html"; // redirect to login page if not logged in
    }
});