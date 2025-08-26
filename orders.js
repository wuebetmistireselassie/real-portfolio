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

  // New DOM elements for new features
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

  // Initially trigger the currency change to set the correct payment details on page load
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

  /**
   * Handles the entire order submission process.
   * This function is triggered when the user clicks the "Submit Order" button.
   */
  async function handleOrderSubmit(e) {
    // 1. Prevent the default browser action of submitting the form, which would reload the page.
    e.preventDefault();
    
    // 2. Ensure a user is logged in before proceeding.
    if (!currentUser) {
      alert("You must be logged in to place an order.");
      return;
    }

    // 3. Get the submit button and disable it to prevent accidental multiple submissions.
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    try {
      // 4. Gather all the data from the form fields.
      const clientName = document.getElementById('client-name').value;
      const contactInfo = document.getElementById('contact-info').value;
      const projectDescription = document.getElementById('project-description').value;
      const serviceType = serviceTypeSelect.value;
      const deliveryTime = deliveryTimeSelect.value;
      const selectedDeliverables = Array.from(document.querySelectorAll("input[name='deliverables']:checked")).map(cb => cb.value);
      const currency = currencySelect.value;
      const totalPrice = parseFloat(totalPriceEl.textContent);
      const upfrontPayment = parseFloat(upfrontEl.textContent);

      // 5. Determine which transaction number input to use based on the selected currency.
      let transactionNumberInput;
      if (currency === 'ETB') {
        transactionNumberInput = document.getElementById('transaction-number');
      } else if (currency === 'USD') {
        transactionNumberInput = document.getElementById('transaction-number-usd');
      } else if (currency === 'CNY') {
        transactionNumberInput = document.getElementById('transaction-number-cny');
      }

      const transactionNumber = transactionNumberInput ? transactionNumberInput.value.trim() : '';

      // 6. Validate the transaction number - it must not be empty.
      if (!transactionNumber) {
        alert("A valid Transaction ID is required. Please enter it to proceed.");
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Order';
        return;
      }

      // 7. Check if this transaction ID has already been used for another order to prevent duplicates.
      const q = query(collection(db, "orders"), where("transactionNumber", "==", transactionNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("This Transaction ID has already been used. Please check the ID or contact support if you believe this is an error.");
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Order';
        return;
      }

      // 8. If all checks pass, update the button text and proceed to create the order.
      submitBtn.textContent = 'Submitting...';
      const orderId = `order_${Date.now()}`;

      // 9. Create the order data object to be saved in Firestore.
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
        // Set the initial status to 'Pending Confirmation' as required.
        status: 'Pending Confirmation',
        createdAt: serverTimestamp()
      };

      // 10. Save the new order to the 'orders' collection in Firestore.
      await setDoc(doc(db, 'orders', orderId), orderData);

      // 11. Create or update the conversation record for this user.
      await setDoc(doc(db, 'conversations', currentUser.uid), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        lastUpdate: serverTimestamp()
      }, { merge: true });

      // 12. Notify the user of success and reset the form for a new order.
      alert("Order placed successfully! We will review it shortly. You can see its status in the 'My Orders' section.");
      orderForm.reset();
      updatePrice(); // Reset the price display
      currencySelect.dispatchEvent(new Event('change')); // Reset the payment details display

    } catch (error) {
      // 13. If any error occurs during the process, log it and notify the user.
      console.error("Order submission error:", error);
      alert("Sorry, there was an error submitting your order. Please try again or contact support.");
    } finally {
      // 14. No matter what happens (success or error), re-enable the submit button.
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
