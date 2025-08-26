// ===================================================================================
// ORDERS PAGE LOGIC (WITH AUTHENTICATION)
// ===================================================================================
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    app
} from './config.js'; // Assuming config.js exports the initialized firebase app

// Initialize Firebase Services
const db = getFirestore(app);
const auth = getAuth(app);

// --- DOM Element References ---
// Views
const loggedInView = document.getElementById('logged-in-view');
const loggedOutView = document.getElementById('logged-out-view');

// Auth elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authError = document.getElementById('auth-error');
const showLoginTabBtn = document.getElementById('show-login-tab');
const showSignupTabBtn = document.getElementById('show-signup-tab');
const loginFormContainer = document.getElementById('login-form-container');
const signupFormContainer = document.getElementById('signup-form-container');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');

// Order form elements
const orderForm = document.getElementById('order-form');
const currencySelect = document.getElementById('currency-select');
const paymentDetailsETB = document.getElementById('payment-details-ETB');
const paymentDetailsUSD = document.getElementById('payment-details-USD');
const paymentDetailsCNY = document.getElementById('payment-details-CNY');
const transactionInputETB = document.getElementById('transaction-number');
const transactionInputUSD = document.getElementById('transaction-number-usd');
const transactionInputCNY = document.getElementById('transaction-number-cny');
const togglePlatformsBtn = document.getElementById('toggle-platforms-btn');
const platformOptions = document.getElementById('platform-options');
const ordersListContainer = document.getElementById('orders-list');


// --- AUTHENTICATION STATE LOGIC ---
onAuthStateChanged(auth, user => {
    if (user) {
        // User is signed in
        loggedOutView.classList.add('hidden');
        loggedInView.classList.remove('hidden');
        userName.textContent = user.email; // Display user's email
        displayUserOrders(user.uid);
    } else {
        // User is signed out
        loggedInView.classList.add('hidden');
        loggedOutView.classList.remove('hidden');
        if (ordersListContainer) {
            ordersListContainer.innerHTML = ''; // Clear orders list
        }
    }
});


// --- AUTHENTICATION FUNCTIONS ---

/**
 * Switches between the login and signup tabs.
 * @param {string} tabName The name of the tab to show ('login' or 'signup').
 */
function switchTab(tabName) {
    if (tabName === 'login') {
        loginFormContainer.classList.remove('hidden');
        signupFormContainer.classList.add('hidden');
        showLoginTabBtn.classList.add('active');
        showSignupTabBtn.classList.remove('active');
    } else {
        signupFormContainer.classList.remove('hidden');
        loginFormContainer.classList.add('hidden');
        showSignupTabBtn.classList.add('active');
        showLoginTabBtn.classList.remove('active');
    }
    authError.classList.add('hidden'); // Hide any previous errors
}

/**
 * Handles the login form submission.
 * @param {Event} e The form submission event.
 */
function handleLogin(e) {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;
    signInWithEmailAndPassword(auth, email, password)
        .catch(error => showAuthError(error.message));
}

/**
 * Handles the signup form submission.
 * @param {Event} e The form submission event.
 */
function handleSignup(e) {
    e.preventDefault();
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    createUserWithEmailAndPassword(auth, email, password)
        .catch(error => showAuthError(error.message));
}

/**
 * Displays an authentication error message to the user.
 * @param {string} message The error message to display.
 */
function showAuthError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
}


// --- ORDER HANDLING FUNCTIONS ---

/**
 * Handles the submission of the new order form.
 * @param {Event} e The form submission event.
 */
