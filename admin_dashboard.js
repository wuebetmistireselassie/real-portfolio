// admin_dashboard.js

import {
    auth,
    onAuthStateChanged,
    signOut,
    db,
    collection,
    query,
    onSnapshot,
    doc,
    updateDoc,
    signInWithEmailAndPassword,
    orderBy,
    getDoc,
} from './auth.js';
import { openChat, sendSystemMessage } from './chat.js';

/**
 * This function waits for the DOM to be fully loaded before initializing the script.
 * This is a standard practice to prevent script errors from trying to access
 * elements that haven't been rendered yet.
 */
(function initWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();

/**
 * Main application initializer.
 * It sets up the core authentication listener that controls the entire UI.
 */
function initializeApp() {
    // --- Configuration ---
    // The unique identifier for the administrator account.
    const ADMIN_UID = 'mL8wfi0Bgvan5yh9yxCthmEDhJc2';

    // --- DOM Element Cache ---
    // Caching elements improves performance by reducing repeated lookups.
    const elements = {
        loginView: document.getElementById('admin-login-view'),
        dashboardView: document.getElementById('admin-dashboard-view'),
        unauthorizedView: document.getElementById('unauthorized-view'),
        loginForm: document.getElementById('admin-login-form'),
        logoutBtn: document.getElementById('admin-logout-btn'),
        ordersList: document.getElementById('all-orders-list'),
        chatsList: document.getElementById('all-chats-list'),
        authError: document.getElementById('admin-auth-error'),
    };

    // --- State Management ---
    // These variables will hold the unsubscribe functions for our Firestore listeners.
    let ordersUnsubscribe = null;
    let chatsUnsubscribe = null;

    /**
     * Stops all active Firestore snapshot listeners.
     * This is crucial to prevent memory leaks and unnecessary data fetching when
     * the user logs out or is no longer authorized to see the data.
     */
    const stopListeners = () => {
        if (ordersUnsubscribe) {
            ordersUnsubscribe();
            ordersUnsubscribe = null;
        }
        if (chatsUnsubscribe) {
            chatsUnsubscribe();
            chatsUnsubscribe = null;
        }
    };

    // --- View Controllers ---
    // These functions ensure only one main view is visible at a time.

    const showDashboard = () => {
        elements.loginView?.classList.add('hidden');
        elements.unauthorizedView?.classList.add('hidden');
        elements.dashboardView?.classList.remove('hidden');
    };

    const showUnauthorized = () => {
        stopListeners(); // Stop listening to data if unauthorized.
        elements.loginView?.classList.add('hidden');
        elements.dashboardView?.classList.add('hidden');
        elements.unauthorizedView?.classList.remove('hidden');
    };

    const showLogin = () => {
        stopListeners(); // Stop listening to data on the login screen.
        elements.dashboardView?.classList.add('hidden');
        elements.unauthorizedView?.classList.add('hidden');
        elements.loginView?.classList.remove('hidden');
    };

    /**
     * --- CORE AUTHENTICATION LOGIC ---
     * This is the single source of truth for the UI. It runs when the page loads
     * and any time the user's login state changes. Because the views are hidden
     * by default in the HTML, this logic correctly decides which view to show
     * without any flickering.
     */
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // A user is signed in. Check if it's the admin.
            if (user.uid === ADMIN_UID) {
                showDashboard();
                // Start fresh listeners for the admin's data.
                stopListeners();
                listenForAllOrders();
                listenForAllChats();
            } else {
                // A non-admin user is signed in. Show access denied.
                showUnauthorized();
            }
        } else {
            // No user is signed in. Show the login form.
            showLogin();
        }
    });

    // --- Event Listener Setup ---

    elements.loginForm?.addEventListener('submit', handleAdminLogin);
    elements.logoutBtn?.addEventListener('click', () => signOut(auth));
    elements.ordersList?.addEventListener('click', handleOrderActionClick);

    /**
     * Handles the admin login form submission.
     * @param {Event} e The form submission event.
     */
    async function handleAdminLogin(e) {
        e.preventDefault();
        elements.authError?.classList.add('hidden');
        const email = elements.loginForm.elements['admin-login-email'].value;
        const password = elements.loginForm.elements['admin-login-password'].value;

        try {
            // Dynamically import persistence functions to avoid modifying auth.js
            const { setPersistence, browserLocalPersistence } = await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js');
            // Ensure the login session is saved locally and persists across browser restarts.
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener will automatically show the dashboard.
        } catch (error) {
            elements.authError.textContent = 'Login failed: Invalid credentials.';
            elements.authError.classList.remove('hidden');
        }
    }

    /**
     * Uses event delegation to handle clicks on action buttons within the orders list.
     * @param {Event} e The click event.
     */
    async function handleOrderActionClick(e) {
        const button = e.target.closest('button');
        if (!button) return; // Exit if the click wasn't on a button.

        const { orderId, userId, userEmail, orderFriendlyId } = button.dataset;

        // --- FIX #3: Contact Client Button ---
        if (button.classList.contains('btn-contact-client')) {
            if (userId && orderId) {
                const chatTitle = `Chat with ${userEmail || 'client'} (Order: ${orderFriendlyId})`;
                openChat(userId, chatTitle);
                // This system message provides the necessary context for the chat.
                sendSystemMessage(userId, `--- Admin started chat regarding Order: ${orderFriendlyId} ---`);
            }
            return;
        }

        // --- FIX #2: Order Status Update ---
        if (button.classList.contains('btn-approve') || button.classList.contains('btn-reject')) {
            if (!orderId) return;

            const isApprove = button.classList.contains('btn-approve');
            const newStatus = isApprove ? 'Paid' : 'Rejected';

            // Disable buttons to prevent multiple clicks.
            button.disabled = true;
            const sibling = isApprove ? button.nextElementSibling : button.previousElementSibling;
            if (sibling) sibling.disabled = true;

            // Optimistic UI Update: Change the UI immediately for a responsive feel.
            const orderItem = button.closest('.order-item');
            if (orderItem) {
                const statusSpan = orderItem.querySelector('.order-status');
                if (statusSpan) {
                    statusSpan.textContent = newStatus;
                    statusSpan.className = `order-status status-${newStatus.toLowerCase().replace(/\s+/g, '-')}`;
                }
                // Remove the action buttons as they are no longer needed.
                orderItem.querySelector('.btn-approve')?.remove();
                orderItem.querySelector('.btn-reject')?.remove();
            }

            // Asynchronously update the database.
            try {
                await updateOrderStatusInFirestore(orderId, newStatus, userId, orderFriendlyId);
            } catch (err) {
                console.error('Failed to update order status in Firestore:', err);
                // Optional: Add UI to inform the admin the update failed.
                // The onSnapshot listener will eventually correct the UI if there's an error.
            }
        }
    }

    /**
     * Updates an order's status in Firestore and notifies the client.
     * @param {string} orderId The Firestore document ID.
     * @param {string} newStatus The new status string ('Paid' or 'Rejected').
     * @param {string} clientUserId The client's UID for notification.
     * @param {string} friendlyOrderId The human-readable order ID.
     */
    async function updateOrderStatusInFirestore(orderId, newStatus, clientUserId, friendlyOrderId) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });

        if (clientUserId) {
            try {
                const message = `Your order (${friendlyOrderId}) has been ${newStatus}.`;
                sendSystemMessage(clientUserId, message);
            } catch (err) {
                console.warn('Status updated, but failed to notify client via chat:', err);
            }
        }
    }

    /**
     * Sets up a real-time listener for the 'orders' collection.
     */
    function listenForAllOrders() {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            elements.ordersList.innerHTML = ''; // Clear previous list.
            if (snapshot.empty) {
                elements.ordersList.innerHTML = '<p>No orders found.</p>';
                return;
            }
            snapshot.forEach(docSnap => {
                elements.ordersList.appendChild(createOrderElement(docSnap));
            });
        }, (error) => {
            console.error('Error listening to orders:', error);
            elements.ordersList.innerHTML = `<p class="error-message">Error loading orders.</p>`;
        });
    }

    /**
     * Creates an HTML element for a single order.
     * @param {object} docSnap The Firestore document snapshot for the order.
     * @returns {HTMLElement} The created div element for the order.
     */
    function createOrderElement(docSnap) {
        const order = docSnap.data() || {};
        const orderId = docSnap.id;
        const friendlyOrderId = order.orderId || orderId;

        const container = document.createElement('div');
        container.className = 'order-item';
        container.dataset.docId = orderId;

        let actionButtons = '';
        if (order.status === 'Pending Confirmation') {
            actionButtons = `
                <button class="btn btn-approve" data-order-id="${orderId}" data-user-id="${order.userId || ''}" data-order-friendly-id="${friendlyOrderId}">Approve</button>
                <button class="btn btn-reject" data-order-id="${orderId}" data-user-id="${order.userId || ''}" data-order-friendly-id="${friendlyOrderId}">Reject</button>
            `;
        }
        // Add the contact button with all necessary data attributes.
        actionButtons += `
            <button class="btn btn-contact-client"
                data-user-id="${order.userId || ''}"
                data-user-email="${order.email || ''}"
                data-order-id="${orderId}"
                data-order-friendly-id="${friendlyOrderId}">
                Contact Client
            </button>
        `;

        const statusClass = String(order.status || '').toLowerCase().replace(/\s+/g, '-');
        container.innerHTML = `
            <h4>Order ID: ${friendlyOrderId}</h4>
            <p><strong>Client:</strong> ${order.clientName || ''} (${order.email || ''})</p>
            <p><strong>Status:</strong> <span class="order-status status-${statusClass}">${order.status || '—'}</span></p>
            <p><strong>Description:</strong> ${order.projectDescription || ''}</p>
            <div class="order-actions">${actionButtons}</div>
            <hr>
        `;
        return container;
    }

    /**
     * Sets up a real-time listener for all chat conversations.
     */
    function listenForAllChats() {
        const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
        chatsUnsubscribe = onSnapshot(q, (snapshot) => {
            elements.chatsList.innerHTML = ''; // Clear previous list.
            if (snapshot.empty) {
                elements.chatsList.innerHTML = '<p>No active chats.</p>';
                return;
            }
            snapshot.forEach(docSnap => {
                const chat = docSnap.data() || {};
                if (chat.userId && chat.userEmail) {
                    const chatElement = document.createElement('div');
                    chatElement.className = 'chat-list-item';
                    chatElement.innerHTML = `<p><strong>${chat.userEmail}</strong></p>`;
                    chatElement.addEventListener('click', () => openChat(chat.userId, `Chat with ${chat.userEmail}`));
                    elements.chatsList.appendChild(chatElement);
                }
            });
        }, (error) => {
            console.error('Error listening to chats:', error);
            elements.chatsList.innerHTML = `<p class="error-message">Error loading chats.</p>`;
        });
    }
}
