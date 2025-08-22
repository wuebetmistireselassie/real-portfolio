import {
  auth,
  onAuthStateChanged,
  signOut,
  db,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  serverTimestamp
} from './auth.js';
import { calculatePrice } from './price.js';
import { openChat, sendSystemMessage } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;
  let ordersUnsubscribe = null;

  // --- DOM Elements ---
  const loggedInView = document.getElementById('logged-in-view');
  const loggedOutView = document.getElementById('logged-out-view');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const authError = document.getElementById('auth-error');
  const showLoginTabBtn = document.getElementById('show-login-tab');
  const showSignupTabBtn = document.getElementById('show-signup-tab');
  const loginFormContainer = document.getElementById('login-form-container');
  const signupFormContainer = document.getElementById('signup-form-container');
  const logoutBtn = document.getElementById('logout-btn');
  const userName = document.getElementById('user-name');
  const orderForm = document.getElementById('order-form');
  const generalContactBtn = document.getElementById('general-contact-btn');
  const ordersList = document.getElementById('orders-list');

  // Elements used for pricing
  const serviceTypeSelect = document.getElementById('service-type');
  const deliveryTimeSelect = document.getElementById('delivery-time');
  const deliverablesContainer = document.getElementById('deliverables-container');
  const totalPriceEl = document.getElementById('total-price');
  const upfrontEl = document.getElementById('upfront-payment');

  // --- Auth State Logic ---
  onAuthStateChanged(auth, user => {
    if (user) {
      currentUser = user;
      loggedOutView.classList.add('hidden');
      loggedInView.classList.remove('hidden');
      userName.textContent = user.displayName || user.email;
      listenToClientOrders(user.uid);
    } else {
      currentUser = null;
      loggedInView.classList.add('hidden');
      loggedOutView.classList.remove('hidden');
      if (ordersUnsubscribe) ordersUnsubscribe();
    }
  });

  // --- Event Listeners ---
  showLoginTabBtn.addEventListener('click', () => switchTab('login'));
  showSignupTabBtn.addEventListener('click', () => switchTab('signup'));

  loginForm.addEventListener('submit', handleLogin);
  signupForm.addEventListener('submit', handleSignup);
  logoutBtn.addEventListener('click', () => signOut(auth));

  // Recalculate price on relevant changes
  orderForm.addEventListener('input', updatePrice);
  serviceTypeSelect.addEventListener('change', () => {
    setTimeout(updatePrice, 0);
  });
  deliveryTimeSelect.addEventListener('change', updatePrice);

  deliverablesContainer.addEventListener('change', (e) => {
    if (e.target && e.target.matches('input[type="checkbox"]')) updatePrice();
  });

  orderForm.addEventListener('submit', handleOrderSubmit);
  ordersList.addEventListener('click', handleOrdersListClick);
  generalContactBtn.addEventListener('click', handleGeneralContactClick);

  setTimeout(updatePrice, 0);

  // --- Functions ---
  function switchTab(tabName) {
    if (tabName === 'login') {
      loginFormContainer.classList.remove('hidden');
      signupFormContainer.classList.add('hidden');
      showLoginTabBtn.classList.add('active');
      showSignupTabBtn.classList.remove('active');
    } else {
      signupFormContainer.classList.remove('hidden');
      loginFormContainer.classList.add('hidden');
      showSignupTabBtn.classList.add('active');
      showLoginTabBtn.classList.remove('active');
    }
    authError.classList.add('hidden');
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    signInWithEmailAndPassword(auth, email, password).catch(error => showAuthError(error.message));
  }

  function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    createUserWithEmailAndPassword(auth, email, password).catch(error => showAuthError(error.message));
  }

  function showAuthError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
  }

  // Get selected deliverables as array
  function getSelectedDeliverables() {
    const checked = Array.from(
      deliverablesContainer.querySelectorAll('input[type="checkbox"]:checked')
    );
    return checked.map(cb => cb.value);
  }

  function updatePrice() {
    const serviceType = serviceTypeSelect.value;
    const deliveryTime = deliveryTimeSelect.value;
    const selectedDeliverables = getSelectedDeliverables();

    if (!serviceType || !deliveryTime) {
      totalPriceEl.textContent = (0).toFixed(2);
      upfrontEl.textContent = (0).toFixed(2);
      return;
    }

    // ✅ Pass as array, not joined string
    const totalPrice = calculatePrice(serviceType, deliveryTime, selectedDeliverables);
    const upfrontPayment = totalPrice * 0.3;

    totalPriceEl.textContent = totalPrice.toFixed(2);
    upfrontEl.textContent = upfrontPayment.toFixed(2);
  }

  async function handleOrderSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;

    const selectedDeliverables = getSelectedDeliverables();
    if (selectedDeliverables.length === 0) {
      alert("Please select at least one deliverable.");
      return;
    }

    updatePrice();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    const transactionNumber = document.getElementById('transaction-number').value;
    const q = query(collection(db, "orders"), where("transactionNumber", "==", transactionNumber));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("This Transaction ID has already been used.");
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Order';
      return;
    }

    submitBtn.textContent = 'Submitting...';
    try {
      const orderId = `order_${Date.now()}`;
      await setDoc(doc(db, 'orders', orderId), {
        orderId: orderId,
        userId: currentUser.uid,
        email: currentUser.email,
        clientName: document.getElementById('client-name').value,
        contactInfo: document.getElementById('contact-info').value,
        projectDescription: document.getElementById('project-description').value,
        serviceType: serviceTypeSelect.value,
        deliveryTime: deliveryTimeSelect.value,
        // ✅ Store as array instead of joined string
        deliverables: selectedDeliverables,
        totalPrice: parseFloat(totalPriceEl.textContent),
        upfrontPayment: parseFloat(upfrontEl.textContent),
        transactionNumber: transactionNumber,
        status: 'Pending Confirmation',
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, 'conversations', currentUser.uid), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        lastUpdate: serverTimestamp()
      }, { merge: true });

      alert("Order placed successfully!");
      orderForm.reset();

      deliverablesContainer.innerHTML = '';
      setTimeout(updatePrice, 0);
    } catch (error) {
      console.error("Order submission error:", error);
      alert("There was an error submitting your order.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Order';
    }
  }

  function listenToClientOrders(userId) {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    ordersUnsubscribe = onSnapshot(q, (snapshot) => {
      const ordersContainer = document.getElementById('orders-list');
      if (snapshot.empty) {
        ordersContainer.innerHTML = '<h3>My Orders</h3><p>You have no previous orders.</p>';
        return;
      }
      ordersContainer.innerHTML = '<h3>My Orders</h3>';
      snapshot.forEach(docSnap => {
        const order = docSnap.data();
        const orderElement = document.createElement('div');
        orderElement.className = 'order-history-item';
        orderElement.innerHTML = `
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Service:</strong> ${order.serviceType}</p>
          <p><strong>Upfront Paid:</strong> ETB ${Number(order.upfrontPayment || 0).toFixed(2)}</p>
          <p><strong>Status:</strong> <span class="status-${String(order.status || '').toLowerCase().replace(/ /g, '-')}">${order.status}</span></p>
          <button class="btn btn-contact-designer" data-order-id="${order.orderId}">Contact Designer</button>
        `;
        ordersContainer.appendChild(orderElement);
      });
    });
  }

  async function handleOrdersListClick(e) {
    if (e.target.classList.contains('btn-contact-designer')) {
      if (!currentUser) return;
      const orderId = e.target.dataset.orderId;
      const chatTitle = `Regarding Order: ${orderId}`;
      await openChat(currentUser.uid, chatTitle);
      await sendSystemMessage(currentUser.uid, `--- Regarding Order: ${orderId} ---`);
    }
  }

  async function handleGeneralContactClick() {
    if (!currentUser) return;
    await openChat(currentUser.uid, `Chat with ${currentUser.email}`);
  }
});
