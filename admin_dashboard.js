// admin_dashboard.js
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, db, collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, setDoc, serverTimestamp } from './auth.js';
import { openChat, sendSystemMessage } from './chat.js';

const ADMIN_UID = "mL8wfi0Bgvan5yh9yxCthmEDhJc2";

let el = {};
let ordersUnsubscribe = null;
let chatsUnsubscribe = null;
let currentUser = null;
let isAdminUser = false;

// Cache DOM elements
function cacheDOM() {
    el.adminLoginView = document.getElementById('admin-login-view');
    el.adminDashboardView = document.getElementById('admin-dashboard-view');
    el.adminLoginForm = document.getElementById('admin-login-form');
    el.adminLogoutBtn = document.getElementById('admin-logout-btn');
    el.allOrdersList = document.getElementById('all-orders-list');
    el.allChatsList = document.getElementById('all-chats-list');
    el.unauthorizedView = document.getElementById('unauthorized-view');
    el.adminAuthError = document.getElementById('admin-auth-error');
    el.adminLoginEmail = document.getElementById('admin-login-email');
    el.adminLoginPassword = document.getElementById('admin-login-password');
}

// Utility
function sanitizeText(text) {
    const temp = document.createElement('div');
    temp.textContent = text;
    return temp.innerHTML;
}

function money(value, currency) {
    const n = Number(value);
    return Number.isFinite(n) ? `${n.toFixed(2)} ${currency || ''}`.trim() : sanitizeText(value);
}

// ---------------------------
// Show/hide views
// ---------------------------
function showLogin() {
    el.adminLoginView.classList.remove('hidden');
    el.adminDashboardView.classList.add('hidden');
    el.unauthorizedView.classList.add('hidden');
}

function showDashboard() {
    el.adminLoginView.classList.add('hidden');
    el.unauthorizedView.classList.add('hidden');
    el.adminDashboardView.classList.remove('hidden');
}

function showUnauthorized() {
    el.adminLoginView.classList.add('hidden');
    el.adminDashboardView.classList.add('hidden');
    el.unauthorizedView.classList.remove('hidden');
    clearUnsubscribes();
}

function clearUnsubscribes() {
    if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
    if (chatsUnsubscribe) { chatsUnsubscribe(); chatsUnsubscribe = null; }
}

// ---------------------------
// Auth state
// ---------------------------
async function checkAdmin(user) {
    return user && user.uid === ADMIN_UID;
}

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    isAdminUser = await checkAdmin(user);
    if (document.readyState === 'complete') renderUI();
});

// ---------------------------
// DOM Ready
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    renderUI();

    // Login
    el.adminLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        el.adminAuthError.classList.add('hidden');
        const email = el.adminLoginEmail.value.trim();
        const password = el.adminLoginPassword.value;

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            if (cred.user.uid !== ADMIN_UID) {
                await signOut(auth);
                showUnauthorized();
            }
        } catch (err) {
            el.adminAuthError.textContent = "Login failed: " + err.message;
            el.adminAuthError.classList.remove('hidden');
        }
    });

    // Logout
    el.adminLogoutBtn?.addEventListener('click', async () => {
        clearUnsubscribes();
        await signOut(auth);
    });

    // Delegated click listener for orders
    el.allOrdersList?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const orderId = btn.dataset.orderId;
        const userId = btn.dataset.userId;

        if (btn.classList.contains('btn-contact-client')) {
            if (userId && orderId) {
                await setDoc(doc(db, 'conversations', userId), { lastOrderId: orderId, lastUpdate: serverTimestamp() }, { merge: true });
                openChat(userId, `Chat for Order ${orderId}`);
            }
            return;
        }

        if (!orderId || !userId) return;

        const newStatus = btn.classList.contains('btn-approve') ? 'Paid' : btn.classList.contains('btn-reject') ? 'Rejected' : null;
        if (!newStatus) return;

        // Optimistic UI
        const orderItem = btn.closest('.order-item');
        const statusSpan = orderItem?.querySelector('.order-status');
        if (statusSpan) {
            statusSpan.textContent = newStatus;
            statusSpan.className = `order-status status-${newStatus.toLowerCase().replace(/\s+/g, '-')}`;
        }

        await updateOrderStatus(orderId, newStatus, userId);
    });
});

