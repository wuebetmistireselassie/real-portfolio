// admin_dashboard.js
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, db, collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, setDoc, serverTimestamp } from './auth.js';
import { openChat, sendSystemMessage } from './chat.js';

const ADMIN_UID = "mL8wfi0Bgvan5yh9yxCthmEDhJc2";

// DOM elements
let el = {};

let ordersUnsubscribe = null;
let chatsUnsubscribe = null;

// Track current user and admin status
let currentUser = null;
let isAdminUser = false;

// DOM caching
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

function clearUnsubscribes() {
    if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
    if (chatsUnsubscribe) { chatsUnsubscribe(); chatsUnsubscribe = null; }
}

function showLogin() {
    el.adminLoginView.classList.remove('hidden');
    el.adminDashboardView.classList.add('hidden');
    el.unauthorizedView.classList.add('hidden');
}

function showUnauthorized() {
    el.adminLoginView.classList.add('hidden');
    el.adminDashboardView.classList.add('hidden');
    el.unauthorizedView.classList.remove('hidden');
    clearUnsubscribes();
}

function showDashboard() {
    el.adminLoginView.classList.add('hidden');
    el.unauthorizedView.classList.add('hidden');
    el.adminDashboardView.classList.remove('hidden');
}

function safeText(v) {
    if (v === undefined || v === null) return '';
    return String(v);
}

function money(value, currency) {
    const n = Number(value);
    if (!Number.isFinite(n)) return safeText(value);
    return `${n.toFixed(2)} ${currency || ''}`.trim();
}

// Admin auth check
async function checkAdmin(user) {
    if (!user) return false;
    return user.uid === ADMIN_UID;
}

// Render UI based on currentUser & admin status
function renderUI() {
    if (!currentUser) {
        clearUnsubscribes();
        showLogin();
        return;
    }
    if (isAdminUser) {
        showDashboard();
        if (!ordersUnsubscribe) listenOrders();
        if (!chatsUnsubscribe) listenChats();
    } else {
        clearUnsubscribes();
        showUnauthorized();
    }
}

// ---------------------------
// Auth state handling
// ---------------------------
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    isAdminUser = await checkAdmin(user);
    if (document.readyState === 'complete') renderUI();
});

// ---------------------------
// DOM ready
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    renderUI();

    // Login form
    el.adminLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        el.adminAuthError.classList.add('hidden');
        const email = el.adminLoginEmail.value.trim();
        const password = el.adminLoginPassword.value;

        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            if (userCred.user.uid !== ADMIN_UID) {
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

    // Delegated event listener for orders actions
    el.allOrdersList?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const orderId = btn.dataset.orderId;
        const userId = btn.dataset.userId;

        if (btn.classList.contains('btn-contact-client')) {
            if (userId) {
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
// Orders listener
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

            const statusClass = safeText(order.status || 'Pending').toLowerCase().replace(/\s+/g, '-');
            let actions = '';
            if (order.status === 'Pending Confirmation') {
                actions = `
                    <button class="btn btn-approve" data-order-id="${docSnap.id}" data-user-id="${order.userId}">Approve</button>
                    <button class="btn btn-reject" data-order-id="${docSnap.id}" data-user-id="${order.userId}">Reject</button>
                `;
            }
            actions += `<button class="btn btn-contact-client" data-order-id="${docSnap.id}" data-user-id="${order.userId}" data-user-email="${order.email}">Contact Client</button>`;

            div.innerHTML = `
                <h4>Order ID: ${safeText(order.orderId)}</h4>
                <p><strong>Client:</strong> ${safeText(order.clientName)} (${safeText(order.email)})</p>
                <p><strong>Status:</strong> <span class="order-status status-${statusClass}">${safeText(order.status)}</span></p>
                <div class="order-actions">${actions}</div>
                <hr>
            `;
            el.allOrdersList.appendChild(div);
        });
    });
}

// ---------------------------
// Update order status + send system message
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
        console.error('Failed updating order status