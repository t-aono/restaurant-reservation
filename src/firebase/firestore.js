import firebase from 'firebase/app'
import 'firebase/app'
import 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: "restaurant-reservation-9956d.firebaseapp.com",
  projectId: "restaurant-reservation-9956d",
  storageBucket: "restaurant-reservation-9956d.appspot.com",
  messagingSenderId: process.env.VUE_APP_MESSAGEING_SEND_ID,
  appId: process.env.VUE_APP_APP_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export default db