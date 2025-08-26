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
} from './auth.js';
import { openChat, sendSystemMessage } from './chat.js';

// --- This function waits for the DOM to be fully loaded before running the main script ---
(function initWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();

/**
 * Main application initializer.
 */
function initializeApp() {
    // --- Configuration: Hardcoded Admin UID ---
    const ADMIN_UID = 'mL8wfi0Bgvan5yh9yxCthmEDhJc2';

    // --- DOM Element Cache ---
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
    let ordersUnsubscribe = null;
    let chatsUnsubscribe = null;

    /**
     * Stops all active Firestore snapshot listeners.
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
     * Controls which single view is visible on the page.
     * @param {string | null} viewId The ID of the element to make visible.
     */
    const setVisibleView = (viewId) => {
        const views = [elements.loginView, elements.dashboardView, elements.unauthorizedView];
        views.forEach(view => {
            if (view) view.style.display = 'none';
        });

        if (viewId) {
            const viewToShow = document.getElementById(viewId);
            if (viewToShow) viewToShow.style.display = 'block';
        }
    };

    /**
     * --- SEPARATE LOGIN LOGIC ---
     * This logic ensures the dashboard has its own login state.
     */
    onAuthStateChanged(auth, (user) => {
        // We only care if the *current* user is the admin.
        // If they are not, we sign them out of the admin session and show the login page.
        if (user && user.uid === ADMIN_UID) {
            setVisibleView('admin-dashboard-view');
            stopListeners(); // Ensure no duplicate listeners are running.
            listenForAllOrders();
            listenForAllChats();
        } else {
            // If any other user is signed in, or no one is,
            // sign them out of this session and show the admin login form.
            if (auth.currentUser) {
                signOut(auth);
            }
            setVisibleView('admin-login-view');
            stopListeners();
        }
    });

    /**
     * Handles the admin login form submission.
     */
    async function handleAdminLogin(e) {
        e.preventDefault();
        elements.authError.textContent = '';
        elements.authError.classList.add('hidden');

        const email = elements.loginForm.elements['admin-login-email'].value;
        const password = elements.loginForm.elements['admin-login-password'].value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // CRITICAL CHECK: After login, verify if the UID matches the hardcoded admin UID.
            if (userCredential.user.uid === ADMIN_UID) {
                // Success! onAuthStateChanged will handle showing the dashboard.
            } else {
                // Logged in with a NON-ADMIN account.
                await signOut(auth); // Immediately sign them out.
                elements.authError.textContent = 'Access Denied. Not an admin account.';
                elements.authError.classList.remove('hidden');
            }
        } catch (error) {
            elements.authError.textContent = 'Login failed: Invalid credentials.';
            elements.authError.classList.remove('hidden');
        }
    }

    /**
     * Handles logout. Signs the user out, which triggers onAuthStateChanged
     * to show the login screen again.
     */
    async function handleLogout() {
        await signOut(auth);
    }

    // --- Attach Event Listeners ---
    elements.loginForm?.addEventListener('submit', handleAdminLogin);
    elements.logoutBtn?.addEventListener('click', handleLogout);
    elements.ordersList?.addEventListener('click', handleOrderActionClick);


    // --- All other functions for orders, chats, etc. remain the same ---

    /**
     * Handles clicks on Approve, Reject, and Contact Client buttons.
     */
    async function handleOrderActionClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const { orderId, userId, userEmail, orderFriendlyId } = button.dataset;

        // Contact Client
        if (button.classList.contains('btn-contact-client')) {
            if (userId && orderId) {
                const chatTitle = `Chat with ${userEmail || 'client'} (Order: ${orderFriendlyId})`;
                openChat(userId, chatTitle);
                sendSystemMessage(userId, `--- Admin started chat regarding Order: ${orderFriendlyId} ---`);
            }
            return;
        }

        // Approve / Reject
        if (button.classList.contains('btn-approve') || button.classList.contains('btn-reject')) {
            if (!orderId) return;
            const newStatus = button.classList.contains('btn-approve') ? 'Paid' : 'Rejected';

            // Optimistic UI update for instant feedback
            button.closest('.order-actions').innerHTML = `<p>Updating...</p>`;

            // Update Firestore
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: newStatus });
            if (userId) {
                sendSystemMessage(userId, `Your order (${friendlyOrderId}) has been ${newStatus}.`);
            }
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
            } else {
                snapshot.forEach(docSnap => elements.ordersList.appendChild(createOrderElement(docSnap)));
            }
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
            <button class="btn btn-contact-client" data-user-id="${order.userId}" data-user-email="${order.email}" data-order-id="${orderId}" data-order-friendly-id="${friendlyOrderId}">Contact Client</button>
        `;

        container.innerHTML = `
            <h4>Order ID: ${friendlyOrderId}</h4>
            <p><strong>Client:</strong> ${order.clientName || ''} (${order.email || ''})</p>
            <p><strong>Status:</strong> <span class="order-status">${order.status || '—'}</span></p>
            <p><strong>Description:</strong> ${order.projectDescription || ''}</p>
            <div class="order-actions">${actionButtons}</div><hr>`;
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
            } else {
                snapshot.forEach(docSnap => {
                    const chat = docSnap.data() || {};
                    if (chat.userId && chat.userEmail) {
                        const el = document.createElement('div');
                        el.className = 'chat-list-item';
                        el.innerHTML = `<p><strong>${chat.userEmail}</strong></p>`;
                        el.addEventListener('click', () => openChat(chat.userId, `Chat with ${chat.userEmail}`));
                        elements.chatsList.appendChild(el);
                    }
                });
            }
        });
    }
}
