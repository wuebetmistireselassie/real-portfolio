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
  const authError = document.getElementById('auth-error'); // Re-used for order messages
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
    const selectedCurrency = currencySelect.value;
    Array.from(paymentDetailsContainer.children).forEach(child => {
      child.classList.add('hidden');
    });
    const selectedPaymentDiv = document.getElementById(`payment-details-${selectedCurrency}`);
    if (selectedPaymentDiv) {
      selectedPaymentDiv.classList.remove('hidden');
    }
  });

  currencySelect.dispatchEvent(new Event('change'));

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
  
  // New function to show messages to the user instead of alert()
  function showOrderMessage(message, isError = false) {
      const messageEl = document.getElementById('auth-error'); // Reusing the auth error element for simplicity
      messageEl.textContent = message;
      messageEl.style.color = isError ? '#e74c3c' : '#2ecc71'; // Red for error, Green for success
      messageEl.classList.remove('hidden');

      // Hide the message after 5 seconds
      setTimeout(() => {
          messageEl.classList.add('hidden');
      }, 5000);
  }


  function updatePrice() {
    const serviceType = serviceTypeSelect.value;
    const deliveryTime = deliveryTimeSelect.value;
    const deliverables = Array.from(document.querySelectorAll("input[name='deliverables']:checked")).map(cb => cb.value);

    if (!serviceType) {
        totalPriceEl.textContent = "0.00";
        upfrontEl.textContent = "0.00";
        return;
    }
    const totalPrice = calculatePrice(serviceType, deliveryTime, deliverables);
    const upfrontPayment = totalPrice * 0.3;
    totalPriceEl.textContent = totalPrice.toFixed(2);
    upfrontEl.textContent = upfrontPayment.toFixed(2);
  }

  async function handleOrderSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
      showOrderMessage("You must be logged in to place an order.", true);
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    try {
      const clientName = document.getElementById('client-name').value.trim();
      const contactInfo = document.getElementById('contact-info').value.trim();
      const projectDescription = document.getElementById('project-description').value.trim();
      const serviceType = serviceTypeSelect.value;
      
      // --- FORM VALIDATION ---
      if (!clientName || !contactInfo || !projectDescription || !serviceType) {
          showOrderMessage("Please fill out all required fields before submitting.", true);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Order';
          return;
      }

      const deliveryTime = deliveryTimeSelect.value;
      const selectedDeliverables = Array.from(document.querySelectorAll("input[name='deliverables']:checked")).map(cb => cb.value);
      const currency = currencySelect.value;
      const totalPrice = parseFloat(totalPriceEl.textContent);
      const upfrontPayment = parseFloat(upfrontEl.textContent);

      let transactionNumberInput;
      if (currency === 'ETB') {
        transactionNumberInput = document.getElementById('transaction-number');
      } else if (currency === 'USD') {
        transactionNumberInput = document.getElementById('transaction-number-usd');
      } else if (currency === 'CNY') {
        transactionNumberInput = document.getElementById('transaction-number-cny');
      }

      const transactionNumber = transactionNumberInput ? transactionNumberInput.value.trim() : '';

      if (!transactionNumber) {
        showOrderMessage("A valid Transaction ID is required. Please enter it to proceed.", true);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Order';
        return;
      }

      const q = query(collection(db, "orders"), where("transactionNumber", "==", transactionNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        showOrderMessage("This Transaction ID has already been used. Please check the ID.", true);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Order';
        return;
      }

      submitBtn.textContent = 'Submitting...';
      const orderId = `order_${Date.now()}`;

      const orderData = {
        orderId: orderId,
        userId: currentUser.uid,
        email: currentUser.email,
        clientName: clientName,
        contactInfo: contactInfo,
        projectDescription: projectDescription,
        serviceType: serviceType,
        deliveryTime: deliveryTime,
        deliverables: selectedDeliverables,
        totalPrice: totalPrice,
        upfrontPayment: upfrontPayment,
        currency: currency,
        transactionNumber: transactionNumber,
        status: 'Pending Confirmation',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', orderId), orderData);

      await setDoc(doc(db, 'conversations', currentUser.uid), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        lastUpdate: serverTimestamp()
      }, { merge: true });

      showOrderMessage("Order placed successfully! We will review it shortly.", false);
      orderForm.reset();
      updatePrice();
      currencySelect.dispatchEvent(new Event('change'));

    } catch (error) {
      console.error("Order submission error:", error);
      showOrderMessage("Sorry, there was an error submitting your order. Please try again.", true);
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
      snapshot.docs.sort((a, b) => b.data().createdAt - a.data().createdAt).forEach(docSnap => {
        const order = docSnap.data();
        const orderElement = document.createElement('div');
        orderElement.className = 'order-history-item';
        orderElement.innerHTML = `
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Service:</strong> ${order.serviceType}</p>
          <p><strong>Upfront Paid:</strong> ${order.upfrontPayment.toFixed(2)} ${order.currency || 'ETB'}</p>
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
