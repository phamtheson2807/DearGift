// Firebase Configuration for DearGift
// Using actual config from the project

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsQzklj9EplxSPFltI3kRVjzIu8DILwko",
    authDomain: "deargift-f780b.firebaseapp.com",
    projectId: "deargift-f780b",
    storageBucket: "deargift-f780b.appspot.com",
    messagingSenderId: "329430119253",
    appId: "1:329430119253:web:71a099c215370092eeb5dc",
    measurementId: "G-NSJHP66HKW"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    
    // Get Firebase services
    window.db = firebase.firestore();
    window.storage = firebase.storage();
    
    console.log('Firebase initialized successfully');
} else {
    console.warn('Firebase not loaded');
}

// Firestore settings for better performance
if (window.db) {
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    
    // Enable offline persistence
    db.enablePersistence().catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Persistence failed: Multiple tabs open');
        } else if (err.code == 'unimplemented') {
            console.log('Persistence not available');
        }
    });
}
