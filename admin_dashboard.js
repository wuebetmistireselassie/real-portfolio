// admin_dashboard.js
// Full-featured admin dashboard glue for your admin.html + chat.js
// Fixes: persistent admin-login issue, order status updates (persist + UI), contact-client chat opening (tied to order & shows upload progress)

import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp
} from './auth.js';

import { openChat, sendSystemMessage } from './chat.js';

/* ===========================
   Configuration & State
   =========================== */
const ADMIN_UID = 'mL8wfi0Bgvan5yh9yxCthmEDhJc2'; // keep this or remove if you use roles in Firestore

let currentUser = null;
let isAdminUser = false;
let initialAuthChecked = false;

// Active Firestore unsubscribes
let ordersUnsubscribe = null;
let chatsUnsubscribe = null;

// Cached DOM elements (populated when DOM ready)
let el = {
  adminLoginView: null,
  adminDashboardView: null,
  adminLoginForm: null,
  adminLogoutBtn: null,
  allOrdersList: null,
  allChatsList: null,
  unauthorizedView: null,
  adminAuthError: null,
  adminLoginEmail: null,
  adminLoginPassword: null
};

/* ===========================
   Utility helpers
   =========================== */

function $id(id) { return document.getElementById(id); }

function safeText(v) {
  if (v === undefined || v === null) return '';
  return String(v);
}

function money(value, currency) {
  const n = Number(value);
  if (!Number.isFinite(n)) return safeText(value);
  return `${n.toFixed(2)} ${currency || ''}`.trim();
}

function clearUnsubscribes() {
  if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
  if (chatsUnsubscribe) { chatsUnsubscribe(); chatsUnsubscribe = null; }
}

/* ===========================
   Admin role check
   - We accept either:
     1) matching ADMIN_UID (hardcoded)
     2) a Firestore user document: users/{uid}.role === 'admin'
   This gives flexibility: you can remove ADMIN_UID and manage admin role via Firestore.
   =========================== */
async function checkIfAdmin(user) {
  if (!user) return false;
  // fast path: explicit UID
  if (user.uid === ADMIN_UID) return true;

  // try Firestore role check
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data && data.role === 'admin') return true;
    }
  } catch (err) {
    console.warn('Failed to read user role from Firestore:', err);
    // Fall-through to not grant admin if Firestore lookup fails
  }
  return false;
}

/* ===========================
   Render / UI helpers
   These functions read DOM elements lazily and update visibility.
   =========================== */

function cacheDOM() {
  // populate el.* only once when DOM ready
  el.adminLoginView = $id('admin-login-view');
  el.adminDashboardView = $id('admin-dashboard-view');
  el.adminLoginForm = $id('admin-login-form');
  el.adminLogoutBtn = $id('admin-logout-btn');
  el.allOrdersList = $id('all-orders-list');
  el.allChatsList = $id('all-chats-list');
  el.unauthorizedView = $id('unauthorized-view');
  el.adminAuthError = $id('admin-auth-error');
  el.adminLoginEmail = $id('admin-login-email');
  el.adminLoginPassword = $id('admin-login-password');
}

function showLoginView() {
  if (!el.adminLoginView) return;
  el.adminLoginView.classList.remove('hidden');
  el.unauthorizedView?.classList.add('hidden');
  el.adminDashboardView?.classList.add('hidden');
}

function showUnauthorizedView() {
  if (!el.unauthorizedView) return;
  el.unauthorizedView.classList.remove('hidden');
  el.adminLoginView?.classList.add('hidden');
  el.adminDashboardView?.classList.add('hidden');
  clearUnsubscribes();
}

function showDashboardView() {
  if (!el.adminDashboardView) return;
  el.adminDashboardView.classList.remove('hidden');
  el.adminLoginView?.classList.add('hidden');
  el.unauthorizedView?.classList.add('hidden');
}

/* ===========================
   Auth state handling (runs immediately)
   - onAuthStateChanged is registered at module import time so it triggers
     as soon as Firebase can report state (no race with DOM).
   - We do a role check and then call render logic which will safely wait for DOM if needed.
   =========================== */

onAuthStateChanged(auth, async (user) => {
  currentUser = user || null;
  try {
    isAdminUser = await checkIfAdmin(currentUser);
  } catch (err) {
    console.error('Error checking admin status:', err);
    isAdminUser = false;
  }
  initialAuthChecked = true;
  // Attempt to render UI now — renderUI will be safe if DOM not yet ready.
  renderUI();
});

