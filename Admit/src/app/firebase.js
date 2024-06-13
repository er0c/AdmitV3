import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCR3fAUjBGtUE6SSuQA2bj32ZM7JF-ueGY",
  authDomain: "admit-87fa6.firebaseapp.com",
  projectId: "admit-87fa6",
  storageBucket: "admit-87fa6.appspot.com",
  messagingSenderId: "1030044357241",
  appId: "1:1030044357241:web:3eff54fb13fb3c843abaa8",
  measurementId: "G-MSL01SQGP5"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };

async function fetchGoalsFromFirestore() {
  try {
    const user = auth.currentUser;

    // Ensure user is not null before accessing its properties
    if (!user) {
      console.error("User is not authenticated.");
      return []; // Return an empty array indicating failure
    }

    const querySnapshot = await getDocs(collection(db, "users", user.email ,"goals"));
    const goals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return goals;
  } catch (error) {
    console.error("Error fetching goals from Firestore: ", error);
    return [];
  }
}

export default fetchGoalsFromFirestore;