import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBIctvTepNxwnRfg5XOBGjz_2m8EHee9TU",
  authDomain: "managementapp-fd1a2.firebaseapp.com",
  projectId: "managementapp-fd1a2",
  storageBucket: "managementapp-fd1a2.firebasestorage.app",
  messagingSenderId: "999695278146",
  appId: "1:999695278146:android:4ff0ec61371f6a2e298ddb"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
