// This script is responsible for displaying all the lost items added into Firebase onto the "Lost Items" page.
import { auth, db } from "./firebase.js"
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firebase CDN

// Queries all lost items from firestore
const lostItemsCollection = collection(db, "lostItems");
const snapshot = await getDocs(lostItemsCollection);
// convert the snapshot docs to an array of javascript objects
const lostItems = snapshot.docs.map(doc => doc.data());
// sort the items in descending order by date (newest items first)
// Convert Firestore timestamps to JavaScript Date objects for comparison
lostItems.sort((a, b) => b.date.toDate() - a.date.toDate());
// log the lost items to the console to check if we got the data
console.log(lostItems);

// Displays the data in the HTML
const container = document.getElementById("items-container");
lostItems.forEach(item => {
    // Create a new div for each item card
    const itemElement = document.createElement("div");
    // uses the style.css "item-card" id to style the item card
    itemElement.classList.add("item-card");
    // Convert Firestore timestamp to JavaScript Date object
    const lostDate = item.date.toDate();
    // All the item card's information
    itemElement.innerHTML = `
        <img src="${item.imageURL}" alt="${item.itemTitle}" class="item-image"/>
        <div>
            <h2>${item.itemTitle}</h2>
            <p><label class="item-label">Lost Date:</label> ${lostDate.toLocaleDateString()}</p>
            <p><label class="item-label">Last Known Location:</label> ${item.lastKnownLocation}</p>
            <p><label class="item-label">Category:</label> ${item.lostItemCategory}</p>
            <p><label class="item-label">Owner:</label> ${item.lostItemOwnerName}</p>
        </div>
    `;
    // adds each iteration of the item card from firebase into the lost items screen
    container.appendChild(itemElement);
});
