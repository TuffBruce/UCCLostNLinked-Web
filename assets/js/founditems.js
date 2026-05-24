import { auth, db } from "./firebase.js"
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firebase CDN


// Step 1: get all found items from firestore
const foundItemsCollection = collection(db, "foundItems");
const snapshot = await getDocs(foundItemsCollection);
// convert the snapshot docs to an array of javascript objects
const foundItems = snapshot.docs.map(doc => doc.data());
// sort the items in descending order by date (newest items first)
foundItems.sort((a, b) => b.date.toDate() - a.date.toDate()); // convert Firestore timestamps to JavaScript Date objects for comparison
console.log(foundItems); // log the found items to the console to check if we got the data

// Step 2: display the data in the HTML
const container = document.getElementById("items-container");
foundItems.forEach(item => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("item-card");
    const foundDate = item.date.toDate(); // convert Firestore timestamp to JavaScript Date object
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
    container.appendChild(itemElement);
});
