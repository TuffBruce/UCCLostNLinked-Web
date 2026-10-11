// Shared AI categorization feature, used by both the "Report Lost Item" and "Upload Found Item" pages.
// When the title input changes, ask Gemini to choose a category, then update the category select input.
import { model } from "./firebase.js";

// Common alternative answers the AI might give, mapped to the values used in our dropdown
const SYNONYMS = {
    "stationery": "stationary",
    "other": "others",
    "shoe": "shoes",
    "bottle": "bottles",
    "clothes": "clothing"
};

// Turn the AI's raw answer (e.g. "Clothing.\n") into a valid dropdown value
function normalizeCategory(rawText, categoryInput) {
    let answer = rawText.trim().toLowerCase().replace(/[^a-z]/g, ""); // remove spaces, punctuation, newlines
    answer = SYNONYMS[answer] || answer;

    // Only accept answers that actually exist as options in the dropdown
    const validValues = Array.from(categoryInput.options).map(option => option.value);
    return validValues.includes(answer) ? answer : "others";
}

function setupAICategory(titleInput, categoryInput, categoryLoadingMessage) {
    titleInput.addEventListener("change", async () => {
        const title = titleInput.value.trim();

        // if the title is empty, skip the ai categorization
        if (title === "") {
            return;
        }

        // Provide a prompt to the AI to determine the category
        const prompt = `Based on the title of the item '${title}', which category does it belong to?
        Answer with exactly one word from this list: clothing, shoes, bottles, stationary, others.
        Use "others" if none of the previous categories apply. Do not include any other text in your answer.`;

        categoryLoadingMessage.classList.remove("hidden"); // show the loading message
        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            console.log("AI answer:", text); // Testing the feature works in console
            categoryInput.value = normalizeCategory(text, categoryInput);
        } catch (error) {
            // If the AI fails, the user can still choose the category manually
            console.error("AI categorization failed:", error);
        } finally {
            categoryLoadingMessage.classList.add("hidden"); // always hide the loading message
        }
    });
}

export { setupAICategory };