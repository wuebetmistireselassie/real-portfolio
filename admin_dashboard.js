// admin_dashboard.js

// Imports from your existing auth.js module
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
// Imports from your existing chat.js module
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
    const hideAllViews = () => {
        adminLoginView?.classList.add('hidden');
        adminDashboardView?.classList.add('hidden');
        unauthorizedView?.classList.add('hidden');
    };

    const showDashboard = () => {
        hideAllViews();
        adminDashboardView?.classList.remove('hidden');
    };

    const showUnauthorized = () => {
        stopListeners();
        hideAllViews();
        unauthorizedView?.classList.remove('hidden');
    };

    const showLogin = () => {
        stopListeners();
        hideAllViews();
        adminLoginView?.classList.remove('hidden');
    };

    // --- Helpers ---
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

    const toMoney = (value, currency) => {
        const n = Number(value);
        if (Number.isFinite(n)) return `${n.toFixed(2)} ${currency || ''}`.trim();
        return value != null ? String(value) : '';
    };

    // --- Authentication ---
    onAuthStateChanged(auth, (user) => {
        stopListeners();
        if (user) {
            if (user.uid === ADMIN_UID) {
                showDashboard();
                listenForAllOrders();
                listenForAllChats();
            } else {
                showUnauthorized();
                signOut(auth);
            }
        } else {
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
            /**
             * DEEPER FIX for Login Persistence:
             * To avoid modifying auth.js, we dynamically import the Firebase auth
             * module here. This gives us access to 'setPersistence' and
             * 'browserLocalPersistence' only when we need them for login.
             */
            const { setPersistence, browserLocalPersistence } = await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js');

            // Set persistence to 'local' to ensure the session is saved across browser restarts.
            await setPersistence(auth, browserLocalPersistence);

            // Now, sign in the user.
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // The onAuthStateChanged listener will handle showing the dashboard,
            // but we add an extra check for non-admin users.
            if (userCredential.user?.uid !== ADMIN_UID) {
                await signOut(auth);
                showUnauthorized();
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
    });

    // --- Orders: Live Display ---
    function listenForAllOrders() {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        ordersUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!allOrdersList) return;
                allOrdersList.innerHTML = '';
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

                    let actionButtons = '';
                    if (order.status === 'Pending Confirmation') {
                        actionButtons = `
                            <button class="btn btn-approve" data-order-id="${orderId}" data-user-id="${order.userId || ''}">Approve</button>
                            <button class="btn btn-reject" data-order-id="${orderId}" data-user-id="${order.userId || ''}">Reject</button>
                        `;
                    }
                    actionButtons += `
                        <button class="btn btn-contact-client"
                            data-user-id="${order.userId || ''}"
                            data-user-email="${order.email || ''}"
                            data-order-id="${orderId}"
                            data-order-friendly-id="${friendlyOrderId}">
                            Contact Client
                        </button>
                    `;

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
    allOrdersList?.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const { userId, userEmail, orderId, orderFriendlyId } = button.dataset;

        if (button.classList.contains('btn-contact-client')) {
            if (userId && orderId) {
                const chatTitle = `Chat with ${userEmail || 'client'} (Order: ${orderFriendlyId})`;
                openChat(userId, chatTitle);
                sendSystemMessage(userId, `--- Admin started a chat regarding Order ID: ${orderFriendlyId} ---`);
            }
            return;
        }

        if (button.classList.contains('btn-approve') || button.classList.contains('btn-reject')) {
            if (!orderId) return;

            const isApprove = button.classList.contains('btn-approve');
            const newStatus = isApprove ? 'Paid' : 'Rejected';

            button.disabled = true;
            const sibling = isApprove ? button.nextElementSibling : button.previousElementSibling;
            if (sibling) sibling.disabled = true;

            const orderItem = button.closest('.order-item');
            if (orderItem) {
                const statusSpan = orderItem.querySelector('.order-status');
                if (statusSpan) {
                    statusSpan.textContent = newStatus;
                    statusSpan.className = `order-status status-${newStatus.toLowerCase().replace(/\s+/g, '-')}`;
                }
                const approveBtn = orderItem.querySelector('.btn-approve');
                const rejectBtn = orderItem.querySelector('.btn-reject');
                approveBtn?.remove();
                rejectBtn?.remove();
            }

            try {
                await updateOrderStatus(orderId, newStatus, userId, orderFriendlyId);
            } catch (err) {
                console.error('Failed to update order status:', err);
            }
        }
    });

    async function updateOrderStatus(orderId, newStatus, clientUserId, friendlyOrderId) {
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

    // --- Chats: Live Display ---
    function listenForAllChats() {
        const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
        chatsUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!allChatsList) return;
                allChatsList.innerHTML = '';
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

                        chatElement.addEventListener('click', () => {
                            openChat(chat.userId, `Chat with ${chat.userEmail}`);
                        });

                        allChatsList.appendChild(chatElement);
                    }
                });
            },
            (error) => {
                console.error('Error listening to chats:', error);
                allChatsList.innerHTML = `<p class="error-message">Error loading chats.</p>`;
            }
        );
    }
}
