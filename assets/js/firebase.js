// The code from this script was a necessary copy-paste from Firebase to link Firebase to my website.

// Import the functions you need from the SDKs you need
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-check.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";
// Import of the Generative AI Model
import { getAI, getGenerativeModel, VertexAIBackend } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-ai.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoAPNE-pkgRIiLa91qPPPC4kDylhW4to0",
  authDomain: "ucclostnlinked.firebaseapp.com",
  projectId: "ucclostnlinked",
  storageBucket: "ucclostnlinked.firebasestorage.app",
  messagingSenderId: "826555702875",
  appId: "1:826555702875:web:b63e77e58df22767bce97e",
  measurementId: "G-3EP8K8RVZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check FIRST, before any other Firebase service (especially AI).
// The AI only looks for App Check once, when it is created.
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider("6Le-KbgtAAAAALf_3EZJ6KzCLMUrocA_z7rLowJ7"),
  isTokenAutoRefreshEnabled: true // Set to true to allow auto-refresh.
});

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Initialize the Vertex AI Gemini API backend service
const ai = getAI(app, { backend: new VertexAIBackend('global') });
// Create a `GenerativeModel` instance with a model that supports your use case
const model = getGenerativeModel(ai, { model: "gemini-3.8-flash" });

export { auth, db, storage, model } // Export so another file can import it