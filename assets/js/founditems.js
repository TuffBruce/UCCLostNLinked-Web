// This script is responsible for displaying all the found items added into Firebase onto the "Found Items" page.
import { auth, db } from "./firebase.js"
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"; // firebase CDN

// Queries all found items from firestore
const foundItemsCollection = collection(db, "foundItems");
const snapshot = await getDocs(foundItemsCollection);
// convert the snapshot docs to an array of javascript objects
const foundItems = snapshot.docs.map(doc => doc.data());
// sort the items in descending order by date (newest items first)
// Convert Firestore timestamps to JavaScript Date objects for comparison
foundItems.sort((a, b) => b.date.toDate() - a.date.toDate());
// log the found items to the console to check if we got the data
console.log(foundItems);

// Displays the data in the HTML
const container = document.getElementById("items-container");
foundItems.forEach(item => {
    // Create a new div for each item card
    const itemElement = document.createElement("div");
    // uses the style.css "item-card" id to style the item card
    itemElement.classList.add("item-card");
    // convert Firestore timestamp to JavaScript Date object
    const foundDate = item.date.toDate();
    // All the item card's information
    itemElement.innerHTML = `
        <img src="${item.imageURL}" alt="${item.itemTitle}" class="item-image"/>
        <div>
            <h2>${item.itemTitle}</h2>
            <p><label class="item-label">Found Date:</label> ${foundDate.toLocaleDateString()}</p>
            <p><label class="item-label">Location Found:</label> ${item.foundLocation}</p>
            <p><label class="item-label">Category:</label> ${item.foundItemCategory}</p>
            <p><label class="item-label">Potential Owner:</label> ${item.lostItemOwnerName}</p>
            <p><label class="item-label">Item Finder:</label> ${item.founderName}</p>
        </div>
    `;
    // adds each iteration of the item card from firebase into the lost items screen
    container.appendChild(itemElement);
});
