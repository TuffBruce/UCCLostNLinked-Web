// This script is responsible for displaying all the lost items added into Firebase onto the "Lost Items" page,
// organized into category folders (see category-folders.js).
import { db } from "./firebase.js"
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"; // firebase CDN
import { renderCategoryView, escapeHTML } from "./category-folders.js";

// Queries all lost items from firestore
const lostItemsCollection = collection(db, "lostItems");
const snapshot = await getDocs(lostItemsCollection);
// convert the snapshot docs to an array of javascript objects
const lostItems = snapshot.docs.map(doc => doc.data());
// sort the items in descending order by date (newest items first)
// Convert Firestore timestamps to JavaScript Date objects for comparison
lostItems.sort((a, b) => b.date.toDate() - a.date.toDate());

// Show the category folders, or the items in the chosen category
renderCategoryView({
    items: lostItems,
    categoryField: "lostItemCategory",
    // All the item card's information
    buildCard: (item) => `
        <img src="${escapeHTML(item.imageURL)}" alt="${escapeHTML(item.itemTitle)}" class="item-image"/>
        <div>
            <h2>${escapeHTML(item.itemTitle)}</h2>
            <p><label class="item-label">Lost Date:</label> ${item.date.toDate().toLocaleDateString()}</p>
            <p><label class="item-label">Last Known Location:</label> ${escapeHTML(item.lastKnownLocation)}</p>
            <p><label class="item-label">Category:</label> ${escapeHTML(item.lostItemCategory)}</p>
            ${item.distinguishingFeatures ? `<p><label class="item-label">Distinguishing Features:</label> ${escapeHTML(item.distinguishingFeatures)}</p>` : ""}
        </div>
    `
});