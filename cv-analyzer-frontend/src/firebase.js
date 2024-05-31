import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPbyTCUl3eJBEsqK2X1pImeuhwu0AX9rg",
  authDomain: "cvanalyzer-5ffc2.firebaseapp.com",
  projectId: "cvanalyzer-5ffc2",
  storageBucket: "cvanalyzer-5ffc2.appspot.com",
  messagingSenderId: "1078241112976",
  appId: "1:1078241112976:web:5cb9e764ab4e58e4583915",
  measurementId: "G-ZGH72P78LY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const showAlert = (message) => {
  window.alert(message);
};

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      showAlert('The sign-in popup was closed before completing the sign-in. Please try again.');
    } else {
      showAlert(`Error during sign-in: ${error.message}`);
    }
    return null;
  }
};

const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    showAlert(`Error during sign-out: ${error.message}`);
  }
};

export { auth, signInWithGoogle, signOut };
