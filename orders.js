// ===================================================================================
// ORDERS PAGE LOGIC
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
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    app
} from './config.js'; // Assuming config.js exports the initialized firebase app

// Initialize Firebase Services
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Element References
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

/**
 * Handles the submission of the new order form.
 * @param {Event} e The form submission event.
 */
const handleOrderSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page

    const submitButton = orderForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Error: You must be logged in to place an order.');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Order';
            return;
        }

        // --- 1. GATHER FORM DATA ---
        const currency = currencySelect.value;
        let transactionNumber = '';

        // Get the correct transaction number based on the selected currency
        if (currency === 'ETB') {
            transactionNumber = transactionInputETB.value;
        } else if (currency === 'USD') {
            transactionNumber = transactionInputUSD.value;
        } else if (currency === 'CNY') {
            transactionNumber = transactionInputCNY.value;
        }

        // Simple validation
        if (!transactionNumber.trim()) {
            alert('Please enter a valid transaction number.');
            throw new Error('Transaction number is required.');
        }

        // Collect all other form data
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
            status: 'Pending Review', // Set the initial status for a new order
            createdAt: serverTimestamp() // Use server's timestamp for consistency
        };

        // --- 2. SAVE TO FIRESTORE ---
        const ordersCollection = collection(db, "orders");
        const docRef = await addDoc(ordersCollection, orderData);

        // --- 3. PROVIDE FEEDBACK ---
        alert(`Your order has been submitted successfully!\nYour Order ID is: ${docRef.id}`);
        orderForm.reset();

        // Manually trigger change events to reset dependent fields (deliverables and price)
        document.getElementById('service-type').dispatchEvent(new Event('change'));
        currencySelect.dispatchEvent(new Event('change'));


    } catch (error) {
        console.error("Error submitting order:", error);
        alert('An error occurred while submitting your order. Please check the console and try again.');
    } finally {
        // Re-enable the submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Order';
    }
};

/**
 * Toggles the visibility of payment details based on the selected currency.
 */
const handleCurrencyChange = () => {
    const selectedCurrency = currencySelect.value;

    // Hide all payment sections first
    paymentDetailsETB.classList.add('hidden');
    paymentDetailsUSD.classList.add('hidden');
    paymentDetailsCNY.classList.add('hidden');

    // Make all transaction inputs not required
    transactionInputETB.required = false;
    transactionInputUSD.required = false;
    transactionInputCNY.required = false;

    // Show the correct section and make its transaction input required
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
        if (snapshot.empty) {
            ordersListContainer.innerHTML = '<p>You have not placed any orders yet.</p>';
            return;
        }

        let ordersHTML = '';
        // Sort documents by creation date, newest first
        const sortedDocs = snapshot.docs.sort((a, b) => {
            const timeA = a.data().createdAt?.toMillis() || 0;
            const timeB = b.data().createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

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


// --- EVENT LISTENERS ---

// Listen for authentication state changes to show user orders
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserOrders(user.uid);
    } else {
        // Clear orders if user logs out
        if(ordersListContainer) {
            ordersListContainer.innerHTML = '';
        }
    }
});

// Attach the submit handler to the form
if (orderForm) {
    orderForm.addEventListener('submit', handleOrderSubmit);
}

// Attach the currency change handler
if (currencySelect) {
    currencySelect.addEventListener('change', handleCurrencyChange);
    // Call it once on load to set the initial state
    handleCurrencyChange();
}

// Attach listener for the platform toggle button
if (togglePlatformsBtn) {
    togglePlatformsBtn.addEventListener('click', () => {
        platformOptions.classList.toggle('hidden');
    });
}
