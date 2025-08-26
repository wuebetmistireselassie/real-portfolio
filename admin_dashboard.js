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

// --- Configuration ---
const ADMIN_UID = 'mL8wfi0Bgvan5yh9yxCthmEDhJc2';

// --- Global State ---
let currentUser = null;
let chatsUnsubscribe = null;
let ordersUnsubscribe = null;

// --- Firestore listeners cleanup ---
const stopListeners = () => {
    if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
    if (chatsUnsubscribe) { chatsUnsubscribe(); chatsUnsubscribe = null; }
};

// --- Auth listener (runs immediately, before DOM ready) ---
onAuthStateChanged(auth, (user) => {
    currentUser = user || null;
    renderUI(); // Try to render right away if DOM is ready
});

// --- UI Rendering ---
function renderUI() {
    const adminLoginView = document.getElementById('admin-login-view');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    const unauthorizedView = document.getElementById('unauthorized-view');

    if (!adminLoginView || !adminDashboardView || !unauthorizedView) {
        // DOM not ready yet — will try again on DOMContentLoaded
        return;
    }

    if (!currentUser) {
        stopListeners();
        adminLoginView.classList.remove('hidden');
        adminDashboardView.classList.add('hidden');
        unauthorizedView.classList.add('hidden');
        return;
    }

    if (currentUser.uid === ADMIN_UID) {
        adminLoginView.classList.add('hidden');
        unauthorizedView.classList.add('hidden');
        adminDashboardView.classList.remove('hidden');

        stopListeners();
        listenForAllOrders();
        listenForAllChats();
    } else {
        stopListeners();
        adminLoginView.classList.add('hidden');
        adminDashboardView.classList.add('hidden');
        unauthorizedView.classList.remove('hidden');
    }
}

// --- Init after DOM ready ---
document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminAuthError = document.getElementById('admin-auth-error');

    renderUI(); // re-apply auth state once DOM is fully ready

    // login form
    adminLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminAuthError?.classList.add('hidden');

        const email = document.getElementById('admin-login-email').value;
        const password = document.getElementById('admin-login-password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user?.uid !== ADMIN_UID) {
                await signOut(auth);
                renderUI();
            }
        } catch (error) {
            if (adminAuthError) {
                adminAuthError.textContent = 'Login failed: ' + error.message;
                adminAuthError.classList.remove('hidden');
            }
        }
    });

    // logout
    adminLogoutBtn?.addEventListener('click', async () => {
        stopListeners();
        await signOut(auth);
        renderUI();
    });

    // Orders actions
    const allOrdersList = document.getElementById('all-orders-list');
    allOrdersList?.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const orderId = button.dataset.orderId;
        const userId = button.dataset.userId;

        if (button.classList.contains('btn-contact-client')) {
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
});

// --- Orders display ---
function listenForAllOrders() {
    const allOrdersList = document.getElementById('all-orders-list');
    if (!allOrdersList) return;

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
                <p><strong>Status:</strong> <span class="order-status">${order.status || '—'}</span></p>
                <div class="order-actions">${actionButtons}</div>
                <hr>
            `;
            allOrdersList.appendChild(div);
        });
    });
}

// --- Orders update ---
async function updateOrderStatus(orderId, newStatus, clientUserId) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });
        console.log(`Order ${orderId} → ${newStatus}`);

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

// --- Chats display ---
function listenForAllChats() {
    const allChatsList = document.getElementById('all-chats-list');
    if (!allChatsList) return;

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