// ---------------------------
// Render UI based on auth
// ---------------------------
function renderUI() {
    if (!currentUser) { clearUnsubscribes(); showLogin(); return; }
    if (isAdminUser) {
        showDashboard();
        if (!ordersUnsubscribe) listenOrders();
        if (!chatsUnsubscribe) listenChats();
    } else {
        showUnauthorized();
    }
}

// ---------------------------
// Orders
// ---------------------------
function listenOrders() {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    ordersUnsubscribe = onSnapshot(q, (snapshot) => {
        el.allOrdersList.innerHTML = '';
        if (snapshot.empty) { el.allOrdersList.innerHTML = '<p>No orders found.</p>'; return; }
        snapshot.forEach(docSnap => {
            const order = docSnap.data();
            const div = document.createElement('div');
            div.className = 'order-item';
            div.dataset.docId = docSnap.id;

            const statusClass = sanitizeText(order.status || 'Pending').toLowerCase().replace(/\s+/g, '-');
            let actions = '';
            if (order.status === 'Pending Confirmation') {
                actions = `
                    <button class="btn btn-approve" data-order-id="${docSnap.id}" data-user-id="${order.userId}">Approve</button>
                    <button class="btn btn-reject" data-order-id="${docSnap.id}" data-user-id="${order.userId}">Reject</button>
                `;
            }
            actions += `<button class="btn btn-contact-client" data-order-id="${docSnap.id}" data-user-id="${order.userId}" data-user-email="${order.email}">Contact Client</button>`;

            div.innerHTML = `
                <h4>Order ID: ${sanitizeText(order.orderId)}</h4>
                <p><strong>Client:</strong> ${sanitizeText(order.clientName)} (${sanitizeText(order.email)})</p>
                <p><strong>Contact:</strong> ${sanitizeText(order.contactInfo || '')}</p>
                <p><strong>Service:</strong> ${sanitizeText(order.serviceType || '')}</p>
                <p><strong>Total:</strong> ${money(order.totalPrice, order.currency)}</p>
                <p><strong>Upfront:</strong> ${money(order.upfrontPayment, order.currency)}</p>
                <p><strong>Transaction:</strong> ${sanitizeText(order.transactionNumber)}</p>
                <p><strong>Status:</strong> <span class="order-status status-${statusClass}">${sanitizeText(order.status)}</span></p>
                <div class="order-actions">${actions}</div>
                <hr>
            `;
            el.allOrdersList.appendChild(div);
        });
    });
}

// ---------------------------
// Update order status
// ---------------------------
async function updateOrderStatus(orderId, newStatus, clientUserId) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus, updatedAt: serverTimestamp() });
        if (clientUserId) {
            await setDoc(doc(db, 'conversations', clientUserId), { lastOrderId: orderId, lastUpdate: serverTimestamp() }, { merge: true });
            const orderSnap = await getDoc(orderRef);
            const orderData = orderSnap.data();
            const friendlyId = orderData?.orderId || orderId;
            await sendSystemMessage(clientUserId, `Your order (ID: ${friendlyId}) status updated to: "${newStatus}".`);
        }
    } catch (err) {
        console.error('Failed updating order status', err);
    }
}

// ---------------------------
// Chats
// ---------------------------
function listenChats() {
    const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
    chatsUnsubscribe = onSnapshot(q, (snapshot) => {
        el.allChatsList.innerHTML = '';
        if (snapshot.empty) { el.allChatsList.innerHTML = '<p>No active chats.</p>'; return; }
        snapshot.forEach(docSnap => {
            const chat = docSnap.data();
            if (!chat.userId || !chat.userEmail) return;
            const div = document.createElement('div');
            div.className = 'chat-list-item';
            div.dataset.userId = chat.userId;
            div.dataset.userEmail = chat.userEmail;
            div.innerHTML = `
                <p><strong>${sanitizeText(chat.userEmail)}</strong></p>
                <p>Last update: ${chat.lastUpdate ? new Date(chat.lastUpdate.toDate()).toLocaleString() : 'N/A'}</p>
            `;
            div.addEventListener('click', async () => {
                await setDoc(doc(db, 'conversations', chat.userId), { lastUpdate: serverTimestamp() }, { merge: true });
                openChat(chat.userId, `Chat with ${chat.userEmail}`);
            });
            el.allChatsList.appendChild(div);
        });
    }, (err) => {
        console.error('Chats listener error', err);
        el.allChatsList.innerHTML = `<p class="error-message">Error loading chats.</p>`;
    });
}