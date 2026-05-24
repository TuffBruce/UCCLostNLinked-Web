// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { getAI, getGenerativeModel, VertexAIBackend } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-ai.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Initialize the Vertex AI Gemini API backend service
const ai = getAI(app, { backend: new VertexAIBackend() });
// Create a `GenerativeModel` instance with a model that supports your use case
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
export { auth, db, storage, model } // Export so another file can import it