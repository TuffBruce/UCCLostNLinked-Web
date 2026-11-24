// This script is responsible for handling the uploading of a found item on the "Upload Found Item" page.
// Only TUBS can upload found items: they enter the TUBS access code, which signs into the shared TUBS account behind the scenes.
// This includes the importing of Gemini as an AI Model for item categorization
import { auth, db, storage } from "./firebase.js"
import { setupAICategory } from "./ai-category.js";
import { setupAIImageSuggest } from "./ai-image-suggest.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"; // firebase CDN
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js"; // firebase CDN
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"; // firebase CDN

// The shared TUBS account's email (created in the Firebase console). The access code is this account's password.
const TUBS_EMAIL = "ucctubs@gmail.com";

// Select the elements from HTML
const formElement = document.getElementById("upload-list-item-form");
const accessCodeSection = document.getElementById("access-code-section");
const accessCodeInput = document.getElementById("access-code");
const accessCodeError = document.getElementById("access-code-error");
const titleInput = document.getElementById("item-title");
const locationInput = document.getElementById("foundLocation");
const categoryInput = document.getElementById("item-category");
const dateInput = document.getElementById("date-found");
const imageInput = document.getElementById("item-photo");
const buttonElement = document.getElementById("submit-btn");
const categoryLoadingMessage = document.getElementById("category-loading-message");

// If TUBS already entered the code in this browser session, hide the access code box so they don't need to retype it
auth.onAuthStateChanged((user) => {
    if (user && user.email === TUBS_EMAIL) {
        accessCodeSection.classList.add("hidden");
        accessCodeInput.required = false;
    } else {
        accessCodeSection.classList.remove("hidden");
        accessCodeInput.required = true;
    }
});

// Checks the access code by signing into the TUBS account. Returns true if the code is correct.
async function verifyAccessCode() {
    // Already verified earlier in this session
    if (auth.currentUser && auth.currentUser.email === TUBS_EMAIL) {
        return true;
    }

    accessCodeError.classList.add("hidden");
    try {
        // Stay verified only until the browser is closed
        await setPersistence(auth, browserSessionPersistence);
        await signInWithEmailAndPassword(auth, TUBS_EMAIL, accessCodeInput.value);
        return true;
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
        return false;
    }
}

// Form submission
formElement.addEventListener("submit", async (event) => {
    // prevent form from refreshing page
    event.preventDefault();
    // does not allow the user to click the button again while it is being submitted
    buttonElement.disabled = true;

    // Stop here if the access code is wrong
    const codeIsCorrect = await verifyAccessCode();
    if (!codeIsCorrect) {
        buttonElement.disabled = false;
        window.scrollTo({ top: 0, behavior: "smooth" }); // show the error at the top of the form
        return;
    }

    try {
        // extract the values of the inputs
        const title = titleInput.value;
        const location = locationInput.value;
        const category = categoryInput.value;
        const dateFound = dateInput.value;
        const imageFile = imageInput.files[0];

        // create an random id for the photo
        const photoID = crypto.randomUUID();

        // get extension of the image file
        const extension = imageFile.name.split(".").pop();

        // upload the image to the firebase storage and generate a URL for it
        const storageRef = ref(storage, "foundItems/" + photoID + "." + extension);

        // upload the file to the path in storage
        await uploadBytes(storageRef, imageFile);
        // get the download URL of the uploaded image
        const imageURL = await getDownloadURL(storageRef);

        // retrieve the collection from Firebase
        const foundItemsCollection = collection(db, "foundItems");

        // make a timestamp from the date value
        // make the date local time at midnight
        const [year, month, day] = dateFound.split("-");
        const date = new Date(Number(year), Number(month) - 1, Number(day));

        // construct the found item object to be saved in firestore
        const newFoundItem = {
            itemTitle: title,
            foundLocation: location,
            foundItemCategory: category,
            date: date,
            imageURL: imageURL,
        };

        // add the new found item to the collection
        await addDoc(foundItemsCollection, newFoundItem);

        // navigate to the found items page
        window.location.href = "founditems.html";
    } catch (error) {
        // If anything fails, let the user know and allow them to try again
        console.error("Uploading found item failed:", error);
        alert("Sorry, something went wrong while uploading the item. Please try again.");
        buttonElement.disabled = false;
    }
});

//Image Preview: Listen when the image changes, and display it as a preview before submission.
imageInput.addEventListener("change", () => {
    // Querying the user's file from their file input
    const file = imageInput.files[0];
    // Queries the image preview element from HTML
    const imagePreview = document.getElementById("image-preview");
    if (file) {
        // Reads the image file and makes the image preview visible on the screen
        const reader = new FileReader();
        reader.onload = () => {
            imagePreview.src = reader.result;
            imagePreview.classList.remove("hidden");
        };
        // Converts the image file in a readable URL in Firebase
        reader.readAsDataURL(file);
    } else {
        // If the user clicks cancel, it clears the data of the image preview and hides it so it is not visible
        imagePreview.src = "";
        imagePreview.classList.add("hidden");
    }
});

// AI Filter Feature: When the setupAICategory function is called, it will set up the event listener for the title input.
setupAICategory(titleInput, categoryInput, categoryLoadingMessage);
// AI Image Feature: suggest a title and category from the uploaded photo
setupAIImageSuggest(imageInput, titleInput, categoryInput, categoryLoadingMessage);