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
  where,
} from './auth.js';
import { openChat, sendSystemMessage } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
  const ADMIN_UID = "mL8wfi0Bgvan5yh9yxCthmEDhJc2"; 
  let ordersUnsubscribe = null;
  let chatsUnsubscribe = null;

  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const unauthorizedView = document.getElementById('unauthorized-view');
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const authError = document.getElementById('admin-auth-error');

  onAuthStateChanged(auth, user => {
    if (user) {
      if (user.uid === ADMIN_UID) {
        loginView.classList.add('hidden');
        unauthorizedView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        listenForAllOrders();
        listenForClientChats();
      } else {
        loginView.classList.add('hidden');
        dashboardView.classList.add('hidden');
        unauthorizedView.classList.remove('hidden');
        if (ordersUnsubscribe) ordersUnsubscribe();
        if (chatsUnsubscribe) chatsUnsubscribe();
      }
    } else {
      dashboardView.classList.add('hidden');
      unauthorizedView.classList.add('hidden');
      loginView.classList.remove('hidden');
      if (ordersUnsubscribe) ordersUnsubscribe();
      if (chatsUnsubscribe) chatsUnsubscribe();
    }
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-login-email').value;
    const password = document.getElementById('admin-login-password').value;
    signInWithEmailAndPassword(auth, email, password)
      .catch(error => {
        authError.textContent = error.message;
        authError.classList.remove('hidden');
      });
  });

  logoutBtn.addEventListener('click', () => signOut(auth));

  function listenForAllOrders() {
    const ordersListDiv = document.getElementById('all-orders-list');
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    ordersUnsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        ordersListDiv.innerHTML = '<p>There are currently no orders.</p>';
        return;
      }
      ordersListDiv.innerHTML = '';
      snapshot.forEach(docSnap => {
        const order = docSnap.data();
        const orderElement = document.createElement('div');
        orderElement.className = 'order-history-item admin-order-item';
        
        let actionButtons = '';
        if (order.status === 'Pending Confirmation') {
          actionButtons = `
            <button class="btn btn-approve" data-order-id="${order.orderId}" data-client-uid="${order.userId}">Approve</button>
            <button class="btn btn-reject" data-order-id="${order.orderId}" data-client-uid="${order.userId}">Reject</button>
          `;
        }

        orderElement.innerHTML = `
          <div class="order-details-grid">
            <p><strong>Client Name:</strong> ${order.clientName || 'N/A'}</p>
            <p><strong>Contact Email:</strong> ${order.email || 'N/A'}</p>
            <p><strong>Contact Info:</strong> ${order.contactInfo || 'N/A'}</p>
            <p><strong>Service:</strong> ${order.serviceType}</p>
            <p><strong>Transaction ID:</strong> ${order.transactionNumber}</p>
            <p><strong>Status:</strong> <span class="status-${(order.status || '').toLowerCase().replace(/ /g, '-')}">${order.status}</span></p>
          </div>
          <p><strong>Project Description:</strong></p>
          <p class="project-description-box">${order.projectDescription || 'N/A'}</p>
          <p><strong>Final Deliverables:</strong> ${order.deliverables}</p>
          <div class="admin-actions">
            ${actionButtons}
            <button class="btn btn-chat" data-client-uid="${order.userId}" data-order-id="${order.orderId}">Contact Client / View Chat</button>
          </div>
        `;
        ordersListDiv.appendChild(orderElement);
      });
    }, (error) => {
      console.error("Error fetching admin orders:", error);
      ordersListDiv.innerHTML = '<p class="error-message">Error loading orders. The required database index is likely missing.</p>';
    });
  }

  function listenForClientChats() {
    const chatsListDiv = document.getElementById('all-chats-list');
    const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
    
    chatsUnsubscribe = onSnapshot(q, (snapshot) => {
      chatsListDiv.innerHTML = '';
      if (snapshot.empty) {
        chatsListDiv.innerHTML = '<p>No client chats found.</p>';
        return;
      }
      snapshot.forEach(docSnap => {
        const chat = docSnap.data();
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-summary-item';
        chatElement.innerHTML = `
          <p><strong>Client:</strong> ${chat.userEmail}</p>
          <button class="btn btn-chat-summary" data-client-uid="${chat.userId}">Open Chat</button>
        `;
        chatsListDiv.appendChild(chatElement);
      });
    });
  }

  document.getElementById('all-orders-list').addEventListener('click', async (e) => {
    const orderId = e.target.dataset.orderId;
    const clientUid = e.target.dataset.clientUid;

    if (e.target.classList.contains('btn-approve')) {
      await updateOrderStatus(orderId, 'Paid', clientUid);
    } else if (e.target.classList.contains('btn-reject')) {
      await updateOrderStatus(orderId, 'Rejected', clientUid);
    } else if (e.target.classList.contains('btn-chat')) {
      const chatTitle = `Regarding Order: ${orderId}`;
      await openChat(clientUid, chatTitle);
      await sendSystemMessage(clientUid, `--- Admin is now viewing the chat regarding Order: ${orderId} ---`);
    }
  });

  document.getElementById('all-chats-list').addEventListener('click', async (e) => {
    const clientUid = e.target.dataset.clientUid;
    if (e.target.classList.contains('btn-chat-summary') && clientUid) {
      const chatTitle = `Chat with client: ${clientUid}`; // You might want to get the user's email here instead
      await openChat(clientUid, chatTitle);
      await sendSystemMessage(clientUid, '--- Admin has joined the chat ---');
    }
  });

  async function updateOrderStatus(orderId, newStatus, clientUid) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      const statusMessage = `Your order #${orderId} has been ${newStatus.toLowerCase()}.`;
      await sendSystemMessage(clientUid, statusMessage);

      // You can also open the chat automatically here if you want to
      // const chatTitle = `Regarding Order: ${orderId}`;
      // await openChat(clientUid, chatTitle);
      // await sendSystemMessage(clientUid, `--- Admin has updated the status of order #${orderId} to "${newStatus}" ---`);
      
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please check the console for details.");
    }
  }
});
