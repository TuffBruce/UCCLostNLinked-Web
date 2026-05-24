import { auth, db } from "./firebase.js"
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firebase CDN

// Step 1: get all lost items from firestore
const lostItemsCollection = collection(db, "lostItems");
const snapshot = await getDocs(lostItemsCollection);
// convert the snapshot docs to an array of javascript objects
const lostItems = snapshot.docs.map(doc => doc.data());
// sort the items in descending order by date (newest items first)
lostItems.sort((a, b) => b.date.toDate() - a.date.toDate()); // convert Firestore timestamps to JavaScript Date objects for comparison
console.log(lostItems); // log the lost items to the console to check if we got the data

// Step 2: display the data in the HTML
const container = document.getElementById("items-container");
lostItems.forEach(item => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("item-card");
    const lostDate = item.date.toDate(); // convert Firestore timestamp to JavaScript Date object
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
    container.appendChild(itemElement);
});
