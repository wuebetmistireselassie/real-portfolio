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
    orderBy
} from './auth.js';
import { openChat } from './chat.js';

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

    // Login form (for the first time or if the user is not logged in)
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-login-email').value;
        const password = document.getElementById('admin-login-password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user.uid === ADMIN_UID) {
                // The onAuthStateChanged listener will handle the view switch
            } else {
                // Log out unauthorized user immediately
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
                div.innerHTML = `
                    <h4>Order ID: ${order.orderId}</h4>
                    <p><strong>Client:</strong> ${order.clientName} (${order.email})</p>
                    <p><strong>Service:</strong> ${order.serviceType}</p>
                    <p><strong>Description:</strong> ${order.projectDescription}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <button class="btn btn-contact-client" data-user-id="${order.userId}" data-user-email="${order.email}">Contact Client</button>
                    <hr>
                `;
                allOrdersList.appendChild(div);
            });
        });
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
                        <p>Last update: ${new Date(chat.lastUpdate?.toDate()).toLocaleString()}</p>
                    `;
                    chatElement.addEventListener('click', () => {
                        openChat(chat.userId, `Chat with ${chat.userEmail}`);
                    });
                    allChatsList.appendChild(chatElement);
                }
            });
        });
    }

    // Attach event listener for the order list to open chat
    document.getElementById('all-orders-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-contact-client')) {
            const userId = e.target.dataset.userId;
            const userEmail = e.target.dataset.userEmail;
            openChat(userId, `Chat with ${userEmail}`);
        }
    });
});
