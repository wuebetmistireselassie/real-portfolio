// admin_dashboard.js — FIXED
// Fixes implemented:
// 1) Respect existing Firebase auth session so the admin dashboard does NOT ask to log in
//    if the admin is already signed in elsewhere (e.g., orders.html). We hide the login
//    view until auth state is known and then render the correct view. We also handle
//    cross-tab/session persistence by checking onAuthStateChanged and auth.currentUser on init.
// 2) Approve/Reject updates the order status in Firestore and reflects immediately
//    in BOTH admin and client views (client listens to the same doc). We also send a
//    system message through chat.js to notify the client.
// 3) “Contact Client” always opens the chat modal (chat.js: openChat) for any order,
//    regardless of status (Pending/Rejected/Paid).
//
// Dependencies: auth.js (Firebase), chat.js (chat modal + messaging).
// HTML element IDs are from admin.html.
//
// NOTE: Keep the ADMIN_UID consistent with your real admin account.
//

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
  // Run immediately if DOM is already parsed; otherwise wait for DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

function init() {
  // --- Configuration ---
  const ADMIN_UID = 'mL8wfi0Bgvan5yh9yxCthmEDhJc2'; // <- update if your admin UID changes

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

  // --- Authentication fix (Bug #1) ---
  // Hide login view until we know the auth state to avoid asking for credentials
  // when an existing session already exists.
  adminLoginView?.classList.add('hidden');
  adminDashboardView?.classList.add('hidden');
  unauthorizedView?.classList.add('hidden');

  // If a persisted session is already loaded synchronously, render immediately.
  if (auth.currentUser && auth.currentUser.uid) {
    if (auth.currentUser.uid === ADMIN_UID) {
      showDashboard();
      listenForAllOrders();
      listenForAllChats();
    } else {
      showUnauthorized();
    }
  }

  // Always subscribe to auth changes (robust in case currentUser is initially null).
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

  // --- Login form ---
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
      // If it *is* the admin, onAuthStateChanged will flip the UI to dashboard.
    } catch (error) {
      if (adminAuthError) {
        adminAuthError.textContent = 'Login failed: ' + (error?.message || String(error));
        adminAuthError.classList.remove('hidden');
      }
    }
  });

  // --- Logout ---
  adminLogoutBtn?.addEventListener('click', async () => {
    stopListeners();
    await signOut(auth);
    showLogin();
  });

  // --- Orders: Live Display ---
  function listenForAllOrders() {
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    ordersUnsubscribe = onSnapshot(
      qOrders,
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
          const userIdAttr = order.userId ? String(order.userId) : '';
          const userEmailAttr = order.email ? String(order.email) : '';

          if (order.status === 'Pending Confirmation') {
            actionButtons = `
              <button class="btn btn-approve" data-order-id="${docSnap.id}" data-user-id="${userIdAttr}">Approve</button>
              <button class="btn btn-reject" data-order-id="${docSnap.id}" data-user-id="${userIdAttr}">Reject</button>
            `;
          }
          actionButtons += `
            <button class="btn btn-contact-client" data-user-id="${userIdAttr}" data-user-email="${userEmailAttr}">
              Contact Client
            </button>
          `;

          // Safe fields
          const deliverables = Array.isArray(order.deliverables) ? order.deliverables.join(', ') : (order.deliverables || '');
          const createdAtText = (() => {
            try {
              const ts = order.createdAt;
              const d = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
              return d && !isNaN(d.getTime()) ? d.toLocaleString() : 'N/A';
            } catch {
              return 'N/A';
            }
          })();

          const statusClass = String(order.status || '').toLowerCase().replace(/\s+/g, '-');

          container.innerHTML = `
            <div class="order-summary">
              <div><strong>Order ID:</strong> ${order.orderId || docSnap.id}</div>
              <div><strong>Client:</strong> ${order.fullName || ''} ${order.email ? `(${order.email})` : ''}</div>
              <div><strong>Phone:</strong> ${order.phone || ''}</div>
              <div><strong>Deliverables:</strong> ${deliverables}</div>
              <div><strong>Currency:</strong> ${order.currency || ''}</div>
              <div><strong>Upfront Payment:</strong> ${toMoney(order.upfrontPayment, order.currency)}</div>
              <div><strong>Total Price:</strong> ${toMoney(order.price, order.currency)}</div>
              <div><strong>Created:</strong> ${createdAtText}</div>
              <div><strong>Status:</strong> <span class="order-status status-${statusClass}">${order.status || ''}</span></div>
            </div>
            <div class="order-actions">
              ${actionButtons}
            </div>
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

  // --- Orders: Actions (event delegation + optimistic UI) ---
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

      try {
        await updateOrderStatus(orderId, newStatus, clientUserId);
      } catch (err) {
        console.error('Error updating order status:', err);
        // Optional: Roll back optimistic UI change or surface an error toast.
      }
    }
  });

  async function updateOrderStatus(orderId, newStatus, clientUserId) {
    // Update Firestore (this immediately syncs to client/orders view via its onSnapshot)
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

  // --- Chats: Live Display (sorted by lastUpdate) ---
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
              <div><strong>${chat.userEmail}</strong></div>
              <div class="subtle">Last updated: ${lastUpdatedText}</div>
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
