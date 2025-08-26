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
    getDocs,
    getDoc // Make sure getDoc is imported
} from './auth.js?=v6';
import { openChat, sendSystemMessage } from './chat.js?=v6';

document.addEventListener('DOMContentLoaded', () => {
    // ✅ Hardcoded Admin UID
    const ADMIN_UID = "mL8wfi0Bgvan5yh9yxCthmEDhJc2";

    const adminLoginView = document.getElementById('admin-login-view');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const allOrdersList = document.getElementById('all-orders-list');
    const allChatsList = document.getElementById('all-chats-list');
    const unauthorizedView = document.getElementById('unauthorized-view');

    let chatsUnsubscribe = null;
    let ordersUnsubscribe = null;

    // 🔑 Watch authentication state
    onAuthStateChanged(auth, user => {
        if (user && user.uid === ADMIN_UID) {
            adminLoginView.classList.add('hidden');
            unauthorizedView.classList.add('hidden');
            adminDashboardView.classList.remove('hidden');
            listenForAllOrders();
            listenForAllChats();
        } else {
            adminDashboardView.classList.add('hidden');
            if (user) {
                unauthorizedView.classList.remove('hidden');
                adminLoginView.classList.add('hidden');
            } else {
                adminLoginView.classList.remove('hidden');
                unauthorizedView.classList.add('hidden');
            }
        }
    });

    // Login form
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-login-email').value;
        const password = document.getElementById('admin-login-password').value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user.uid !== ADMIN_UID) {
                signOut(auth);
                unauthorizedView.classList.remove('hidden');
            }
        } catch (error) {
            document.getElementById('admin-auth-error').textContent = "Login failed: " + error.message;
            document.getElementById('admin-auth-error').classList.remove('hidden');
        }
    });

    adminLogoutBtn.addEventListener('click', () => {
        if (ordersUnsubscribe) ordersUnsubscribe();
        if (chatsUnsubscribe) chatsUnsubscribe();
        signOut(auth);
    });

    function listenForAllOrders() {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            allOrdersList.innerHTML = "";
            if (snapshot.empty) {
                allOrdersList.innerHTML = '<p>No orders found.</p>';
                return;
            }
            snapshot.forEach(docSnap => {
                const order = docSnap.data();
                const div = document.createElement("div");
                div.className = "order-item";
                
                let actionButtons = '';
                if (order.status === 'Pending Confirmation') {
                    actionButtons = `
                        <button class="btn btn-approve" data-order-id="${docSnap.id}" data-user-id="${order.userId}">Approve</button>
                        <button class="btn btn-reject" data-order-id="${docSnap.id}" data-user-id="${order.userId}">Reject</button>
                    `;
                }
                
                actionButtons += `<button class="btn btn-contact-client" data-user-id="${order.userId}" data-user-email="${order.email}">Contact Client</button>`;

                div.innerHTML = `
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
                    <div class="order-actions">
                        ${actionButtons}
                    </div>
                    <hr>
                `;
                allOrdersList.appendChild(div);
            });
        });
    }

    // ✅ FIXED: Restructured the logic to handle the "Contact Client" button correctly.
    allOrdersList.addEventListener('click', async (e) => {
        const target = e.target;
        const userId = target.dataset.userId;

        // Handle Contact Client button first
        if (target.classList.contains('btn-contact-client')) {
            if (userId) {
                const userEmail = target.dataset.userEmail;
                openChat(userId, `Chat with ${userEmail}`);
            }
            return; // Stop after handling contact
        }

        // Handle Approve/Reject buttons
        const orderId = target.dataset.orderId;
        if (!orderId || !userId) return; // Ensure we have what we need for these actions

        if (target.classList.contains('btn-approve')) {
            await updateOrderStatus(orderId, 'Paid', userId);
        } else if (target.classList.contains('btn-reject')) {
            await updateOrderStatus(orderId, 'Rejected', userId);
        }
    });
    
    async function updateOrderStatus(orderId, newStatus, clientUserId) {
        const orderRef = doc(db, 'orders', orderId);
        try {
            await updateDoc(orderRef, { status: newStatus });
            console.log(`Order ${orderId} status updated to ${newStatus}.`);
            
            if (clientUserId) {
                const orderSnap = await getDoc(orderRef);
                const orderData = orderSnap.data();
                sendSystemMessage(clientUserId, `Your order with ID ${orderData.orderId} has been updated to: "${newStatus}".`);
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    }

    function listenForAllChats() {
        const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
        chatsUnsubscribe = onSnapshot(q, (snapshot) => {
            allChatsList.innerHTML = '';
            if (snapshot.empty) {
                allChatsList.innerHTML = '<p>No active chats.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const chat = doc.data();
                if (chat.userId && chat.userEmail) {
                    const chatElement = document.createElement('div');
                    chatElement.className = 'chat-list-item';
                    chatElement.dataset.userId = chat.userId;
                    chatElement.dataset.userEmail = chat.userEmail;
                    chatElement.innerHTML = `
                        <p><strong>${chat.userEmail}</strong></p>
                        <p>Last update: ${chat.lastUpdate ? new Date(chat.lastUpdate.toDate()).toLocaleString() : 'N/A'}</p>
                    `;
                    chatElement.addEventListener('click', () => {
                        openChat(chat.userId, `Chat with ${chat.userEmail}`);
                    });
                    allChatsList.appendChild(chatElement);
                }
            });
        }, (error) => {
            console.error("Error listening to chats:", error);
            allChatsList.innerHTML = `<p class="error-message">Error loading chats. You may need to create a Firestore index.</p>`;
        });
    }
});
