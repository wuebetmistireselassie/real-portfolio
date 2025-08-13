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
const ctaLoginButton = document.getElementById('cta-login-button');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');

const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginLink = document.getElementById('back-to-login');

const signupSubmitButton = document.getElementById('signup-submit-button');
const loginSubmitButton = document.getElementById('login-submit-button');
const resetPasswordButton = document.getElementById('reset-password-button');

const authMessage = document.getElementById('auth-message');
const protectedContent = document.querySelectorAll('.protected-content');
const guestCTA = document.getElementById('guest-cta');

// --- STATE VARIABLE ---
let portfolioHasBeenBuilt = false;

// --- MODAL & FORM VISIBILITY ---
function showForm(formToShow) {
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    forgotPasswordForm.classList.add('hidden');
    formToShow.classList.remove('hidden');
    authMessage.textContent = '';
    authMessage.className = 'message';
}

function openAuthModal() {
    authModal.classList.remove('hidden');
    showForm(loginForm);
}

loginButton.addEventListener('click', openAuthModal);
if (ctaLoginButton) {
    ctaLoginButton.addEventListener('click', openAuthModal);
}
closeModalButton.addEventListener('click', () => authModal.classList.add('hidden'));

showSignupLink.addEventListener('click', (e) => { e.preventDefault(); showForm(signupForm); });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showForm(loginForm); });
forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showForm(forgotPasswordForm); });
backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showForm(loginForm); });

// --- AUTHENTICATION LOGIC ---
signupSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => authModal.classList.add('hidden'))
        .catch(error => {
            authMessage.className = 'message error';
            authMessage.textContent = error.message;
        });
});

loginSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => authModal.classList.add('hidden'))
        .catch(error => {
            authMessage.className = 'message error';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                authMessage.textContent = 'Wrong credentials. Please try again.';
            } else {
                authMessage.textContent = error.message;
            }
        });
});

resetPasswordButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    auth.sendPasswordResetEmail(email)
        .then(() => {
            authMessage.className = 'message success';
            authMessage.textContent = 'Password reset email sent! Please check your inbox.';
        })
        .catch((error) => {
            authMessage.className = 'message error';
            authMessage.textContent = error.message;
        });
});

logoutButton.addEventListener('click', () => auth.signOut());

// --- AUTH STATE LISTENER ---
auth.onAuthStateChanged(user => {
    if (user) {
        // LOGGED IN
        loginButton.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userEmailSpan.textContent = user.email;

        if (guestCTA) guestCTA.classList.add('hidden');
        protectedContent.forEach(element => element.classList.remove('hidden'));

        if (!portfolioHasBeenBuilt) {
            buildPortfolio();
            portfolioHasBeenBuilt = true;
        }
    } else {
        // LOGGED OUT
        loginButton.classList.remove('hidden');
        userInfo.classList.add('hidden');
        userEmailSpan.textContent = '';

        if (guestCTA) guestCTA.classList.remove('hidden');
        protectedContent.forEach(element => element.classList.add('hidden'));

        // Wait for projects.js to load, then build guest portfolio
        setTimeout(buildGuestPortfolio, 200);
    }
});