/* ===========================
   DOM ready initialization
   - Hook up event listeners (login form, logout, delegated clicks)
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();

  // Re-apply UI now that DOM is available
  renderUI();

  // Login form submit
  el.adminLoginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    el.adminAuthError?.classList.add('hidden');

    const email = el.adminLoginEmail?.value?.trim() || '';
    const password = el.adminLoginPassword?.value || '';

    if (!email || !password) {
      if (el.adminAuthError) {
        el.adminAuthError.textContent = 'Please enter email and password.';
        el.adminAuthError.classList.remove('hidden');
      }
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will fire and handle role check & UI
    } catch (err) {
      console.error('Admin login failed:', err);
      if (el.adminAuthError) {
        el.adminAuthError.textContent = 'Login failed: ' + (err?.message || String(err));
        el.adminAuthError.classList.remove('hidden');
      }
    }
  });

  // Logout
  el.adminLogoutBtn?.addEventListener('click', async () => {
    try {
      clearUnsubscribes();
      await signOut(auth);
      // onAuthStateChanged will update UI
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Logout failed. See console for details.');
    }
  });

  // Delegated event listener for Orders actions (Approve, Reject, Contact)
  // This uses event delegation (closest('button')) so clicks on inner elements still work.
  el.allOrdersList?.addEventListener('click', async (e) => {
    const btn = e.target instanceof Element ? e.target.closest('button') : null;
    if (!btn) return;

    const orderId = btn.dataset.orderId || btn.getAttribute('data-order-id') || '';
    const userId = btn.dataset.userId || btn.getAttribute('data-user-id') || '';
    const action = btn.dataset.action || btn.getAttribute('data-action') || '';

    // Buttons may use class names instead of data-action; support both.
    const isApprove = btn.classList.contains('btn-approve') || action === 'approve';
    const isReject = btn.classList.contains('btn-reject') || action === 'reject';
    const isContact = btn.classList.contains('btn-contact-client') || action === 'contact';

    try {
      if (isContact) {
        // Ensure we pass both userId (chat/conversation id) and link conversation to the order
        if (!userId) {
          console.warn('Contact clicked but userId missing for order:', orderId);
          alert('Client ID missing — cannot open chat.');
          return;
        }
        // Link the conversation to this order (so client sees it's tied to order)
        try {
          await setDoc(doc(db, 'conversations', userId), { lastOrderId: orderId, lastUpdate: serverTimestamp() }, { merge: true });
        } catch (err) {
          console.warn('Failed to set lastOrderId on conversation (not fatal):', err);
        }
        // Open chat modal via chat.js (chatId == userId in your chat.js design)
        openChat(userId, `Chat for Order ${orderId}`);
        return;
      }

      if (isApprove || isReject) {
        if (!orderId) {
          console.warn('Approve/Reject clicked but orderId missing');
          return;
        }
        const newStatus = isApprove ? 'Paid' : 'Rejected';

        // Optimistic UI: change status text immediately for snappier UX
        const orderItem = btn.closest('.order-item');
        const statusSpan = orderItem?.querySelector('.order-status');
        if (statusSpan) {
          statusSpan.textContent = newStatus;
          statusSpan.className = `order-status status-${newStatus.toLowerCase().replace(/\s+/g, '-')}`;
        }

        // Persist to Firestore and notify client
        await updateOrderStatus(orderId, newStatus, userId);
      }
    } catch (err) {
      console.error('Error handling order action:', err);
      alert('An error occurred. Check console for details.');
    }
  });
});

/* ===========================
   High-level UI render (uses currentUser & isAdminUser)
   - Will not throw if DOM not ready: it bails gracefully and re-runs after DOMContentLoaded.
   =========================== */
function renderUI() {
  // Wait for initial auth check to avoid flicker: if not yet checked, do nothing.
  if (!initialAuthChecked && document.readyState !== 'complete' && document.readyState !== 'interactive') {
    // If DOM not ready and auth not resolved, wait. onAuthStateChanged will call renderUI when ready.
    return;
  }

  // Ensure DOM is cached
  if (!el.adminLoginView) cacheDOM();

  // If DOM still not available, bail — DOMContentLoaded will call renderUI again.
  if (!el.adminLoginView || !el.adminDashboardView || !el.unauthorizedView) {
    return;
  }

  if (!currentUser) {
    // No signed-in user: show login
    clearUnsubscribes();
    showLoginView();
    return;
  }

  // If signed-in user, check admin
  if (isAdminUser) {
    showDashboardView();
    // Start listeners if not already started
    if (!ordersUnsubscribe) listenForAllOrders();
    if (!chatsUnsubscribe) listenForAllChats();
  } else {
    // Signed-in but not admin
    clearUnsubscribes();
    showUnauthorizedView();
  }
}

