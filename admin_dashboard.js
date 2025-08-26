/**
 * @file Admin dashboard logic for managing orders and chats.
 * @author [Your Name]
 * @version 7.0
 */

// ------------------------
// --- IMPORTS & CONFIG ---
// ------------------------
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
    getDoc
} from './auth.js?=v7';
import { openChat, sendSystemMessage } from './chat.js?=v7';

// Hardcoded Admin User ID
const ADMIN_UID = "mL8wfi0Bgvan5yh9yxCthmEDhJc2";

// ------------------------
// --- DOM ELEMENTS ---
// ------------------------
const ui = {
    views: {
        login: document.getElementById('admin-login-view'),
        dashboard: document.getElementById('admin-dashboard-view'),
        unauthorized: document.getElementById('unauthorized-view'),
    },
    loginForm: document.getElementById('admin-login-form'),
    logoutBtn: document.getElementById('admin-logout-btn'),
    orderList: document.getElementById('all-orders-list'),
    chatList: document.getElementById('all-chats-list'),
    loginEmailInput: document.getElementById('admin-login-email'),
    loginPasswordInput: document.getElementById('admin-login-password'),
    loginError: document.getElementById('admin-auth-error'),
};

// ------------------------
// --- STATE MANAGEMENT ---
// ------------------------
// Use a state object to hold dynamic data and unsubscribe functions.
const state = {
    listeners: {
        orders: null,
        chats: null,
    },
    currentUser: null,
};

// ------------------------
// --- VIEW MANAGEMENT ---
// ------------------------
/**
 * Manages which view is visible on the page.
 * @param {('login'|'dashboard'|'unauthorized'|'none')} viewName - The name of the view to display.
 */
function showView(viewName) {
    Object.values(ui.views).forEach(view => view.classList.add('hidden'));
    if (ui.views[viewName]) {
        ui.views[viewName].classList.remove('hidden');
    }
}

// ---------------------------------
// --- DATA RENDERING FUNCTIONS ---
// ---------------------------------
/**
 * Creates the HTML for a single order item.
 * @param {object} order - The order data from Firestore.
 * @param {string} orderId - The Firestore document ID for the order.
 * @returns {string} The HTML string for the order item.
 */
function createOrderHTML(order, orderId) {
    let actionButtons = '';
    if (order.status === 'Pending Confirmation') {
        actionButtons = `
            <button class="btn btn-approve" data-order-id="${orderId}" data-user-id="${order.userId}">Approve</button>
            <button class="btn btn-reject" data-order-id="${orderId}" data-user-id="${order.userId}">Reject</button>
        `;
    }
    actionButtons += `<button class="btn btn-contact-client" data-user-id="${order.userId}" data-user-email="${order.email}">Contact Client</button>`;

    return `
        <div class="order-item">
            <h4>Order ID: ${order.orderId}</h4>
            <p><strong>Client:</strong> ${order.clientName} (${order.email})</p>
            <p><strong>Contact:</strong> ${order.contactInfo}</p>
            <p><strong>Service:</strong> ${order.serviceType}</p>
            <p><strong>Deliverables:</strong> ${order.deliverables}</p>
            <p><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)} ETB</p>
            <p><strong>Upfront Payment:</strong> ${order.upfrontPayment.toFixed(2)} ETB</p>
            <p><strong>Transaction ID:</strong> ${order.transactionNumber}</p>
            <p><strong>Status:</strong> <span class="status-${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</span></p>
            <p><strong>Description:</strong> ${order.projectDescription}</p>
            <div class="order-actions">${actionButtons}</div>
            <hr>
        </div>
    `;
}

/**
 * Creates the HTML for a single chat list item.
 * @param {object} chat - The chat data from Firestore.
 * @returns {HTMLElement} The created DOM element for the chat item.
 */
function createChatItemElement(chat) {
    const element = document.createElement('div');
    element.className = 'chat-list-item';
    element.dataset.userId = chat.userId;
    element.dataset.userEmail = chat.userEmail;
    element.innerHTML = `
        <p><strong>${chat.userEmail}</strong></p>
        <p>Last update: ${chat.lastUpdate ? new Date(chat.lastUpdate.toDate()).toLocaleString() : 'N/A'}</p>
    `;
    element.addEventListener('click', () => {
        openChat(chat.userId, `Chat with ${chat.userEmail}`);
    });
    return element;
}

// ------------------------------
// --- FIREBASE INTERACTIONS ---
// ------------------------------
/**
 * Sets up a real-time listener for all orders.
 */
