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

// Form References
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');

// Link References
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginLink = document.getElementById('back-to-login');

// Button References
const signupSubmitButton = document.getElementById('signup-submit-button');
const loginSubmitButton = document.getElementById('login-submit-button');
const resetPasswordButton = document.getElementById('reset-password-button');

// Message/Error Display
const authMessage = document.getElementById('auth-message');

// --- MODAL & FORM VISIBILITY ---
function showForm(formToShow) {
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    forgotPasswordForm.classList.add('hidden');
    formToShow.classList.remove('hidden');
    authMessage.textContent = ''; // Clear any previous messages
    authMessage.className = 'message'; // Reset message style
}

loginButton.addEventListener('click', () => {
    authModal.classList.remove('hidden');
    showForm(loginForm);
});

closeModalButton.addEventListener('click', () => authModal.classList.add('hidden'));
showSignupLink.addEventListener('click', (e) => { e.preventDefault(); showForm(signupForm); });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showForm(loginForm); });
forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showForm(forgotPasswordForm); });
backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showForm(loginForm); });

// --- AUTHENTICATION LOGIC ---

// Sign up new users
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

// Sign in existing users
loginSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => authModal.classList.add('hidden'))
        .catch(error => {
            authMessage.className = 'message error';
            // Custom error message as requested
            if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                authMessage.textContent = 'Wrong credentials. Please try again.';
            } else {
                authMessage.textContent = error.message;
            }
        });
});

// Password Reset
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


// Sign out
logoutButton.addEventListener('click', () => auth.signOut());

// Listen for authentication state changes
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
