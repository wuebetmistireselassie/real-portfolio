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
 * Self-invoking function to initialize the dashboard script
 * once the DOM is fully loaded and parsed.
 */
(function initWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/**
 * Main initialization function for the admin dashboard.
 * Sets up authentication, listeners, and event handlers.
 */
function init() {
    // --- Configuration ---
    // This should ideally be stored in a secure backend configuration,
    // but is kept here to match the original structure.
    const ADMIN_UID = 'mL8wfi0Bgvan5yh9yxCthmEDhJc2';

    // --- DOM Elements ---
    const adminLoginView = document.getElementById('admin-login-view');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    const unauthorizedView = document.getElementById('unauthorized-view');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const allOrdersList = document.getElementById('all-orders-list');
    const allChatsList = document.getElementById('all-chats-list');
    const adminAuthError = document.getElementById('admin-auth-error');

    // --- State ---
    let chatsUnsubscribe = null;
    let ordersUnsubscribe = null;

    // --- View Management ---

    /**
     * Hides all main views to prevent content flashing on load.
     * Call this before the authentication check.
     */
    const hideAllViews = () => {
        adminLoginView?.classList.add('hidden');
        adminDashboardView?.classList.add('hidden');
        unauthorizedView?.classList.add('hidden');
    };

    /**
     * Displays the admin dashboard view and hides others.
     */
    const showDashboard = () => {
        hideAllViews();
        adminDashboardView?.classList.remove('hidden');
    };

    /**
     * Displays the unauthorized access view and stops data listeners.
     */
    const showUnauthorized = () => {
        stopListeners();
        hideAllViews();
        unauthorizedView?.classList.remove('hidden');
    };

    /**
     * Displays the login form and stops data listeners.
     */
    const showLogin = () => {
        stopListeners();
        hideAllViews();
        adminLoginView?.classList.remove('hidden');
    };

    // --- Helpers ---

    /**
     * Stops all active Firestore snapshot listeners.
     * Essential for preventing memory leaks and unnecessary reads on logout or auth changes.
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

    /**
     * Formats a numeric value into a currency string.
     * @param {number|string} value The numeric value.
     * @param {string} currency The currency code (e.g., 'USD').
     * @returns {string} The formatted currency string.
     */
    const toMoney = (value, currency) => {
        const n = Number(value);
        if (Number.isFinite(n)) return `${n.toFixed(2)} ${currency || ''}`.trim();
        return value != null ? String(value) : '';
    };

    // --- Authentication ---

    /**
     * FIX #1: Admin Login Issue
     * The onAuthStateChanged listener is the single source of truth for the UI.
     * It now runs immediately, hiding all views first to prevent the login form
     * from flashing for an already signed-in admin. It then determines the correct
     * view to show based on the user's authentication state and UID.
     */
    onAuthStateChanged(auth, (user) => {
        // Stop any existing listeners before proceeding.
        stopListeners();

        if (user) {
            if (user.uid === ADMIN_UID) {
                showDashboard();
                // Start fresh listeners for the authenticated admin.
                listenForAllOrders();
                listenForAllChats();
            } else {
                // If a non-admin user is somehow signed in, show unauthorized.
                showUnauthorized();
                signOut(auth); // Also sign them out for security.
            }
        } else {
            // If no user is signed in, show the login form.
            showLogin();
        }
    });

    // Event handler for the admin login form.
    adminLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminAuthError?.classList.add('hidden');

        const email = document.getElementById('admin-login-email')?.value || '';
        const password = document.getElementById('admin-login-password')?.value || '';

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener will handle showing the dashboard.
            // However, we can add an explicit check here for non-admin credentials.
            if (userCredential.user?.uid !== ADMIN_UID) {
                await signOut(auth); // Sign out the unauthorized user.
                showUnauthorized(); // Explicitly show the unauthorized view.
            }
        } catch (error) {
            if (adminAuthError) {
                adminAuthError.textContent = 'Login failed: ' + (error?.message || String(error));
                adminAuthError.classList.remove('hidden');
            }
        }
    });

    // Event handler for the admin logout button.
    adminLogoutBtn?.addEventListener('click', async () => {
        await signOut(auth);
        // onAuthStateChanged will automatically handle showing the login page.
    });

    // --- Orders: Live Display ---

    /**
     * Sets up a real-time listener for the 'orders' collection and renders the list.
     */
    function listenForAllOrders() {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        ordersUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!allOrdersList) return;
                allOrdersList.innerHTML = ''; // Clear previous list.
                if (snapshot.empty) {
                    allOrdersList.innerHTML = '<p>No orders found.</p>';
                    return;
                }

                snapshot.forEach((docSnap) => {
                    const order = docSnap.data() || {};
                    const orderId = docSnap.id;
                    const friendlyOrderId = order.orderId || orderId;

                    const container = document.createElement('div');
                    container.className = 'order-item';
                    container.dataset.docId = orderId;

                    // Generate action buttons based on order status.
                    let actionButtons = '';
                    if (order.status === 'Pending Confirmation') {
                        actionButtons = `
                            <button class="btn btn-approve" data-order-id="${orderId}" data-user-id="${order.userId || ''}">Approve</button>
                            <button class="btn btn-reject" data-order-id="${orderId}" data-user-id="${order.userId || ''}">Reject</button>
                        `;
                    }

                    /**
                     * FIX #3 Part 1: Contact Client Button Context
                     * Added `data-order-id` and `data-order-friendly-id` to the button.
                     * This makes the order's context available in the click event handler,
                     * allowing us to send a system message with the specific order ID.
                     */
                    actionButtons += `
                        <button class="btn btn-contact-client"
                            data-user-id="${order.userId || ''}"
                            data-user-email="${order.email || ''}"
                            data-order-id="${orderId}"
                            data-order-friendly-id="${friendlyOrderId}">
                            Contact Client
                        </button>
                    `;

                    // Sanitize and format order data for display.
                    const deliverables = Array.isArray(order.deliverables) ? order.deliverables.join(', ') : (order.deliverables || '');
                    const totalPrice = toMoney(order.totalPrice, order.currency);
                    const upfrontPayment = toMoney(order.upfrontPayment, order.currency);
                    const statusClass = String(order.status || '').toLowerCase().replace(/\s+/g, '-');

                    container.innerHTML = `
                        <h4>Order ID: ${friendlyOrderId}</h4>
                        <p><strong>Client:</strong> ${order.clientName || ''} (${order.email || ''})</p>
                        <p><strong>Contact:</strong> ${order.contactInfo || ''}</p>
                        <p><strong>Service:</strong> ${order.serviceType || ''}</p>
                        <p><strong>Deliverables:</strong> ${deliverables}</p>
                        <p><strong>Total Price:</strong> ${totalPrice}</p>
                        <p><strong>Upfront Payment:</strong> ${upfrontPayment}</p>
                        <p><strong>Transaction ID:</strong> ${order.transactionNumber || ''}</p>
                        <p><strong>Status:</strong> <span class="order-status status-${statusClass}">${order.status || '—'}</span></p>
                        <p><strong>Description:</strong> ${order.projectDescription || ''}</p>
                        <div class="order-actions">${actionButtons}</div>
                        <hr>
                    `;

                    allOrdersList.appendChild(container);
                });
            },
            (error) => {
                console.error('Error listening to orders:', error);
                allOrdersList.innerHTML = `<p class="error-message">Error loading orders.</p>`;
            }
        );
    }

    // --- Orders: Actions ---

    /**
     * Uses event delegation to handle clicks on action buttons within the orders list.
     */
    allOrdersList?.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const { userId, userEmail, orderId, orderFriendlyId } = button.dataset;

        /**
         * FIX #3 Part 2: Contact Client Button Action
         * When the "Contact Client" button is clicked, it now opens the chat AND
         * sends a system message to provide the specific order context, creating
         * a chat thread tied to that order.
         */
        if (button.classList.contains('btn-contact-client')) {
            if (userId && orderId) {
                const chatTitle = `Chat with ${userEmail || 'client'} (Order: ${orderFriendlyId})`;
                openChat(userId, chatTitle);
                // Send a system message to establish context in the chat history.
                sendSystemMessage(userId, `--- Admin started a chat regarding Order ID: ${orderFriendlyId} ---`);
            }
            return;
        }

        // Handle Approve/Reject actions.
        if (button.classList.contains('btn-approve') || button.classList.contains('btn-reject')) {
            if (!orderId) return;

            const isApprove = button.classList.contains('btn-approve');
            const newStatus = isApprove ? 'Paid' : 'Rejected';

            // Disable buttons to prevent double-clicks.
            button.disabled = true;
            const sibling = isApprove ? button.nextElementSibling : button.previousElementSibling;
            if (sibling) sibling.disabled = true;

            /**
             * FIX #2: Order Status Not Updating
             * This is an "optimistic UI update." We immediately update the interface
             * to reflect the change, providing instant feedback to the admin. The buttons
             * are removed, and the status text is updated. The subsequent database call
             * will persist this change, and the onSnapshot listener will confirm it.
             */
            const orderItem = button.closest('.order-item');
            if (orderItem) {
                const statusSpan = orderItem.querySelector('.order-status');
                if (statusSpan) {
                    statusSpan.textContent = newStatus;
                    statusSpan.className = `order-status status-${newStatus.toLowerCase().replace(/\s+/g, '-')}`;
                }
                // Remove the action buttons immediately for better UX.
                const approveBtn = orderItem.querySelector('.btn-approve');
                const rejectBtn = orderItem.querySelector('.btn-reject');
                approveBtn?.remove();
                rejectBtn?.remove();
            }

            try {
                // Persist the change to Firestore.
                await updateOrderStatus(orderId, newStatus, userId, orderFriendlyId);
            } catch (err) {
                console.error('Failed to update order status:', err);
                // Optional: Add UI to inform the admin the update failed.
                // For now, the onSnapshot listener will eventually correct the UI.
            }
        }
    });

    /**
     * Updates an order's status in Firestore and notifies the client via system message.
     * @param {string} orderId The Firestore document ID of the order.
     * @param {string} newStatus The new status string (e.g., 'Paid', 'Rejected').
     * @param {string} clientUserId The UID of the client to notify.
     * @param {string} friendlyOrderId The human-readable order ID for the notification.
     */
    async function updateOrderStatus(orderId, newStatus, clientUserId, friendlyOrderId) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });

        // If the client's user ID is known, send them a system message in chat.
        if (clientUserId) {
            try {
                const message = `Your order (${friendlyOrderId}) has been ${newStatus}.`;
                sendSystemMessage(clientUserId, message);
            } catch (err) {
                console.warn('Status updated, but failed to notify client via chat:', err);
            }
        }
    }

    // --- Chats: Live Display ---

    /**
     * Sets up a real-time listener for all conversations to display in the chat list.
     */
    function listenForAllChats() {
        const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
        chatsUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!allChatsList) return;
                allChatsList.innerHTML = ''; // Clear previous list.
                if (snapshot.empty) {
                    allChatsList.innerHTML = '<p>No active chats.</p>';
                    return;
                }

                snapshot.forEach((docSnap) => {
                    const chat = docSnap.data() || {};
                    if (chat.userId && chat.userEmail) {
                        const chatElement = document.createElement('div');
                        chatElement.className = 'chat-list-item';
                        chatElement.dataset.userId = chat.userId;
                        chatElement.dataset.userEmail = chat.userEmail;

                        let lastUpdatedText = 'N/A';
                        try {
                            const ts = chat.lastUpdate;
                            const date = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
                            if (date && !isNaN(date.getTime())) {
                                lastUpdatedText = date.toLocaleString();
                            }
                        } catch { /* noop */ }

                        chatElement.innerHTML = `
                            <p><strong>${chat.userEmail}</strong></p>
                            <p>Last update: ${lastUpdatedText}</p>
                        `;

                        // Add click listener to open the corresponding chat.
                        chatElement.addEventListener('click', () => {
                            openChat(chat.userId, `Chat with ${chat.userEmail}`);
                        });

                        allChatsList.appendChild(chatElement);
                    }
                });
            },
            (error) => {
                console.error('Error listening to chats:', error);
                allChatsList.innerHTML = `<p class="error-message">Error loading chats. You may need to create a Firestore index.</p>`;
            }
        );
    }
}
