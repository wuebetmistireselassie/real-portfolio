// admin_dashboard.js

// Standard imports from your existing modules
import {
    auth,
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
 * FINAL, ROBUST SOLUTION:
 * We dynamically import the 'onAuthStateChanged' function. This creates a small
 * delay that ensures the main 'auth' object from auth.js is fully initialized
 * and ready before we attach our listener to it. This resolves the persistent
 * race condition where the script would sometimes check for a user before
 * Firebase had finished loading its session info from the browser.
 */
import('https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js')
    .then(({ onAuthStateChanged }) => {
        // --- This is the core authentication check ---
        onAuthStateChanged(auth, (user) => {
            // Now that we have a definitive answer about the user, run the main app logic.
            initializeAppLogic(user);
        });
    })
    .catch(error => {
        console.error("Critical error: Could not load Firebase Auth module.", error);
        // Display a fallback error message if Firebase itself fails to load
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = '<h2 style="text-align: center; color: red;">Error loading application dependencies. Please check your connection and try again.</h2>';
        }
    });


/**
 * Main application logic. This function is only called AFTER Firebase
 * has confirmed the user's login status.
 * @param {object|null} currentUser The authenticated user object or null.
 */
function initializeAppLogic(currentUser) {
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
    const showDashboard = () => {
        adminLoginView?.classList.add('hidden');
        unauthorizedView?.classList.add('hidden');
        adminDashboardView?.classList.remove('hidden');
    };

    const showUnauthorized = () => {
        adminLoginView?.classList.add('hidden');
        adminDashboardView?.classList.add('hidden');
        unauthorizedView?.classList.remove('hidden');
    };

    const showLogin = () => {
        adminDashboardView?.classList.add('hidden');
        unauthorizedView?.classList.add('hidden');
        adminLoginView?.classList.remove('hidden');
    };

    // --- Helper to stop listeners ---
    const stopListeners = () => {
        if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
        if (chatsUnsubscribe) { chatsUnsubscribe(); chatsUnsubscribe = null; }
    };

    // --- Initial View Decision ---
    stopListeners();
    if (currentUser) {
        if (currentUser.uid === ADMIN_UID) {
            showDashboard();
            listenForAllOrders();
            listenForAllChats();
        } else {
            showUnauthorized();
        }
    } else {
        showLogin();
    }


    // --- Event Listeners (only set up once) ---
    if (!adminLoginForm.hasAttribute('data-listener-set')) {
        adminLoginForm.setAttribute('data-listener-set', 'true');

        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            adminAuthError?.classList.add('hidden');
            const email = document.getElementById('admin-login-email')?.value || '';
            const password = document.getElementById('admin-login-password')?.value || '';
            try {
                const { setPersistence, browserLocalPersistence } = await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js');
                await setPersistence(auth, browserLocalPersistence);
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                adminAuthError.textContent = 'Login failed: Invalid credentials.';
                adminAuthError.classList.remove('hidden');
            }
        });

        adminLogoutBtn?.addEventListener('click', () => {
            signOut(auth);
        });

        allOrdersList?.addEventListener('click', handleOrderActions);
    }


    // --- All remaining functions for orders, chats, etc. ---
    const toMoney = (value, currency) => {
        const n = Number(value);
        if (Number.isFinite(n)) return `${n.toFixed(2)} ${currency || ''}`.trim();
        return value != null ? String(value) : '';
    };

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
                actionButtons += `<button class="btn btn-contact-client" data-user-id="${order.userId || ''}" data-user-email="${order.email || ''}" data-order-id="${orderId}" data-order-friendly-id="${friendlyOrderId}">Contact Client</button>`;
                const deliverables = Array.isArray(order.deliverables) ? order.deliverables.join(', ') : (order.deliverables || '');
                const totalPrice = toMoney(order.totalPrice, order.currency);
                const upfrontPayment = toMoney(order.upfrontPayment, order.currency);
                const statusClass = String(order.status || '').toLowerCase().replace(/\s+/g, '-');
                container.innerHTML = `
                    <h4>Order ID: ${friendlyOrderId}</h4>
                    <p><strong>Client:</strong> ${order.clientName || ''} (${order.email || ''})</p>
                    <p><strong>Status:</strong> <span class="order-status status-${statusClass}">${order.status || '—'}</span></p>
                    <div class="order-actions">${actionButtons}</div><hr>`;
                allOrdersList.appendChild(container);
            });
        }, (error) => {
            console.error('Error listening to orders:', error);
            allOrdersList.innerHTML = `<p class="error-message">Error loading orders.</p>`;
        });
    }

    async function handleOrderActions(e) {
        const button = e.target.closest('button');
        if (!button) return;
        const { userId, userEmail, orderId, orderFriendlyId } = button.dataset;
        if (button.classList.contains('btn-contact-client')) {
            if (userId && orderId) {
                openChat(userId, `Chat with ${userEmail || 'client'} (Order: ${orderFriendlyId})`);
                sendSystemMessage(userId, `--- Admin started a chat regarding Order ID: ${orderFriendlyId} ---`);
            }
            return;
        }
        if (button.classList.contains('btn-approve') || button.classList.contains('btn-reject')) {
            if (!orderId) return;
            const newStatus = button.classList.contains('btn-approve') ? 'Paid' : 'Rejected';
            button.closest('.order-actions').innerHTML = `<p>Updating...</p>`;
            try {
                await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
                sendSystemMessage(userId, `Your order (${orderFriendlyId}) has been ${newStatus}.`);
            } catch (err) {
                console.error('Failed to update order status:', err);
            }
        }
    }

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
                if (chat.userId && chat.userEmail) {
                    const chatElement = document.createElement('div');
                    chatElement.className = 'chat-list-item';
                    chatElement.innerHTML = `<p><strong>${chat.userEmail}</strong></p>`;
                    chatElement.addEventListener('click', () => openChat(chat.userId, `Chat with ${chat.userEmail}`));
                    allChatsList.appendChild(chatElement);
                }
            });
        });
    }
}
