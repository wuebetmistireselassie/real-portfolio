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

    /**
     * --- DEFINITIVE FIX for Blank Screen ---
     * This robust view controller directly manipulates the `display` style property.
     * This bypasses any potential conflicts with CSS classes like '.hidden' and
     * guarantees that the correct view is shown without fail.
     * @param {string | null} viewId The ID of the element to make visible.
     */
    const setVisibleView = (viewId) => {
        const views = [elements.loginView, elements.dashboardView, elements.unauthorizedView];
        views.forEach(view => {
            if (view) {
                // Hide all views by default.
                view.style.display = 'none';
            }
        });

        // Show only the requested view.
        if (viewId) {
            const viewToShow = document.getElementById(viewId);
            if (viewToShow) {
                viewToShow.style.display = 'block'; // 'block' is a safe default for sections.
            }
        }
    };

    // Hide all views as soon as the script loads to prevent any content flash.
    setVisibleView(null);

    /**
     * --- CORE AUTHENTICATION LOGIC ---
     * This is the single source of truth for the UI. It runs when the page loads
     * and any time the user's login state changes. It now uses the robust
     * setVisibleView function to guarantee the correct UI is displayed.
     */
    onAuthStateChanged(auth, (user) => {
        stopListeners(); // Always stop old listeners on auth change.
        if (user) {
            // A user is signed in. Check if it's the admin.
            if (user.uid === ADMIN_UID) {
                setVisibleView('admin-dashboard-view');
                // Start fresh listeners for the admin's data.
                listenForAllOrders();
                listenForAllChats();
            } else {
                // A non-admin user is signed in. Show access denied.
                setVisibleView('unauthorized-view');
            }
        } else {
            // No user is signed in. Show the login form.
            setVisibleView('admin-login-view');
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
            const { setPersistence, browserLocalPersistence } = await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js');
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, password);
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
        if (!button) return;

        const { orderId, userId, userEmail, orderFriendlyId } = button.dataset;

        if (button.classList.contains('btn-contact-client')) {
            if (userId && orderId) {
                const chatTitle = `Chat with ${userEmail || 'client'} (Order: ${orderFriendlyId})`;
                openChat(userId, chatTitle);
                sendSystemMessage(userId, `--- Admin started chat regarding Order: ${orderFriendlyId} ---`);
            }
            return;
        }

        if (button.classList.contains('btn-approve') || button.classList.contains('btn-reject')) {
            if (!orderId) return;
            const newStatus = button.classList.contains('btn-approve') ? 'Paid' : 'Rejected';
            button.disabled = true;
            const sibling = button.nextElementSibling || button.previousElementSibling;
            if (sibling) sibling.disabled = true;

            const orderItem = button.closest('.order-item');
            if (orderItem) {
                const statusSpan = orderItem.querySelector('.order-status');
                if (statusSpan) {
                    statusSpan.textContent = newStatus;
                }
                orderItem.querySelector('.btn-approve')?.remove();
                orderItem.querySelector('.btn-reject')?.remove();
            }
            await updateOrderStatusInFirestore(orderId, newStatus, userId, orderFriendlyId);
        }
    }

    /**
     * Updates an order's status in Firestore and notifies the client.
     */
    async function updateOrderStatusInFirestore(orderId, newStatus, clientUserId, friendlyOrderId) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });
        if (clientUserId) {
            sendSystemMessage(clientUserId, `Your order (${friendlyOrderId}) has been ${newStatus}.`);
        }
    }

    /**
     * Sets up a real-time listener for the 'orders' collection.
     */
    function listenForAllOrders() {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            elements.ordersList.innerHTML = '';
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
     */
    function createOrderElement(docSnap) {
        const order = docSnap.data() || {};
        const orderId = docSnap.id;
        const friendlyOrderId = order.orderId || orderId;
        const container = document.createElement('div');
        container.className = 'order-item';

        let actionButtons = '';
        if (order.status === 'Pending Confirmation') {
            actionButtons = `
                <button class="btn btn-approve" data-order-id="${orderId}" data-user-id="${order.userId}" data-order-friendly-id="${friendlyOrderId}">Approve</button>
                <button class="btn btn-reject" data-order-id="${orderId}" data-user-id="${order.userId}" data-order-friendly-id="${friendlyOrderId}">Reject</button>
            `;
        }
        actionButtons += `
            <button class="btn btn-contact-client"
                data-user-id="${order.userId}"
                data-user-email="${order.email}"
                data-order-id="${orderId}"
                data-order-friendly-id="${friendlyOrderId}">
                Contact Client
            </button>
        `;

        container.innerHTML = `
            <h4>Order ID: ${friendlyOrderId}</h4>
            <p><strong>Client:</strong> ${order.clientName || ''} (${order.email || ''})</p>
            <p><strong>Status:</strong> <span class="order-status">${order.status || '—'}</span></p>
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
            elements.chatsList.innerHTML = '';
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
