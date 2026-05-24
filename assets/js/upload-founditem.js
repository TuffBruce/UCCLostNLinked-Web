import { auth, db, storage } from "./firebase.js"
import { collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firebase CDN
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js"; // firebase CDN


// Select the elements from the HTML
const formElement = document.getElementById("upload-list-item-form");
const titleInput = document.getElementById("item-title");
const locationInput = document.getElementById("foundLocation");
const categoryInput = document.getElementById("item-category");
const dateInput = document.getElementById("date-found");
const potentialOwnerInput = document.getElementById("potential-owner-name");
const imageInput = document.getElementById("item-photo");
const buttonElement = document.getElementById("submit-btn");

// Observe the authentication state of the user to setup form submission listener
auth.onAuthStateChanged(async(user) => {
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
            const dateFound = dateInput.value;
            const potentialOwnerName = potentialOwnerInput.value || "N/A"; // if the user does not input anything, the found item card will show N/A for the potential owner name section
            const imageFile = imageInput.files[0];

            // create an id for the photo
            const photoID = crypto.randomUUID(); // generate a random id for the photo

            // get extension of the image file
            const extension = imageFile.name.split(".").pop(); // get the extension of the file

            // upload the image to the firsbase storage and generate a URL for it
            const storageRef = ref(storage, "foundItems/" + photoID + "." + extension);

            // upload the file to the path in storage
            await uploadBytes(storageRef, imageFile);
            const imageURL = await getDownloadURL(storageRef); // get the download URL of the uploaded image

            // get the collection
            const foundItemsCollection = collection(db, "foundItems");

            // make a timestamp from the date value
            // make the date local time at midnight
            const [year, month, day] = dateFound.split("-"); // split the date string
            const date = new Date(Number(year), Number(month) - 1, Number(day));

            // construct the found item object to be saved in firestore
            const newFoundItem = {
                itemTitle: title,
                foundLocation: location,
                foundItemCategory: category,
                date: date,
                lostItemOwnerName: potentialOwnerName,
                imageURL: imageURL,
                founderName: userData.firstName + ' ' + userData.lastName // use the displayName from the user data
            };

            // add the new found item to the collection
            await addDoc(foundItemsCollection, newFoundItem);

            // navigate to the found items page
            window.location.href = "founditems.html";
        });
    }
});

// listen when the image changes, and preview it
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    const imagePreview = document.getElementById("image-preview");
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            imagePreview.src = reader.result;
            imagePreview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    } else { // when clicking cancel
        imagePreview.src = "";
        imagePreview.classList.add("hidden");
    }
});
