// This script is responsible for handling the user's uploading of a found item on the "Upload Found Item" page. This includes the importing of Gemini as an AI Model for item categorization
import { auth, db, storage } from "./firebase.js"
import { setupAICategory } from "./ai-category.js";
import { setupAIImageSuggest } from "./ai-image-suggest.js";
import { collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"; // firebase CDN
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js"; // firebase CDN

// Select the elements from HTML
const formElement = document.getElementById("upload-list-item-form");
const titleInput = document.getElementById("item-title");
const locationInput = document.getElementById("foundLocation");
const categoryInput = document.getElementById("item-category");
const dateInput = document.getElementById("date-found");
const potentialOwnerInput = document.getElementById("potential-owner-name");
const imageInput = document.getElementById("item-photo");
const buttonElement = document.getElementById("submit-btn");
const categoryLoadingMessage = document.getElementById("category-loading-message");

// Observe the authentication state of the user to setup form submission listener
auth.onAuthStateChanged(async(user) => {
    if (user) {
        console.log("user is logged in");

        // Queries the user ID and data from Firestore to be displayed in the found item card.
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        formElement.addEventListener("submit", async (event) => {
            // prevent form from refreshing page
            event.preventDefault();
            // does not allow the user to click the button again while it is being submitted
            buttonElement.disabled = true;
            // extract the values of the inputs
            const title = titleInput.value;
            const location = locationInput.value;
            const category = categoryInput.value;
            const dateFound = dateInput.value;
            // if the user does not input anything, the found item card will show N/A for the potential owner name section
            const potentialOwnerName = potentialOwnerInput.value || "N/A"; 
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
                lostItemOwnerName: potentialOwnerName,
                imageURL: imageURL,
                // use the displayName from the user data
                founderName: userData.firstName + ' ' + userData.lastName
            };

            // add the new found item to the collection
            await addDoc(foundItemsCollection, newFoundItem);

            // navigate to the found items page
            window.location.href = "founditems.html";
        });
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