/* ===========================
   Orders: Real-time listener + renderer
   =========================== */

function listenForAllOrders() {
  // guard
  if (!el.allOrdersList) {
    el.allOrdersList = $id('all-orders-list');
    if (!el.allOrdersList) return;
  }

  // Build query: all orders ordered by createdAt desc
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  // unsubscribe previous if present
  if (ordersUnsubscribe) {
    ordersUnsubscribe();
    ordersUnsubscribe = null;
  }

  ordersUnsubscribe = onSnapshot(q, (snapshot) => {
    // Clear list
    el.allOrdersList.innerHTML = '';

    if (snapshot.empty) {
      el.allOrdersList.innerHTML = '<p>No orders found.</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const order = docSnap.data() || {};
      const id = docSnap.id;
      const node = buildOrderNode(order, id);
      el.allOrdersList.appendChild(node);
    });
  }, (error) => {
    console.error('Orders listener error:', error);
    el.allOrdersList.innerHTML = `<p class="error-message">Error loading orders.</p>`;
  });
}

function buildOrderNode(order, docId) {
  const container = document.createElement('div');
  container.className = 'order-item';
  container.dataset.docId = docId;

  // Normalize fields safely
  const orderIdDisplay = safeText(order.orderId || docId);
  const clientName = safeText(order.clientName || '');
  const clientEmail = safeText(order.email || order.clientEmail || '');
  const contactInfo = safeText(order.contactInfo || '');
  const serviceType = safeText(order.serviceType || '');
  const deliverables = Array.isArray(order.deliverables) ? order.deliverables.join(', ') : safeText(order.deliverables || '');
  const totalPrice = money(order.totalPrice, order.currency);
  const upfront = money(order.upfrontPayment, order.currency);
  const transactionNumber = safeText(order.transactionNumber || '');
  const status = safeText(order.status || 'Pending Confirmation');
  const desc = safeText(order.projectDescription || '');
  const userId = safeText(order.userId || order.clientId || '');

  // status css-safe class
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');

  // Build action buttons: Approve/Reject only if Pending Confirmation (or you can customize)
  let actionButtons = '';
  if (status === 'Pending Confirmation' || status === 'Pending') {
    actionButtons = `
      <button class="btn btn-approve" data-action="approve" data-order-id="${docId}" data-user-id="${userId}">Approve</button>
      <button class="btn btn-reject" data-action="reject" data-order-id="${docId}" data-user-id="${userId}">Reject</button>
    `;
  }

  actionButtons += `<button class="btn btn-contact-client" data-action="contact" data-order-id="${docId}" data-user-id="${userId}" data-user-email="${clientEmail}">Contact Client</button>`;

  container.innerHTML = `
    <h4>Order ID: ${orderIdDisplay}</h4>
    <p><strong>Client:</strong> ${clientName} (${clientEmail})</p>
    <p><strong>Contact:</strong> ${contactInfo}</p>
    <p><strong>Service:</strong> ${serviceType}</p>
    <p><strong>Deliverables:</strong> ${deliverables}</p>
    <p><strong>Total Price:</strong> ${totalPrice}</p>
    <p><strong>Upfront Payment:</strong> ${upfront}</p>
    <p><strong>Transaction ID:</strong> ${transactionNumber}</p>
    <p><strong>Status:</strong> <span class="order-status status-${statusClass}">${status}</span></p>
    <p><strong>Description:</strong> ${desc}</p>
    <div class="order-actions">${actionButtons}</div>
    <hr>
  `;

  return container;
}

/* ===========================
   Update order status (persist + notify)
   - Ensures Firestore is updated and client gets a system message.
   - Also sets conversation.lastOrderId so chat shows order context.
   =========================== */

