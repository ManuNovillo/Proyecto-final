import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCp7JtJcIPhTHt_-voIspE7bthZ9kgAlg0",
  authDomain: "proyecto-final-8cb0e.firebaseapp.com",
  projectId: "proyecto-final-8cb0e",
  storageBucket: "proyecto-final-8cb0e.firebasestorage.app",
  messagingSenderId: "1886860957",
  appId: "1:1886860957:web:a4f9653c20ce9dfb428674",
  measurementId: "G-7783HR2YCH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const input = document.querySelector('input[type=file]');

function changeFile() {
  const file = input.files[0];
}

input.addEventListener('change', changeFile);