const handleOrderSubmit = async (e) => {
    e.preventDefault();

    const submitButton = orderForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Error: You must be logged in to place an order.');
            throw new Error('User not logged in');
        }

        const currency = currencySelect.value;
        let transactionNumber = '';
        if (currency === 'ETB') transactionNumber = transactionInputETB.value;
        else if (currency === 'USD') transactionNumber = transactionInputUSD.value;
        else if (currency === 'CNY') transactionNumber = transactionInputCNY.value;

        if (!transactionNumber.trim()) {
            alert('Please enter a valid transaction number.');
            throw new Error('Transaction number is required.');
        }

        const orderData = {
            userId: user.uid,
            userEmail: user.email,
            clientName: document.getElementById('client-name').value,
            contactInfo: document.getElementById('contact-info').value,
            serviceType: document.getElementById('service-type').value,
            projectDescription: document.getElementById('project-description').value,
            deliveryTime: document.getElementById('delivery-time').value,
            deliverables: Array.from(document.querySelectorAll('input[name="deliverables"]:checked')).map(cb => cb.value),
            currency: currency,
            totalPrice: parseFloat(document.getElementById('total-price').textContent),
            upfrontPayment: parseFloat(document.getElementById('upfront-payment').textContent),
            transactionNumber: transactionNumber,
            status: 'Pending Review',
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "orders"), orderData);
        alert(`Your order has been submitted successfully!\nYour Order ID is: ${docRef.id}`);
        orderForm.reset();
        document.getElementById('service-type').dispatchEvent(new Event('change'));
        currencySelect.dispatchEvent(new Event('change'));

    } catch (error) {
        console.error("Error submitting order:", error);
        if (error.message !== 'User not logged in' && error.message !== 'Transaction number is required.') {
            alert('An error occurred while submitting your order. Please try again.');
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Order';
    }
};

/**
 * Toggles the visibility of payment details based on the selected currency.
 */
const handleCurrencyChange = () => {
    const selectedCurrency = currencySelect.value;
    paymentDetailsETB.classList.add('hidden');
    paymentDetailsUSD.classList.add('hidden');
    paymentDetailsCNY.classList.add('hidden');
    transactionInputETB.required = false;
    transactionInputUSD.required = false;
    transactionInputCNY.required = false;

    if (selectedCurrency === 'ETB') {
        paymentDetailsETB.classList.remove('hidden');
        transactionInputETB.required = true;
    } else if (selectedCurrency === 'USD') {
        paymentDetailsUSD.classList.remove('hidden');
        transactionInputUSD.required = true;
    } else if (selectedCurrency === 'CNY') {
        paymentDetailsCNY.classList.remove('hidden');
        transactionInputCNY.required = true;
    }
};

/**
 * Fetches and displays the current user's order history in real-time.
 * @param {string} userId The UID of the currently logged-in user.
 */
const displayUserOrders = (userId) => {
    const ordersQuery = query(collection(db, "orders"), where("userId", "==", userId));
    onSnapshot(ordersQuery, (snapshot) => {
        if (!ordersListContainer) return;
        if (snapshot.empty) {
            ordersListContainer.innerHTML = '<p>You have not placed any orders yet.</p>';
            return;
        }

        const sortedDocs = snapshot.docs.sort((a, b) => (b.data().createdAt?.toMillis() || 0) - (a.data().createdAt?.toMillis() || 0));
        let ordersHTML = '';
        sortedDocs.forEach(doc => {
            const order = doc.data();
            const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleDateString() : 'N/A';
            ordersHTML += `
                <div class="order-item">
                    <p><strong>Order ID:</strong> ${doc.id}</p>
                    <p><strong>Service:</strong> ${order.serviceType}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)} ${order.currency}</p>
                    <p><strong>Status:</strong> <span class="status-${order.status.toLowerCase().replace(/ /g, '-')}">${order.status}</span></p>
                </div>
            `;
        });
        ordersListContainer.innerHTML = ordersHTML;
    }, (error) => {
        console.error("Error fetching orders:", error);
        ordersListContainer.innerHTML = '<p class="error-message">Could not load order history.</p>';
    });
};


// --- GLOBAL EVENT LISTENERS ---

// Auth Listeners
if (showLoginTabBtn) showLoginTabBtn.addEventListener('click', () => switchTab('login'));
if (showSignupTabBtn) showSignupTabBtn.addEventListener('click', () => switchTab('signup'));
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (signupForm) signupForm.addEventListener('submit', handleSignup);
if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));

// Order Form Listeners
if (orderForm) orderForm.addEventListener('submit', handleOrderSubmit);
if (currencySelect) {
    currencySelect.addEventListener('change', handleCurrencyChange);
    handleCurrencyChange(); // Initial call
}
if (togglePlatformsBtn) {
    togglePlatformsBtn.addEventListener('click', () => {
        platformOptions.classList.toggle('hidden');
    });
}