async function updateOrderStatus(orderDocId, newStatus, clientUserId) {
  if (!orderDocId) throw new Error('updateOrderStatus called without orderDocId');

  try {
    const orderRef = doc(db, 'orders', orderDocId);
    // persist status and updatedAt
    await updateDoc(orderRef, { status: newStatus, updatedAt: serverTimestamp() });

    // If we have a clientUserId, update conversation meta & send system message
    if (clientUserId) {
      try {
        // attach lastOrderId to conversation for context
        await setDoc(doc(db, 'conversations', clientUserId), { lastOrderId: orderDocId, lastUpdate: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('Failed updating conversation meta (non-fatal):', err);
      }

      // Fetch order friendly ID (if available) for message text
      let friendly = orderDocId;
      try {
        const snap = await getDoc(orderRef);
        if (snap.exists()) {
          const o = snap.data();
          if (o && o.orderId) friendly = o.orderId;
        }
      } catch (err) {
        /* ignore - we still notify with doc id */
      }

      const sysText = `Your order (ID: ${friendly}) status has been updated to: "${newStatus}".`;
      // sendSystemMessage is from chat.js and creates a system message in conversation/{clientUserId}/messages
      await sendSystemMessage(clientUserId, sysText);
    }

    console.log(`Order ${orderDocId} updated to ${newStatus}`);
  } catch (err) {
    console.error('Failed to update order status:', err);
    throw err;
  }
}

/* ===========================
   Chats: Real-time listener
   - Shows list of conversation documents (conversations collection)
   =========================== */
function listenForAllChats() {
  if (!el.allChatsList) {
    el.allChatsList = $id('all-chats-list');
    if (!el.allChatsList) return;
  }

  // Query conversations ordered by lastUpdate
  const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));

  if (chatsUnsubscribe) {
    chatsUnsubscribe();
    chatsUnsubscribe = null;
  }

  chatsUnsubscribe = onSnapshot(q, (snapshot) => {
    el.allChatsList.innerHTML = '';

    if (snapshot.empty) {
      el.allChatsList.innerHTML = '<p>No active chats.</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const convo = docSnap.data() || {};
      const id = docSnap.id;
      // userId stored in conversation doc as 'userId' in chat.js; fallback to doc id
      const userId = convo.userId || id;
      const userEmail = safeText(convo.userEmail || convo.email || '');
      const lastOrderId = convo.lastOrderId ? ` (Order: ${convo.lastOrderId})` : '';
      const lastUpdateText = convo.lastUpdate && convo.lastUpdate.toDate ? convo.lastUpdate.toDate().toLocaleString() : '';

      const row = document.createElement('div');
      row.className = 'chat-list-item';
      row.dataset.userId = userId;
      row.dataset.userEmail = userEmail;
      row.innerHTML = `
        <p><strong>${userEmail || id}</strong> ${lastOrderId}</p>
        <p class="small">Last: ${lastUpdateText || 'N/A'}</p>
        <button class="btn btn-open-chat" data-user-id="${userId}" data-user-email="${userEmail}">Open Chat</button>
      `;

      // button event
      row.querySelector('.btn-open-chat')?.addEventListener('click', (ev) => {
        const b = ev.currentTarget;
        const uid = b.dataset.userId;
        const uemail = b.dataset.userEmail || `Chat with ${uid}`;
        // open chat via chat.js
        openChat(uid, `Chat with ${uemail}`);
      });

      el.allChatsList.appendChild(row);
    });
  }, (error) => {
    console.error('Chats listener error:', error);
    el.allChatsList.innerHTML = `<p class="error-message">Error loading chats.</p>`;
  });
}

/* ===========================
   Final safeguard: if renderUI determined admin should see dashboard,
   ensure listeners are started. If not, stop them.
   Called by onAuthStateChanged and initial DOM ready.
   =========================== */
function ensureListenersState() {
  if (currentUser && isAdminUser) {
    if (!ordersUnsubscribe) listenForAllOrders();
    if (!chatsUnsubscribe) listenForAllChats();
  } else {
    clearUnsubscribes();
  }
}

/* ===========================
   Tie it together: re-run ensureListenersState whenever renderUI completes.
   =========================== */

// Slightly delayed ensure to allow immediate UI text updates to finish
const _ensureListenersDebounced = () => setTimeout(ensureListenersState, 50);

// Call debounced ensure whenever renderUI might have changed things
const originalRenderUI = renderUI;
renderUI = function () {
  originalRenderUI();
  _ensureListenersDebounced();
};

// If the module was imported after DOMContentLoaded, run a render pass now anyway.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // Cache DOM and apply current auth state
  cacheDOM();
  renderUI();
}