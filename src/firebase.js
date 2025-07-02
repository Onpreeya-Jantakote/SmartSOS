import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBY4m8mo7zrRFnrWV99i4ixIw89CkFsSMM",
  authDomain: "smartsos-f1d1e.firebaseapp.com",
  projectId: "smartsos-f1d1e",
  storageBucket: "smartsos-f1d1e.appspot.com",
  messagingSenderId: "559094183580",
  appId: "1:559094183580:web:60d8bc3f979ec5c94cdf59",
  measurementId: "G-1CB2R5VGLW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
