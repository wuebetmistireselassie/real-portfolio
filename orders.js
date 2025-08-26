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
  const serviceTypeSelect = document.getElementById('service-type');
  const deliveryTimeSelect = document.getElementById('delivery-time');
  const totalPriceEl = document.getElementById('total-price');
  const upfrontEl = document.getElementById('upfront-payment');
  const togglePlatformsBtn = document.getElementById('toggle-platforms-btn');
  const orderFormContainer = document.getElementById('order-form-container');
  const platformOptions = document.getElementById('platform-options');
  const currencySelect = document.getElementById('currency-select');
  const paymentDetailsContainer = document.getElementById('payment-details-container');
  const feedbackEl = document.getElementById('order-feedback');

  // --- Helpers ---
  function showFeedback(message, type = 'success') {
    if (!feedbackEl) { alert(message); return; }
    feedbackEl.textContent = message;
    feedbackEl.classList.remove('hidden', 'success', 'error');
    feedbackEl.classList.add(type === 'success' ? 'success' : 'error');
    feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function clearFeedback() {
    if (!feedbackEl) return;
    feedbackEl.classList.add('hidden');
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('success', 'error');
  }

  function toggleTxnFieldsForCurrency(selectedCurrency) {
    Array.from(paymentDetailsContainer.children).forEach(child => {
      child.classList.add('hidden');
      const input = child.querySelector('input[type="text"]');
      if (input) {
        input.disabled = true;
        input.required = false;
      }
    });
    const selectedPaymentDiv = document.getElementById(`payment-details-${selectedCurrency}`);
    if (selectedPaymentDiv) {
      selectedPaymentDiv.classList.remove('hidden');
      const input = selectedPaymentDiv.querySelector('input[type="text"]');
      if (input) {
        input.disabled = false;
        input.required = true;
      }
    }
  }

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

  function updatePrice() {
    const serviceType = serviceTypeSelect.value;
    const deliveryTime = deliveryTimeSelect.value;
    const deliverables = Array.from(document.querySelectorAll("input[name='deliverables']:checked")).map(cb => cb.value);

    if (!serviceType || !deliveryTime) return;
    const totalPrice = calculatePrice(serviceType, deliveryTime, deliverables);
    const upfrontPayment = totalPrice * 0.3;
    totalPriceEl.textContent = totalPrice.toFixed(2);
    upfrontEl.textContent = upfrontPayment.toFixed(2);
  }

  async function handleOrderSubmit(e) {
    e.preventDefault();
    clearFeedback();

    if (!currentUser) {
      showFeedback('Please sign in to place an order.', 'error');
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    if (!orderForm.checkValidity()) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Order';
      orderForm.reportValidity();
      showFeedback('Please fill out all required fields.', 'error');
      return;
    }

    const selectedCurrency = currencySelect.value;
    let transactionNumberInput;
    if (selectedCurrency === 'ETB') {
      transactionNumberInput = document.getElementById('transaction-number');
    } else if (selectedCurrency === 'USD') {
      transactionNumberInput = document.getElementById('transaction-number-usd');
    } else if (selectedCurrency === 'CNY') {
      transactionNumberInput = document.getElementById('transaction-number-cny');
    }

    const transactionNumber = transactionNumberInput ? transactionNumberInput.value.trim() : '';

    if (!transactionNumber) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Order';
      showFeedback('Please enter the Transaction ID for your upfront payment.', 'error');
      return;
    }

    try {
      const qDup = query(collection(db, 'orders'), where('transactionNumber', '==', transactionNumber));
      const dupSnap = await getDocs(qDup);
      if (!dupSnap.empty) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Order';
        showFeedback('This Transaction ID has already been used. Please double-check and try again.', 'error');
        return;
      }
    } catch (err) {
      console.error('Duplicate check failed:', err);
    }

    const selectedDeliverables = Array.from(document.querySelectorAll("input[name='deliverables']:checked")).map(cb => cb.value);

    submitBtn.textContent = 'Submitting...';
    try {
      const orderId = `order_${Date.now()}`;
      await setDoc(doc(db, 'orders', orderId), {
        orderId,
        userId: currentUser.uid,
        email: currentUser.email,
        clientName: document.getElementById('client-name').value.trim(),
        contactInfo: document.getElementById('contact-info').value.trim(),
        projectDescription: document.getElementById('project-description').value.trim(),
        serviceType: serviceTypeSelect.value,
        deliveryTime: deliveryTimeSelect.value,
        deliverables: selectedDeliverables,
        totalPrice: parseFloat(totalPriceEl.textContent),
        upfrontPayment: parseFloat(upfrontEl.textContent),
        currency: selectedCurrency,
        transactionNumber,
        status: 'Pending Confirmation',
        createdAt: serverTimestamp()
      });

      await setDoc(
        doc(db, 'conversations', currentUser.uid),
        { userId: currentUser.uid, userEmail: currentUser.email, lastUpdate: serverTimestamp() },
        { merge: true }
      );

      showFeedback('Order placed successfully! Scroll down to view it in "My Orders".', 'success');
      orderForm.reset();
      toggleTxnFieldsForCurrency(currencySelect.value);
    } catch (error) {
      console.error('Order submission error:', error);
      showFeedback('There was an error submitting your order. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Order';
    }
  }

  function listenToClientOrders(userId) {
    const qOrders = query(collection(db, 'orders'), where('userId', '==', userId));
    ordersUnsubscribe = onSnapshot(qOrders, (snapshot) => {
      const ordersContainer = document.getElementById('orders-list');
      if (snapshot.empty) {
        ordersContainer.innerHTML = '<h3>My Orders</h3><p>You have no previous orders.</p>';
        return;
      }
      ordersContainer.innerHTML = '<h3>My Orders</h3>';
      snapshot.forEach(docSnap => {
        const order = docSnap.data();
        const statusClass = String(order.status || '').toLowerCase().replace(/ /g, '-');
        const statusText = order.status === 'Pending Confirmation'
          ? '<span style="color:#d97706;font-weight:600;">Pending Confirmation</span>'
          : `<span class="status-${statusClass}">${order.status}</span>`;

        const orderElement = document.createElement('div');
        orderElement.className = 'order-history-item';
        orderElement.innerHTML = `
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Service:</strong> ${order.serviceType}</p>
          <p><strong>Upfront Paid:</strong> ${order.upfrontPayment} ${order.currency || 'ETB'}</p>
          <p><strong>Status:</strong> ${statusText}</p>
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

  showLoginTabBtn.addEventListener('click', () => switchTab('login'));
  showSignupTabBtn.addEventListener('click', () => switchTab('signup'));
  loginForm.addEventListener('submit', handleLogin);
  signupForm.addEventListener('submit', handleSignup);
  logoutBtn.addEventListener('click', () => signOut(auth));
  orderForm.addEventListener('input', updatePrice);
  orderForm.addEventListener('submit', handleOrderSubmit);
  ordersList.addEventListener('click', handleOrdersListClick);
  generalContactBtn.addEventListener('click', handleGeneralContactClick);
  togglePlatformsBtn.addEventListener('click', () => {
    const isOrderFormVisible = !orderFormContainer.classList.contains('hidden');
    if (isOrderFormVisible) {
      orderFormContainer.classList.add('hidden');
      platformOptions.classList.remove('hidden');
      togglePlatformsBtn.textContent = 'Go back to direct order form';
    } else {
      orderFormContainer.classList.remove('hidden');
      platformOptions.classList.add('hidden');
      togglePlatformsBtn.textContent = 'Prefer to order on a platform?';
    }
  });
  currencySelect.addEventListener('change', () => {
    toggleTxnFieldsForCurrency(currencySelect.value);
  });
  toggleTxnFieldsForCurrency(currencySelect.value);
});
