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
    signInWithEmailAndPassword
} from './auth.js';
// Import the openChat function from chat.js
import { openChat } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_UID = "mL8wfi0Bgvan5yh9yxCthmEDhJc2"; // Make sure this is your actual Admin User ID
    let ordersUnsubscribe = null;

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
            } else {
                loginView.classList.add('hidden');
                dashboardView.classList.add('hidden');
                unauthorizedView.classList.remove('hidden');
            }
        } else {
            dashboardView.classList.add('hidden');
            unauthorizedView.classList.add('hidden');
            loginView.classList.remove('hidden');
            if (ordersUnsubscribe) ordersUnsubscribe();
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
        const q = query(collection(db, 'orders'));
        ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                ordersListDiv.innerHTML = '<p>There are currently no orders.</p>';
                return;
            }
            ordersListDiv.innerHTML = '';
            snapshot.forEach(doc => {
                const order = doc.data();
                const orderElement = document.createElement('div');
                orderElement.className = 'order-history-item admin-order-item';
                let actionButtons = '';
                if (order.status === 'Pending Confirmation') {
                    actionButtons = `
                        <button class="btn btn-approve" data-order-id="${order.orderId}">Approve</button>
                        <button class="btn btn-reject" data-order-id="${order.orderId}">Reject</button>
                    `;
                }
                
                // This HTML now includes the "View Chat" button inside the admin actions div
                orderElement.innerHTML = `
                    <div class="order-details-grid">
                        <p><strong>Client Name:</strong> ${order.clientName || 'N/A'}</p>
                        <p><strong>Contact Email:</strong> ${order.email || 'N/A'}</p>
                        <p><strong>Contact Info:</strong> ${order.contactInfo || 'N/A'}</p>
                        <p><strong>Service:</strong> ${order.serviceType}</p>
                        <p><strong>Transaction ID:</strong> ${order.transactionNumber}</p>
                        <p><strong>Status:</strong> <span class="status-${order.status.toLowerCase().replace(/ /g, '-')}">${order.status}</span></p>
                    </div>
                    <p><strong>Project Description:</strong></p>
                    <p class="project-description-box">${order.projectDescription || 'N/A'}</p>
                    <p><strong>Final Deliverables:</strong> ${order.deliverables}</p>
                    <div class="admin-actions">
                         ${actionButtons}
                         <button class="btn btn-chat" data-order-id="${order.orderId}">View Chat</button>
                    </div>
                `;
                ordersListDiv.appendChild(orderElement);
            });
        });
    }

    // This updated event listener now handles the chat button click as well
    document.getElementById('all-orders-list').addEventListener('click', async (e) => {
        const orderId = e.target.dataset.orderId;
        if (!orderId) return;

        if (e.target.classList.contains('btn-approve')) {
            await updateOrderStatus(orderId, 'Paid');
        } else if (e.target.classList.contains('btn-reject')) {
            await updateOrderStatus(orderId, 'Rejected');
        } else if (e.target.classList.contains('btn-chat')) {
            openChat(orderId);
        }
    });

    async function updateOrderStatus(orderId, newStatus) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });
    }
});
