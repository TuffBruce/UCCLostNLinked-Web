import { auth, db } from "./firebase.js"
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // firebase CDN
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firebase CDN
import { showSuccessMessage } from "./success-message.js";

// Select the elements from the HTML
const signUpForm = document.getElementById("signup-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const firstNameInput = document.getElementById("firstname");
const lastNameInput = document.getElementById("lastname");
const gradeLabel = document.getElementById("grade-label");
const gradeInput = document.getElementById("grade");
const departmentLabel = document.getElementById("department-label");
const departmentInput = document.getElementById("department");  
const roleSelect = document.getElementById("role");
const errorLabel = document.getElementById("error-label");

/* Listener for role selection changes */
roleSelect.addEventListener("change", (event) => {
    // create dynamic form based on role selection
    const selection = event.target.value;
    // if role chosen is "student" display the grade input
    if (selection === 'Student') {
        gradeLabel.classList.remove('hidden');
        gradeInput.classList.remove('hidden');
        gradeInput.required = true;
        departmentLabel.classList.add('hidden');
        departmentInput.classList.add('hidden');
        departmentInput.required = false;
    // if role chosen is "faculty" display the department input
    } else if (selection === 'Faculty') {
        gradeLabel.classList.add('hidden');
        gradeInput.classList.add('hidden');
        gradeInput.required = false;
        departmentLabel.classList.remove('hidden');
        departmentInput.classList.remove('hidden');
        departmentInput.required = true;
    }
});

/* Listener for form submission */
signUpForm.addEventListener("submit",async function(event){
    event.preventDefault() // prevents the form from refreshing the page
    console.log("clicking button");
    console.log(emailInput.value);
    console.log(passwordInput.value);
    console.log(firstNameInput.value);
    console.log(lastNameInput.value);
    console.log(gradeInput.value);
    console.log(departmentInput.value);

    // clear error label
    errorLabel.classList.add('hidden');

    // Call Firebase to register the user
    try {
        // see: https://firebase.google.com/docs/auth/web/start#sign_up_a_new_user
        const authUser = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        console.log("authUser: ", authUser);

        // prepare the data to be stored in the database
        const data = {
            uid: authUser.user.uid,
            email: emailInput.value,
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            grade: gradeInput.value,
            department: departmentInput.value,
            role: roleSelect.value,
        }

        // use setDoc from firebase to store the user data in the "users" collection,
        // with the document id as the user's uid
        const result = await setDoc(doc(db, "users", authUser.user.uid), data);
        console.log(result);


        // on success signup redirect to login page
        showSuccessMessage(false);
        signUpForm.reset();  
    } catch(error) {
        // signup failed
        console.log(error.code);
        errorLabel.classList.remove('hidden');
        
        // check the error code against firebase's known error codes
        if (error.code === 'auth/email-already-in-use') {
            errorLabel.textContent = "Email already in use";
        } else if (error.code === 'auth/weak-password') {
            errorLabel.textContent = "Weak password";
        } else if (error.code === 'auth/invalid-email') {
            errorLabel.textContent = "Invalid email";
        } else if (error.code === 'auth/missing-password') {
            errorLabel.textContent = "Missing password";
        } else if (error.code === 'auth/missing-email') {
            errorLabel.textContent = "Missing email";
        } else {
            errorLabel.textContent = "An error occurred";
        }
    }
});