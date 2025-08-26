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

(function initWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

function init() {
    const ADMIN_UID = 'mL8wfi0Bgvan5yh9yxCthmEDhJc2';

    // DOM elements
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

    // helpers
    const stopListeners = () => {
        if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
        if (chatsUnsubscribe) { chatsUnsubscribe(); chatsUnsubscribe = null; }
    };

    const showDashboard = () => {
        adminLoginView.classList.add('hidden');
        unauthorizedView.classList.add('hidden');
        adminDashboardView.classList.remove('hidden');
    };

    const showUnauthorized = () => {
        stopListeners();
        adminDashboardView.classList.add('hidden');
        adminLoginView.classList.add('hidden');
        unauthorizedView.classList.remove('hidden');
    };

    const showLogin = () => {
        stopListeners();
        adminDashboardView.classList.add('hidden');
        unauthorizedView.classList.add('hidden');
        adminLoginView.classList.remove('hidden');
    };

    // --- Auth handling ---
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            showLogin();
            return;
        }
        if (user.uid === ADMIN_UID) {
            showDashboard();
            stopListeners();
            listenForAllOrders();
            listenForAllChats();
        } else {
            showUnauthorized();
        }
    });

    adminLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminAuthError.classList.add('hidden');
        const email = document.getElementById('admin-login-email').value;
        const password = document.getElementById('admin-login-password').value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user?.uid !== ADMIN_UID) {
                await signOut(auth);
                showUnauthorized();
            }
        } catch (error) {
            adminAuthError.textContent = 'Login failed: ' + error.message;
            adminAuthError.classList.remove('hidden');
        }
    });

    adminLogoutBtn?.addEventListener('click', async () => {
        stopListeners();
        await signOut(auth);
        showLogin();
    });

    // --- Orders list ---
    function listenForAllOrders() {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            allOrdersList.innerHTML = '';
            if (snapshot.empty) {
                allOrdersList.innerHTML = '<p>No orders found.</p>';
                return;
            }

            snapshot.forEach((docSnap) => {
                const order = docSnap.data() || {};
                const div = document.createElement('div');
                div.className = 'order-item';
                div.dataset.docId = docSnap.id;

                let actionButtons = '';
                if (order.status === 'Pending Confirmation') {
                    actionButtons = `
                        <button class="btn btn-approve" data-order-id="${docSnap.id}" data-user-id="${order.userId || ''}">Approve</button>
                        <button class="btn btn-reject" data-order-id="${docSnap.id}" data-user-id="${order.userId || ''}">Reject</button>
                    `;
                }

                actionButtons += `
                    <button class="btn btn-contact-client" 
                        data-order-id="${docSnap.id}" 
                        data-user-id="${order.userId || ''}" 
                        data-user-email="${order.email || ''}">
                        Contact Client
                    </button>
                `;

                div.innerHTML = `
                    <h4>Order ID: ${order.orderId || docSnap.id}</h4>
                    <p><strong>Client:</strong> ${order.clientName || ''} (${order.email || ''})</p>
                    <p><strong>Contact:</strong> ${order.contactInfo || ''}</p>
                    <p><strong>Service:</strong> ${order.serviceType || ''}</p>
                    <p><strong>Status:</strong> <span class="order-status">${order.status || '—'}</span></p>
                    <div class="order-actions">${actionButtons}</div>
                    <hr>
                `;
                allOrdersList.appendChild(div);
            });
        });
    }

    // --- Orders actions ---
    allOrdersList.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const orderId = button.dataset.orderId;
        const userId = button.dataset.userId;

        if (button.classList.contains('btn-contact-client')) {
            // now pass orderId also, so admin can send files/progress tied to order
            openChat(userId, `Order ${orderId}`);
            return;
        }

        if (!orderId || !userId) return;

        if (button.classList.contains('btn-approve')) {
            await updateOrderStatus(orderId, 'Paid', userId);
        } else if (button.classList.contains('btn-reject')) {
            await updateOrderStatus(orderId, 'Rejected', userId);
        }
    });

    async function updateOrderStatus(orderId, newStatus, clientUserId) {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: newStatus }); // persist to Firestore
            console.log(`Order ${orderId} updated → ${newStatus}`);

            const orderSnap = await getDoc(orderRef);
            const orderData = orderSnap.data();
            if (clientUserId) {
                sendSystemMessage(
                    clientUserId,
                    `Your order "${orderData?.orderId || orderId}" status changed to: ${newStatus}.`
                );
            }
        } catch (err) {
            console.error('Failed to update order status:', err);
        }
    }

    // --- Chats list ---
    function listenForAllChats() {
        const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
        chatsUnsubscribe = onSnapshot(q, (snapshot) => {
            allChatsList.innerHTML = '';
            if (snapshot.empty) {
                allChatsList.innerHTML = '<p>No active chats.</p>';
                return;
            }

            snapshot.forEach((docSnap) => {
                const chat = docSnap.data() || {};
                if (!chat.userId || !chat.userEmail) return;

                const chatElement = document.createElement('div');
                chatElement.className = 'chat-list-item';
                chatElement.dataset.userId = chat.userId;
                chatElement.dataset.userEmail = chat.userEmail;

                const lastUpdate = chat.lastUpdate?.toDate
                    ? chat.lastUpdate.toDate().toLocaleString()
                    : 'N/A';

                chatElement.innerHTML = `
                    <p><strong>${chat.userEmail}</strong></p>
                    <p>Last update: ${lastUpdate}</p>
                `;

                chatElement.addEventListener('click', () => {
                    openChat(chat.userId, `Chat with ${chat.userEmail}`);
                });

                allChatsList.appendChild(chatElement);
            });
        });
    }
}
