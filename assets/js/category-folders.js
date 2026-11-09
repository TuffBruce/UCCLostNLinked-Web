// This script adds category "folders" to the Lost Items and Found Items pages.
// With no category chosen, it shows one folder per category (with how many items are inside).
// Clicking a folder opens the same page with ?category=... in the address, showing only that type of item.

// The categories, matching the values used in the upload/report forms
const CATEGORIES = [
    { value: "clothing", label: "Clothing"},
    { value: "shoes", label: "Shoes"},
    { value: "bottles", label: "Bottles"},
    { value: "stationary", label: "Stationery"},
    { value: "others", label: "Others"}
];

// Make sure user-typed text (titles, locations) is shown as plain text, never run as HTML code
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

// Put each item's category into one of our folders (older or unusual values go into "others")
function normalizeCategory(value) {
    const cleaned = String(value ?? "").trim().toLowerCase();
    return CATEGORIES.some(c => c.value === cleaned) ? cleaned : "others";
}

// items: the list of items from Firestore
// categoryField: the name of the category field ("lostItemCategory" or "foundItemCategory")
// buildCard: a function that turns one item into the HTML for its card
function renderCategoryView({ items, categoryField, buildCard }) {
    const container = document.getElementById("items-container");

    // Read the chosen category from the address bar, e.g. lostitems.html?category=clothing
    const selectedValue = new URLSearchParams(window.location.search).get("category");
    const selectedCategory = CATEGORIES.find(c => c.value === selectedValue);

    // FOLDER VIEW: no category chosen yet, so show the folders
    if (!selectedCategory) {
        const folders = document.createElement("div");
        folders.classList.add("dashboard-nav-buttons"); // reuse the dashboard button layout

        CATEGORIES.forEach(category => {
            const count = items.filter(item => normalizeCategory(item[categoryField]) === category.value).length;

            const folder = document.createElement("a");
            folder.href = "?category=" + category.value;
            folder.classList.add("dashboard-btn"); // reuse the dashboard button style
            folder.innerHTML = `
                <span class="text-centered">
                    ${category.label}<br>
                    <small>${count} item${count === 1 ? "" : "s"}</small>
                </span>
            `;
            folders.appendChild(folder);
        });

        container.before(folders);
        return;
    }

    // ITEM VIEW: a category was chosen, so show a back button and only that category's items
    const header = document.createElement("div");
    header.classList.add("content", "text-centered");
    header.innerHTML = `
        <a href="?" class="small-btn" style="color:black; text-decoration:none;">← All categories</a>
        <h2>${selectedCategory.label}</h2>
    `;
    container.before(header);

    const filteredItems = items.filter(item => normalizeCategory(item[categoryField]) === selectedCategory.value);

    if (filteredItems.length === 0) {
        header.insertAdjacentHTML("beforeend", "<p>No items in this category yet.</p>");
        return;
    }

    filteredItems.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("item-card");
        itemElement.innerHTML = buildCard(item);
        container.appendChild(itemElement);
    });
}

export { renderCategoryView, escapeHTML };