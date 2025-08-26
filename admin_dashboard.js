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
  const unauthorizedView = document.getElementById('unauthorized-view');
  const adminAuthError = document.getElementById('admin-auth-error');

  let ordersUnsubscribe = null;

  // Helpers to show/hide views
  const stopListeners = () => {
    if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
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

  // --- Authentication: login persistence (Bug #1 fixed) ---
  adminLoginView?.classList.add('hidden');
  adminDashboardView?.classList.add('hidden');
  unauthorizedView?.classList.add('hidden');

  if (auth.currentUser && auth.currentUser.uid) {
    if (auth.currentUser.uid === ADMIN_UID) {
      showDashboard();
      listenForAllOrders();
    } else {
      showUnauthorized();
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      showLogin();
      return;
    }
    if (user.uid === ADMIN_UID) {
      showDashboard();
      stopListeners();
      listenForAllOrders();
    } else {
      showUnauthorized();
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
        showUnauthorized();
      }
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

  // --- Orders listener (real-time display) ---
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

          let actionButtons = '';
          const userIdAttr = order.userId || '';
          const userEmailAttr = order.email || '';

          if (order.status === 'Pending Confirmation') {
            actionButtons = `
              <button class="btn btn-approve" data-order-id="${docSnap.id}" data-user-id="${userIdAttr}">Approve</button>
              <button class="btn btn-reject" data-order-id="${docSnap.id}" data-user-id="${userIdAttr}">Reject</button>
            `;
          }

          actionButtons += `
            <button class="btn btn-contact-client" data-user-id="${userIdAttr}" data-user-email="${userEmailAttr}">Contact Client</button>
          `;

          const deliverables = Array.isArray(order.deliverables) ? order.deliverables.join(', ') : (order.deliverables || '');
          const createdAtText = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'N/A';
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
            <div class="order-actions">${actionButtons}</div>
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

  // --- Orders actions (Approve/Reject + Contact Client) ---
  allOrdersList.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    // Contact Client
    if (button.classList.contains('btn-contact-client')) {
      const userId = button.dataset.userId || '';
      const userEmail = button.dataset.userEmail || '';
      if (userId) openChat(userId, `Chat with ${userEmail || 'client'}`);
      return;
    }

    // Approve / Reject
    const orderId = button.dataset.orderId || '';
    const clientUserId = button.dataset.userId || '';
    if (!orderId) return;

    let newStatus = '';
    if (button.classList.contains('btn-approve')) newStatus = 'Paid';
    if (button.classList.contains('btn-reject')) newStatus = 'Rejected';
    if (!newStatus) return;

    // Optimistic UI update
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
      alert('Failed to update order. Please refresh and try again.');
    }
  });

  // --- Update order in Firestore and notify client ---
  async function updateOrderStatus(orderId, newStatus, clientUserId) {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== ADMIN_UID) {
      throw new Error('Unauthorized: Only admin can update order status.');
    }

    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });

    // Notify client via chat system
    if (clientUserId) {
      try {
        const orderSnap = await getDoc(orderRef);
        const orderData = orderSnap.data() || {};
        const friendlyId = orderData.orderId || orderId;
        sendSystemMessage(clientUserId, `Your order ${friendlyId} status updated to "${newStatus}".`);
      } catch (err) {
        console.warn('Status updated, but failed to notify client:', err);
      }
    }
  }
}
