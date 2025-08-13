// --- FIREBASE CONFIGURATION ---
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
signupSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => authModal.classList.add('hidden'))
        .catch(error => authError.textContent = error.message);
});

loginSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => authModal.classList.add('hidden'))
        .catch(error => authError.textContent = error.message);
});

logoutButton.addEventListener('click', () => auth.signOut());

auth.onAuthStateChanged(user => {
    if (user) {
        loginButton.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userEmailSpan.textContent = user.email;
    } else {
        loginButton.classList.remove('hidden');
        userInfo.classList.add('hidden');
        userEmailSpan.textContent = '';
    }
});

// --- DROPLET ANIMATION RANDOMIZER ---
document.querySelectorAll('.droplet').forEach(droplet => {
    const size = Math.random() * 15 + 5;
    const delay = Math.random() * -20;
    const duration = Math.random() * 10 + 10;
    const position = Math.random() * 98;
    droplet.style.width = `${size}px`;
    droplet.style.height = `${size}px`;
    droplet.style.left = `${position}vw`;
    droplet.style.animationDelay = `${delay}s`;
    droplet.style.animationDuration = `${duration}s`;
});
