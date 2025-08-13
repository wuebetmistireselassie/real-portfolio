// --- FIREBASE CONFIGURATION ---
// These are your unique project keys.
const firebaseConfig = {
  apiKey: "AIzaSyBBChrO3wq3ax-cbSPZGEFEqePFWlubowg",
  authDomain: "mwcreatives-3fd8b.firebaseapp.com",
  projectId: "mwcreatives-3fd8b",
  storageBucket: "mwcreatives-3fd8b.appspot.com",
  messagingSenderId: "56482314427",
  appId: "1:56482314427:web:3e4d5fc7d53dcf1045d19e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// --- DOM ELEMENT REFERENCES ---
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userInfo = document.getElementById('user-info');
const userEmailSpan = document.getElementById('user-email');
const authModal = document.getElementById('auth-modal');
const closeModalButton = document.querySelector('.close-button');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const signupSubmitButton = document.getElementById('signup-submit-button');
const loginSubmitButton = document.getElementById('login-submit-button');
const authError = document.getElementById('auth-error');

// --- MODAL VISIBILITY ---
loginButton.addEventListener('click', () => {
    authModal.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    authError.textContent = '';
});

closeModalButton.addEventListener('click', () => {
    authModal.classList.add('hidden');
});

showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    authError.textContent = '';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    authError.textContent = '';
});

// --- AUTHENTICATION LOGIC ---

// Sign up new users
signupSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed up:', userCredential.user);
            authModal.classList.add('hidden');
        })
        .catch((error) => {
            authError.textContent = error.message;
        });
});

// Sign in existing users
loginSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed in:', userCredential.user);
            authModal.classList.add('hidden');
        })
        .catch((error) => {
            authError.textContent = error.message;
        });
});

// Sign out
logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('User signed out');
    });
});

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        loginButton.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userEmailSpan.textContent = user.email;
    } else {
        // User is signed out
        loginButton.classList.remove('hidden');
        userInfo.classList.add('hidden');
        userEmailSpan.textContent = '';
    }
});
