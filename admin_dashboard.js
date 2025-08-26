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

// Self-invoking function to ensure initialization runs after the DOM is ready.
(function initWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

function init() {
    // --- Configuration ---
    // This should be your specific Firebase UID for the admin account.
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

    // --- Helper Functions ---
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
    
    // Formats a number as a currency string.
    const toMoney = (value, currency) => {
        const n = Number(value);
        if (Number.isFinite(n)) return `${n.toFixed(2)} ${currency || ''}`.trim();
        return value != null ? String(value) : '';
    };

    // --- Authentication: The Single Source of Truth ---
    // This listener handles all auth state changes, fixing the primary login issue.
    onAuthStateChanged(auth, (user) => {
        // Always stop previous listeners when auth state changes.
        stopListeners();

        if (user) {
            // A user is logged in. Check if they are the admin.
            if (user.uid === ADMIN_UID) {
                showDashboard();
                // Start the real-time listeners for orders and chats.
                listenForAllOrders();
                listenForAllChats();
            } else {
                // User is logged in but is NOT an admin.
                showUnauthorized();
            }
        } else {
            // No user is logged in.
            showLogin();
        }
    });

    // --- Event Listeners ---
    adminLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminAuthError?.classList.add('hidden');

        const email = document.getElementById('admin-login-email')?.value || '';
        const password = document.getElementById('admin-login-password')?.value || '';

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // After login, the onAuthStateChanged listener above will automatically handle showing the correct view.
            if (userCredential.user?.uid !== ADMIN_UID) {
                // If a non-admin logs in here, sign them out immediately.
                await signOut(auth);
            }
        } catch (error) {
            if (adminAuthError) {
                adminAuthError.textContent = 'Login failed: ' + (error?.message || String(error));
                adminAuthError.classList.remove('hidden');
            }
        }
    });
    
    adminLogoutBtn?.addEventListener('click', () => signOut(auth));

    // --- Real-time Firestore Listeners ---

    // Listens for all orders and renders them. This is the source of truth for the UI.
    function listenForAllOrders() {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        ordersUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
                allOrdersList.innerHTML = ''; // Clear previous list
                if (snapshot.empty) {
                    allOrdersList.innerHTML = '<p>No orders found.</p>';
                    return;
                }

                snapshot.forEach((docSnap) => {
                    const order = docSnap.data() || {};
                    const container = document.createElement('div');
                    container.className = 'order-item';
                    container.dataset.docId = docSnap.id;
                    
                    // Dynamically generate action buttons based on order status
                    let actionButtons = '';
                    if (order.status === 'Pending Confirmation') {
                        actionButtons = `
                            <button class="btn btn-approve" data-order-id="${docSnap.id}" data-user-id="${order.userId || ''}">Approve</button>
                            <button class="btn btn-reject" data-order-id="${docSnap.id}" data-user-id="${order.userId || ''}">Reject</button>
                        `;
                    }
                    
                    // Always include the contact button. This resolves bug #3.
                    actionButtons += `
                        <button class="btn btn-contact-client" data-user-id="${order.userId || ''}" data-user-email="${order.email || ''}">
                            Contact Client
                        </button>
                    `;

                    const deliverables = Array.isArray(order.deliverables) ? order.deliverables.join(', ') : (order.deliverables || 'N/A');
                    const statusClass = String(order.status || '').toLowerCase().replace(/\s+/g, '-');

                    container.innerHTML = `
                        <h4>Order ID: ${order.orderId || docSnap.id}</h4>
                        <p><strong>Client:</strong> ${order.clientName || 'N/A'} (${order.email || 'N/A'})</p>
                        <p><strong>Contact:</strong> ${order.contactInfo || 'N/A'}</p>
                        <p><strong>Service:</strong> ${order.serviceType || 'N/A'}</p>
                        <p><strong>Deliverables:</strong> ${deliverables}</p>
                        <p><strong>Total Price:</strong> ${toMoney(order.totalPrice, order.currency)}</p>
                        <p><strong>Upfront Payment:</strong> ${toMoney(order.upfrontPayment, order.currency)}</p>
                        <p><strong>Transaction ID:</strong> ${order.transactionNumber || 'N/A'}</p>
                        <p><strong>Status:</strong> <span class="order-status status-${statusClass}">${order.status || '—'}</span></p>
                        <p><strong>Description:</strong> ${order.projectDescription || 'N/A'}</p>
                        <div class="order-actions">${actionButtons}</div>
                        <hr>
                    `;
                    allOrdersList.appendChild(container);
                });
            },
            (error) => {
                console.error('Error listening to orders:', error);
                allOrdersList.innerHTML = `<p class="error-message">Error loading orders. Ensure the required Firestore index is created.</p>`;
            }
        );
    }
    
    // Centralized click handler for all buttons on the orders list.
    allOrdersList.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const orderId = button.dataset.orderId;
        const clientUserId = button.dataset.userId;

        // Handle Approve/Reject clicks
        if (button.classList.contains('btn-approve') || button.classList.contains('btn-reject')) {
            if (!orderId) return;
            const newStatus = button.classList.contains('btn-approve') ? 'Paid' : 'Rejected';
            button.disabled = true; // Prevent double-clicks
            await updateOrderStatus(orderId, newStatus, clientUserId);
            // The UI will update automatically via the onSnapshot listener, ensuring consistency.
        }

        // Handle Contact Client clicks
        if (button.classList.contains('btn-contact-client')) {
            const userEmail = button.dataset.userEmail;
            if (clientUserId) {
                openChat(clientUserId, `Chat with ${userEmail || 'client'}`);
            }
        }
    });

    // Updates an order's status in Firestore and notifies the client.
    async function updateOrderStatus(orderId, newStatus, clientUserId) {
        const orderRef = doc(db, 'orders', orderId);
        try {
            await updateDoc(orderRef, { status: newStatus });
            // After a successful update, send a notification message to the client's chat.
            if (clientUserId) {
                const orderSnap = await getDoc(orderRef);
                const orderData = orderSnap.data() || {};
                const friendlyId = orderData.orderId || orderId;
                sendSystemMessage(
                    clientUserId,
                    `Your order (${friendlyId}) status has been updated to: "${newStatus}".`
                );
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
            // Optionally, show an error to the admin here.
        }
    }

    // Listens for all client chat conversations.
    function listenForAllChats() {
        const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
        chatsUnsubscribe = onSnapshot(
            q,
            (snapshot) => {
                allChatsList.innerHTML = ''; // Clear previous list
                if (snapshot.empty) {
                    allChatsList.innerHTML = '<p>No active chats.</p>';
                    return;
                }

                snapshot.forEach((docSnap) => {
                    const chat = docSnap.data() || {};
                    if (chat.userId && chat.userEmail) {
                        const chatElement = document.createElement('div');
                        chatElement.className = 'chat-list-item';
                        
                        let lastUpdatedText = 'N/A';
                        if (chat.lastUpdate?.toDate) {
                           lastUpdatedText = chat.lastUpdate.toDate().toLocaleString();
                        }
                        
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
