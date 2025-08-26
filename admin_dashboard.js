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

(function initWhenReady() {
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

    // --- Authentication (Working as provided) ---
    onAuthStateChanged(auth, (user) => {
        stopListeners(); // Always reset listeners on auth change
        if (user) {
            if (user.uid === ADMIN_UID) {
                showDashboard();
                listenForAllOrders();
                listenForAllChats();
            } else {
                showUnauthorized();
            }
        } else {
            showLogin();
        }
    });

    // --- Login form ---
    adminLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminAuthError?.classList.add('hidden');

        const email = document.getElementById('admin-login-email')?.value || '';
        const password = document.getElementById('admin-login-password')?.value || '';

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user?.uid !== ADMIN_UID) {
                await signOut(auth);
            }
            // onAuthStateChanged will handle UI switching
        } catch (error) {
            if (adminAuthError) {
                adminAuthError.textContent = 'Login failed: ' + (error?.message || String(error));
                adminAuthError.classList.remove('hidden');
            }
        }
    });

    // --- Logout ---
    adminLogoutBtn?.addEventListener('click', () => signOut(auth));

    // --- Orders: Live Display ---
    function listenForAllOrders() {
        const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        ordersUnsubscribe = onSnapshot(
            qOrders,
            (snapshot) => {
                allOrdersList.innerHTML = ''; // Clear previous render
                if (snapshot.empty) {
                    allOrdersList.innerHTML = '<p>No orders found.</p>';
                    return;
                }

                snapshot.forEach((docSnap) => {
                    const order = docSnap.data() || {};
                    const container = document.createElement('div');
                    container.className = 'order-item';
                    
                    let actionButtons = '';
                    if (order.status === 'Pending Confirmation') {
                        actionButtons = `
                            <button class="btn btn-approve" data-order-id="${docSnap.id}" data-user-id="${order.userId}">Approve</button>
                            <button class="btn btn-reject" data-order-id="${docSnap.id}" data-user-id="${order.userId}">Reject</button>
                        `;
                    }

                    // The "Contact Client" button is always available.
                    actionButtons += `
                        <button class="btn btn-contact-client" data-user-id="${order.userId}" data-user-email="${order.email}">
                            Contact Client
                        </button>
                    `;
                    
                    const statusClass = String(order.status || '').toLowerCase().replace(/\s+/g, '-');
                    const deliverables = Array.isArray(order.deliverables) ? order.deliverables.join(', ') : (order.deliverables || 'N/A');

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
                        <div class="order-actions">${actionButtons}</div>
                        <hr>
                    `;
                    allOrdersList.appendChild(container);
                });
            },
            (error) => {
                console.error('Error listening to orders:', error);
                allOrdersList.innerHTML = `<p class="error-message">Error loading orders. Check Firestore indexes.</p>`;
            }
        );
    }

    // --- Orders: Actions (Single event listener) ---
    allOrdersList.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const userId = button.dataset.userId;
        const userEmail = button.dataset.userEmail;
        const orderId = button.dataset.orderId;

        // ✅ Bug #3 Fix Verified: This logic is correct and calls openChat as intended.
        if (button.classList.contains('btn-contact-client')) {
            if (userId) {
                openChat(userId, `Chat with ${userEmail || 'client'}`);
            }
            return;
        }

        // ✅ Bug #2 Fix Implemented: No more manual UI changes. Firestore handles it.
        if (button.classList.contains('btn-approve') || button.classList.contains('btn-reject')) {
            if (!orderId) return;

            button.disabled = true; // Prevent multiple clicks
            const newStatus = button.classList.contains('btn-approve') ? 'Paid' : 'Rejected';
            
            try {
                await updateOrderStatus(orderId, newStatus, userId);
                // The onSnapshot listener will automatically update the UI after this succeeds.
            } catch (err) {
                console.error('Error updating order status:', err);
                button.disabled = false; // Re-enable button on failure
            }
        }
    });

    async function updateOrderStatus(orderId, newStatus, clientUserId) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });

        // Notify the client via system message in their chat
        if (clientUserId) {
            try {
                const orderSnap = await getDoc(orderRef);
                const orderData = orderSnap.data() || {};
                const friendlyId = orderData.orderId || orderId;
                sendSystemMessage(
                    clientUserId,
                    `Your order (${friendlyId}) status has been updated to: "${newStatus}".`
                );
            } catch (err) {
                console.warn('Status updated, but failed to notify client:', err);
            }
        }
    }

    // --- Chats: Live Display ---
    function listenForAllChats() {
        const qChats = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
        chatsUnsubscribe = onSnapshot(
            qChats,
            (snapshot) => {
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
                        
                        let lastUpdatedText = 'N/A';
                        if (chat.lastUpdate?.toDate) {
                           lastUpdatedText = chat.lastUpdate.toDate().toLocaleString();
                        }
                        
                        chatElement.innerHTML = `
                            <p><strong>${chat.userEmail}</strong></p>
                            <p class="subtle">Last update: ${lastUpdatedText}</p>
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
                allChatsList.innerHTML = `<p class="error-message">Error loading chats. Check Firestore indexes.</p>`;
            }
        );
    }
}
