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
  getDoc,
  updateDoc,
  orderBy
} from './auth.js';
import { openChat } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
  let chatsUnsubscribe = null;

  const loginView = document.getElementById('admin-login-view');       // exists in admin.html
  const dashboardView = document.getElementById('admin-dashboard-view'); 
  const unauthorizedView = document.getElementById('unauthorized-view');
  const logoutBtn = document.getElementById('admin-logout-btn');       // ✅ correct ID in admin.html

  // Ensure a clean initial state
  function show(view) {
    loginView.classList.add('hidden');
    dashboardView.classList.add('hidden');
    unauthorizedView.classList.add('hidden');
    view.classList.remove('hidden');
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Not signed in anywhere → back to main site
      window.location.href = 'index.html';
      return;
    }

    try {
      // Check role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;

      if (role !== 'admin') {
        // Signed-in but not admin → send to client portal
        window.location.href = 'orders.html';
        return;
      }

      // ✅ Admin verified: show dashboard directly (no separate login)
      show(dashboardView);

      // Optional: if you want to show their email, add a span with id="admin-email" to admin.html
      // const emailEl = document.getElementById('admin-email');
      // if (emailEl) emailEl.textContent = user.email;

      listenForAllOrders();
      listenForAllChats();
    } catch (err) {
      console.error('Admin role check failed:', err);
      show(unauthorizedView);
    }
  });

  // Logout (admin)
  logoutBtn.addEventListener('click', () => signOut(auth));

  function listenForAllOrders() {
    const ordersListDiv = document.getElementById('all-orders-list');
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    onSnapshot(qOrders, (snapshot) => {
      if (snapshot.empty) {
        ordersListDiv.innerHTML = '<p>No orders found.</p>';
        return;
      }
      ordersListDiv.innerHTML = '';
      snapshot.forEach(docSnap => {
        const order = docSnap.data();
        const el = document.createElement('div');
        el.className = 'order-list-item';
        el.innerHTML = `
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Client:</strong> ${order.clientName} (${order.email})</p>
          <p><strong>Status:</strong> ${order.status}</p>
        `;
        ordersListDiv.appendChild(el);
      });
    });
  }

  function listenForAllChats() {
    const chatsListDiv = document.getElementById('all-chats-list');
    const qChats = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));

    chatsUnsubscribe = onSnapshot(qChats, (snapshot) => {
      if (snapshot.empty) {
        chatsListDiv.innerHTML = '<p>No active chats.</p>';
        return;
      }
      chatsListDiv.innerHTML = '';
      snapshot.forEach(docSnap => {
        const chat = docSnap.data();
        if (chat.userId && chat.userEmail) {
          const el = document.createElement('div');
          el.className = 'chat-list-item';
          el.dataset.userId = chat.userId;
          el.dataset.userEmail = chat.userEmail;
          el.innerHTML = `<p><strong>${chat.userEmail}</strong></p>`;
          chatsListDiv.appendChild(el);
        }
      });
    });
  }

  // Example status updates (wire your buttons with .btn-update-status data attributes)
  document.getElementById('dashboard-container').addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-update-status')) {
      const orderId = e.target.dataset.orderId;
      const newStatus = e.target.dataset.newStatus;
      await updateOrderStatus(orderId, newStatus);
    }
  });

  async function updateOrderStatus(orderId, newStatus) {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      console.log(`Order ${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  }
});