function listenForAllOrders() {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    state.listeners.orders = onSnapshot(q, (snapshot) => {
        ui.orderList.innerHTML = "";
        if (snapshot.empty) {
            ui.orderList.innerHTML = '<p>No orders found.</p>';
            return;
        }
        snapshot.forEach(docSnap => {
            const orderHTML = createOrderHTML(docSnap.data(), docSnap.id);
            ui.orderList.insertAdjacentHTML('beforeend', orderHTML);
        });
    });
}

/**
 * Sets up a real-time listener for all conversations.
 */
function listenForAllChats() {
    const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
    state.listeners.chats = onSnapshot(q, (snapshot) => {
        ui.chatList.innerHTML = '';
        if (snapshot.empty) {
            ui.chatList.innerHTML = '<p>No active chats.</p>';
            return;
        }
        snapshot.forEach(docSnap => {
            const chat = docSnap.data();
            if (chat.userId && chat.userEmail) {
                const chatElement = createChatItemElement(chat);
                ui.chatList.appendChild(chatElement);
            }
        });
    }, (error) => {
        console.error("Error listening to chats:", error);
        ui.chatList.innerHTML = `<p class="error-message">Error loading chats. You may need to create a Firestore index.</p>`;
    });
}

/**
 * Updates the status of an order and sends a system message to the client.
 * @param {string} orderId - The Firestore document ID of the order.
 * @param {('Paid'|'Rejected')} newStatus - The new status for the order.
 * @param {string} clientUserId - The UID of the client associated with the order.
 */
async function updateOrderStatus(orderId, newStatus, clientUserId) {
    const orderRef = doc(db, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status: newStatus });
        console.log(`Order ${orderId} status updated to ${newStatus}.`);

        if (clientUserId) {
            const orderSnap = await getDoc(orderRef);
            if (orderSnap.exists()) {
                const orderData = orderSnap.data();
                const message = `Your order with ID ${orderData.orderId} has been updated to: "${newStatus}".`;
                await sendSystemMessage(clientUserId, message);
            }
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        alert("Failed to update order status. Please check the console.");
    }
}

// ------------------------
// --- EVENT HANDLERS ---
// ------------------------
/**
 * Handles the admin login form submission.
 * @param {Event} e - The form submission event.
 */
async function handleAdminLogin(e) {
    e.preventDefault();
    ui.loginError.classList.add('hidden');
    const email = ui.loginEmailInput.value;
    const password = ui.loginPasswordInput.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user.uid !== ADMIN_UID) {
            await signOut(auth); // Sign out non-admin users immediately.
            showView('unauthorized');
        }
    } catch (error) {
        ui.loginError.textContent = `Login failed: ${error.message}`;
        ui.loginError.classList.remove('hidden');
    }
}

/**
 * Handles clicks within the orders list for approving, rejecting, or contacting clients.
 * @param {Event} e - The click event.
 */
async function handleOrderActions(e) {
    const target = e.target;
    const orderId = target.dataset.orderId;
    const userId = target.dataset.userId;
    const userEmail = target.dataset.userEmail;

    if (target.classList.contains('btn-approve') && orderId && userId) {
        await updateOrderStatus(orderId, 'Paid', userId);
    } else if (target.classList.contains('btn-reject') && orderId && userId) {
        await updateOrderStatus(orderId, 'Rejected', userId);
    } else if (target.classList.contains('btn-contact-client') && userId && userEmail) {
        openChat(userId, `Chat with ${userEmail}`);
    }
}

/**
 * Logs out the admin user and cleans up listeners.
 */
function handleAdminLogout() {
    // Unsubscribe from Firestore listeners to prevent memory leaks.
    if (state.listeners.orders) state.listeners.orders();
    if (state.listeners.chats) state.listeners.chats();
    signOut(auth);
}

/**
 * Main handler for authentication state changes.
 * @param {object|null} user - The Firebase user object, or null if logged out.
 */
function onAuthChange(user) {
    state.currentUser = user;
    if (user && user.uid === ADMIN_UID) {
        showView('dashboard');
        listenForAllOrders();
        listenForAllChats();
    } else if (user) {
        showView('unauthorized');
    } else {
        showView('login');
    }
}

// ------------------------
// --- INITIALIZATION ---
// ------------------------
/**
 * Sets up all necessary event listeners for the application.
 */
function initializeEventListeners() {
    ui.loginForm.addEventListener('submit', handleAdminLogin);
    ui.logoutBtn.addEventListener('click', handleAdminLogout);
    ui.orderList.addEventListener('click', handleOrderActions);
}

/**
 * Initializes the application once the DOM is fully loaded.
 */
function main() {
    initializeEventListeners();
    onAuthStateChanged(auth, onAuthChange);
}

document.addEventListener('DOMContentLoaded', main);
