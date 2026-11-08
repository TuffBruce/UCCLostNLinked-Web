// This script is responsible for displaying all the found items added into Firebase onto the "Found Items" page,
// organized into category folders (see category-folders.js).
import { db } from "./firebase.js"
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"; // firebase CDN
import { renderCategoryView, escapeHTML } from "./category-folders.js";

// Queries all found items from firestore
const foundItemsCollection = collection(db, "foundItems");
const snapshot = await getDocs(foundItemsCollection);
// convert the snapshot docs to an array of javascript objects
const foundItems = snapshot.docs.map(doc => doc.data());
// sort the items in descending order by date (newest items first)
// Convert Firestore timestamps to JavaScript Date objects for comparison
foundItems.sort((a, b) => b.date.toDate() - a.date.toDate());

// Show the category folders, or the items in the chosen category
renderCategoryView({
    items: foundItems,
    categoryField: "foundItemCategory",
    // All the item card's information
    buildCard: (item) => `
        <img src="${escapeHTML(item.imageURL)}" alt="${escapeHTML(item.itemTitle)}" class="item-image"/>
        <div>
            <h2>${escapeHTML(item.itemTitle)}</h2>
            <p><label class="item-label">Found Date:</label> ${item.date.toDate().toLocaleDateString()}</p>
            <p><label class="item-label">Location Found:</label> ${escapeHTML(item.foundLocation)}</p>
            <p><label class="item-label">Category:</label> ${escapeHTML(item.foundItemCategory)}</p>
        </div>
    `
});