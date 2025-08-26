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
    // getDocs, // (unused)
    // where    // (unused)
} from './auth.js';
import { openChat, sendSystemMessage } from './chat.js';

(function initWhenReady() {
    // Run immediately if DOM is already parsed; otherwise wait for DOMContentLoaded.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

function init() {
    // --- Configuration ---
    const ADMIN_UID = 'mL8wfi0Bgvan5yh9yxCthmEDhJc2';

    // --- DOM Elements ---
    const adminLoginView = document.getElementById('admin-login-view');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const allOrdersList = document.getElementById('all-orders-list');
    const allChatsList = document.getElementById('all-chats-list');
    const unauthorizedView = document.getElementById('unauthorized-view');
    const adminAuthError = document.getElementById('admin-auth-error');

    let chatsUnsubscribe = null;
    let ordersUnsubscribe = null;

    // --- Helpers ---
    const stopListeners = () => {
        if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
        if (chatsUnsubscribe) { chatsUnsubscribe(); chatsUnsubscribe = null; }
    };

    const showDashboard = () => {
        adminLoginView?.classList.add('hidden');
        unauthorizedView?.classList.add('hidden');
        adminDashboardView?.classList.remove('hidden');
    };

    const showUnauthorized = () => {
        stopListeners();
        adminDashboardView?.classList.add('hidden');
        adminLoginView?.classList.add('hidden');
        unauthorizedView?.classList.remove('hidden');
    };

    const showLogin = () => {
        stopListeners();
        adminDashboardView?.classList.add('hidden');
        unauthorizedView?.classList.add('hidden');
        adminLoginView?.classList.remove('hidden');
    };

    const toMoney = (value, currency) => {
        const n = Number(value);
        if (Number.isFinite(n)) return `${n.toFixed(2)} ${currency || ''}`.trim();
        return value != null ? String(value) : '';
    };

    // --- Authentication (robust, runs exactly once regardless of load timing) ---
    onAuthStateChanged(auth, (user) => {
        // Clear any prior snapshot listeners if auth user changes
        if (!user) {
            showLogin();
            return;
        }

        if (user.uid === ADMIN_UID) {
            showDashboard();
            // (Re)start listeners safely
            stopListeners();
            listenForAllOrders();
            listenForAllChats();
        } else {
            showUnauthorized();
        }
    });

    // Login form
    adminLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminAuthError?.classList.add('hidden');

        const email = /** @type {HTMLInputElement} */ (document.getElementById('admin-login-email'))?.value || '';
        const password = /** @type {HTMLInputElement} */ (document.getElementById('admin-login-password'))?.value || '';

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
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

    // Logout
    adminLogoutBtn?.addEventListener('click', async () => {
        stopListeners();
        await signOut(auth);
        showLogin();
    });

    // --- Orders: Live Display ---
    function listenForAllOrders() {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        ordersUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
                allOrdersList.innerHTML = '';
                if (snapshot.empty) {
                    allOrdersList.innerHTML = '<p>No orders found.</p>';
                    return;
                }

                snapshot.forEach((docSnap) => {
                    const order = docSnap.data() || {};
                    const container = document.createElement('div');
                    container.className = 'order-item';
                    container.dataset.docId = docSnap.id;

                    // Action buttons
                    let actionButtons = '';
                    if (order.status === 'Pending Confirmation') {
                        actionButtons = `
                            <button class="btn btn-approve" data-order-id="${docSnap.id}" data-user-id="${order.userId || ''}">Approve</button>
                            <button class="btn btn-reject" data-order-id="${docSnap.id}" data-user-id="${order.userId || ''}">Reject</button>
                        `;
                    }
                    actionButtons += `
                        <button class="btn btn-contact-client" data-user-id="${order.userId || ''}" data-user-email="${order.email || ''}">
                            Contact Client
                        </button>
                    `;

                    // Safe fields
                    const deliverables = Array.isArray(order.deliverables) ? order.deliverables.join(', ') : (order.deliverables || '');
                    const totalPrice = toMoney(order.totalPrice, order.currency);
                    const upfrontPayment = toMoney(order.upfrontPayment, order.currency);
                    const statusClass = String(order.status || '')
                        .toLowerCase()
                        .replace(/\s+/g, '-');

                    container.innerHTML = `
                        <h4>Order ID: ${order.orderId || docSnap.id}</h4>
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

    // --- Orders: Actions (fixed event delegation & optimistic UI update) ---
    allOrdersList.addEventListener('click', async (e) => {
        const button = /** @type {HTMLElement|null} */ (e.target instanceof Element ? e.target.closest('button') : null);
        if (!button) return;

        // CONTACT CLIENT
        if (button.classList.contains('btn-contact-client')) {
            const userId = button.dataset.userId || '';
            const userEmail = button.dataset.userEmail || '';
            if (userId) {
                openChat(userId, `Chat with ${userEmail || 'client'}`);
            }
            return;
        }

        // APPROVE / REJECT
        const orderId = button.dataset.orderId || '';
        const clientUserId = button.dataset.userId || '';

        if (!orderId) return;

        if (button.classList.contains('btn-approve') || button.classList.contains('btn-reject')) {
            const newStatus = button.classList.contains('btn-approve') ? 'Paid' : 'Rejected';

            // Optimistic UI update for instant feedback
            const orderItem = button.closest('.order-item');
            const statusSpan = orderItem?.querySelector('.order-status');
            if (statusSpan) {
                statusSpan.textContent = newStatus;
                statusSpan.className = `order-status status-${newStatus.toLowerCase().replace(/\s+/g, '-')}`;
            }

            await updateOrderStatus(orderId, newStatus, clientUserId).catch((err) => {
                console.error('Error updating order status:', err);
                // Rollback optimistic update if needed (optional)
            });
        }
    });

    async function updateOrderStatus(orderId, newStatus, clientUserId) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });

        // Notify the client (if chat system is available)
        if (clientUserId) {
            try {
                const orderSnap = await getDoc(orderRef);
                const orderData = orderSnap.data() || {};
                const friendlyId = orderData.orderId || orderId;
                sendSystemMessage(
                    clientUserId,
                    `Your order with ID ${friendlyId} has been updated to: "${newStatus}".`
                );
            } catch (err) {
                console.warn('Status updated, but failed to notify client:', err);
            }
        }
    }

    // --- Chats: Live Display (fixed list clearing bug) ---
    function listenForAllChats() {
        const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
        chatsUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
                allChatsList.innerHTML = ''; // <-- Correct list cleared (was incorrectly clearing orders)
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
                            // Handle Firestore Timestamp or Date/string
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
                allChatsList.innerHTML = `<p class="error-message">Error loading chats. You may need to create a Firestore index.</p>`;
            }
        );
    }
}
