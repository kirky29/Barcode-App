// Firebase configuration
// This file will be used to initialize Firebase services

// Import Firebase modules (when using Firebase SDK)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDduaFPwrppNB77NUJCTcgIXC0eX1TwxX4",
    authDomain: "barcode-app-237a1.firebaseapp.com",
    projectId: "barcode-app-237a1",
    storageBucket: "barcode-app-237a1.firebasestorage.app",
    messagingSenderId: "900380260828",
    appId: "1:900380260828:web:bfed0135ae4629d386b719"
};

// Initialize Firebase
let app;
let db;
let auth;
let storage;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Export Firebase services for use in other modules
export { app, db, auth, storage };
