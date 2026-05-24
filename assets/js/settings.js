import { auth, db } from "./firebase.js"
import { getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firebase CDN
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // firebase CDN


// Select the elements from the HTML
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const profileInfoForm = document.getElementById("profile-info-form");
const emailInput = document.getElementById("email");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const confirmNewPasswordInput = document.getElementById("confirm-new-password");
const emailPasswordForm = document.getElementById("email-password-form");

const profileErrorLabel = document.getElementById("profile-error-label");
const profileSuccessLabel = document.getElementById("profile-success-label");
const passwordErrorLabel = document.getElementById("password-error-label");
const passwordSuccessLabel = document.getElementById("password-success-label");

// Prepopulate the profile information form with the user's current data from firestore
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("user is logged in");
        // get user data from firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        console.log(userDoc.data());
        
        const userData = userDoc.data(); // the data from firestore user doc
        
        // prepopulate the profile information form with the user's data
        firstNameInput.value = userData.firstName;
        lastNameInput.value = userData.lastName;
        emailInput.value = userData.email;
    }
});


// handle profile information form submission
profileInfoForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // prevent the default form submission behavior

    // clear labels
    profileErrorLabel.classList.add('hidden');
    profileErrorLabel.textContent = "";
    profileSuccessLabel.classList.add('hidden');
    profileSuccessLabel.textContent = "";

    // get the new values for the first name and last name from the form inputs
    const newFirstName = firstNameInput.value;
    const newLastName = lastNameInput.value;

    // validate the new first name and last name (e.g., check if they are not empty)
    if (newFirstName === "" || newLastName === "") {
        profileErrorLabel.classList.remove('hidden');
        profileErrorLabel.textContent = "First name and last name cannot be empty";
        return; // exit early if validation fails
    }

    // update the user document in the users collection in firestore
    const userRef = doc(db, "users", auth.currentUser.uid);

    // Set the "capital" field of the city 'DC'
    await updateDoc(userRef, {
        firstName: newFirstName,
        lastName: newLastName
    });

    profileSuccessLabel.classList.remove('hidden');
    profileSuccessLabel.textContent = "Profile information updated successfully!";
});

// handle email and password form submission
emailPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // prevent the default form submission behavior
    // clear labels
    passwordErrorLabel.classList.add('hidden');
    passwordErrorLabel.textContent = "";
    passwordSuccessLabel.classList.add('hidden');
    passwordSuccessLabel.textContent = "";

    const user = auth.currentUser; // get the current user's email from the auth object

    // reauthenticate the user with their current password
    try {
        const currentPassword = currentPasswordInput.value;
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
    
        await reauthenticateWithCredential(user, credential);
    } catch (error) {
        console.error("Reauthentication failed:", error);
        passwordErrorLabel.classList.remove('hidden');
        passwordErrorLabel.textContent = "Incorrect current password";
        return; // exit early if reauthentication fails
    }

    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    // check new password matches the confirm new password
    if (newPassword !== confirmNewPassword) {
        passwordErrorLabel.classList.remove('hidden');
        passwordErrorLabel.textContent = "New password and confirm new password do not match";
        return; // exit early
    }

    try {
        await updatePassword(user, newPassword);
        // success label
        passwordSuccessLabel.classList.remove('hidden');
        passwordSuccessLabel.textContent = "Password updated successfully!";
        // clear form
        currentPasswordInput.value = "";
        newPasswordInput.value = "";
        confirmNewPasswordInput.value = "";
    } catch(error) {
        // signup failed
        console.error("Password update failed:", error);
        passwordErrorLabel.classList.remove('hidden');
        
        // see: https://firebase.google.com/docs/reference/assets/js/auth#autherrorcodes
        if (error.code === 'auth/email-already-in-use') {
            passwordErrorLabel.textContent = "Email already in use";
        } else if (error.code === 'auth/weak-password') {
            passwordErrorLabel.textContent = "Weak password";
        } else if (error.code === 'auth/invalid-email') {
            passwordErrorLabel.textContent = "Invalid email";
        } else if (error.code === 'auth/missing-password') {
            passwordErrorLabel.textContent = "Missing password";
        } else if (error.code === 'auth/missing-email') {
            passwordErrorLabel.textContent = "Missing email";
        } else {
            passwordErrorLabel.textContent = "An error occurred";
        }
    }
});
