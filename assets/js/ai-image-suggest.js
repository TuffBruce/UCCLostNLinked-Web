// AI Image Suggestion Feature: when the user picks a photo, Gemini looks at it and
// suggests an item title and category. Used on both the "Report Lost Item" and "Upload Found Item" pages.
import { model } from "./firebase.js";

// Common alternative answers the AI might give, mapped to the values used in our dropdown
const SYNONYMS = {
    "stationery": "stationary",
    "other": "others",
    "shoe": "shoes",
    "bottle": "bottles",
    "clothes": "clothing"
};

// Turn the AI's category answer into a valid dropdown value (falls back to "others")
function normalizeCategory(rawText, categoryInput) {
    let answer = String(rawText).trim().toLowerCase().replace(/[^a-z]/g, "");
    answer = SYNONYMS[answer] || answer;
    const validValues = Array.from(categoryInput.options).map(option => option.value);
    return validValues.includes(answer) ? answer : "others";
}

// Shrink the photo before sending it to the AI (faster and cheaper; phone photos can be 5MB+).
// Returns the image as base64 text, which is the format Gemini accepts.
function resizeImageToBase64(file, maxSize = 1024) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            // "data:image/jpeg;base64,AAAA..." -> keep only the part after the comma
            resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Could not read the image"));
        };
        img.src = url;
    });
}

// Pull the JSON object out of the AI's answer, even if it adds extra text or ```json fences
function parseAIJson(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("AI did not return JSON: " + text);
    }
    return JSON.parse(match[0]);
}

function setupAIImageSuggest(imageInput, titleInput, categoryInput, loadingMessage) {
    imageInput.addEventListener("change", async () => {
        const file = imageInput.files[0];
        // if the user cancelled or picked a non-image file, skip the AI
        if (!file || !file.type.startsWith("image/")) {
            return;
        }

        const prompt = `This is a photo of a lost or found item at a school.
        Reply with ONLY a JSON object in this exact format, with no other text:
        {"title": "<short item title, 2 to 6 words, e.g. Navy blue UCC hoodie>", "category": "<one of: clothing, shoes, bottles, stationary, others>"}
        Include the colour and brand in the title if visible. Do not include any person's name in the title, even if a name is visible on the item.`;

        loadingMessage.classList.remove("hidden"); // show the loading message
        try {
            const base64Image = await resizeImageToBase64(file);
            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
            ]);
            const text = result.response.text();
            console.log("AI image answer:", text); // Testing the feature works in console

            const suggestion = parseAIJson(text);

            // Only fill in the title if the user hasn't typed one already
            if (titleInput.value.trim() === "" && suggestion.title) {
                titleInput.value = suggestion.title;
            }
            if (suggestion.category) {
                categoryInput.value = normalizeCategory(suggestion.category, categoryInput);
            }
        } catch (error) {
            // If the AI fails, the user can still fill in the title and category manually
            console.error("AI image suggestion failed:", error);
        } finally {
            loadingMessage.classList.add("hidden"); // always hide the loading message
        }
    });
}

export { setupAIImageSuggest };