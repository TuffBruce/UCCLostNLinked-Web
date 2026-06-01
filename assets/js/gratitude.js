// This script is responsible for handling the user's inputted gratitude message in the gratitude board. 
import { auth, db,} from "./firebase.js"
import { collection, addDoc, getDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firebase CDN
import { showSuccessMessage } from "./success-message.js";

// Query all the elements from the HTML
const suggestion1 = document.getElementById('suggestion-1');
const suggestion2 = document.getElementById('suggestion-2');
const suggestion3 = document.getElementById('suggestion-3');
const suggestion4 = document.getElementById('suggestion-4');
const suggestion5 = document.getElementById('suggestion-5');
const textarea = document.getElementById('gratitude-message');
const gratitudeForm = document.getElementById('gratitude-form');

// Add click event listeners for each of the preset gratitude messages
suggestion1.addEventListener('click', () => {
    textarea.value = suggestion1.textContent;
});

suggestion2.addEventListener('click', () => {
    textarea.value = suggestion2.textContent;
});

suggestion3.addEventListener('click', () => {
    textarea.value = suggestion3.textContent;
});

suggestion4.addEventListener('click', () => {
    textarea.value = suggestion4.textContent;
});

suggestion5.addEventListener('click', () => {
    textarea.value = suggestion5.textContent;
});

// observe auth state and handle form submission
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("user is logged in");
        
        gratitudeForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Read the user's message content 
            const message = textarea.value;
            // Save the message to the Firestore collection "msgs" with user ID and date
            const gratitudeMsgsCollection = collection(db, "msgs");
            await addDoc(gratitudeMsgsCollection, {
                message: message,
                senderid: user.uid,
                timestamp: serverTimestamp()
            });

            // clear the textarea after submitting
            textarea.value = "";
            showSuccessMessage(true);

        });

    }
});