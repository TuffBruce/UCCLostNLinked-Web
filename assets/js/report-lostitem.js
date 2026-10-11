// This script is responsible for handling the user's reporting of a lost item on the "Report Lost Item" page. This includes the importing of Gemini as an AI Model for item categorization
import { auth, db, storage } from "./firebase.js"
import { setupAICategory } from "./ai-category.js";
import { collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"; // firebase CDN
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js"; // firebase CDN

// Querying elements from the HTML
const formElement = document.getElementById("report-list-item-form");
const titleInput = document.getElementById("item-title");
const locationInput = document.getElementById("last-known-location");
const categoryInput = document.getElementById("item-category");
const dateInput = document.getElementById("date-lost");
const imageInput = document.getElementById("item-photo");
const buttonElement = document.getElementById("submit-btn");
const categoryLoadingMessage = document.getElementById("category-loading-message");


// Observe the user's authentication state 
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("user is logged in");

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data(); // the data from firestore user doc

        formElement.addEventListener("submit", async (event) => {
            event.preventDefault(); // prevent form from refreshing page
            buttonElement.disabled = true; // does not allow the user to click the button again while it is being submitted
            // extract the values of the inputs
            const title = titleInput.value;
            const location = locationInput.value;
            const category = categoryInput.value;
            const dateLost = dateInput.value;
            const imageFile = imageInput.files[0];

            // create an id for the photo
            const photoID = crypto.randomUUID(); // generate a random id for the photo

            // get extension of the image file
            const extension = imageFile.name.split(".").pop(); // get the extension of the file

            // upload the image to the firebase storage and generate a URL for it
            const storageRef = ref(storage, "lostItems/" + photoID + "." + extension);

            // upload the file to the path in storage
            await uploadBytes(storageRef, imageFile);
            const imageURL = await getDownloadURL(storageRef); // get the download URL of the uploaded image

            // get the collection
            const lostItemsCollection = collection(db, "lostItems");

            // make a timestamp from the date value
            // make the date local time at midnight
            const [year, month, day] = dateLost.split("-"); // split the date string
            const date = new Date(Number(year), Number(month) - 1, Number(day));

            // construct the lost item object to be saved in firestore
            const newLostItem = {
                itemTitle: title,
                lastKnownLocation: location,
                lostItemCategory: category,
                date: date,
                imageURL: imageURL,
                lostItemOwnerName: userData.firstName + ' ' + userData.lastName // use the displayName from the user data
            };

            // add the new lost item to the collection
            await addDoc(lostItemsCollection, newLostItem);

            // navigate to the lost items page
            window.location.href = "lostitems.html";
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