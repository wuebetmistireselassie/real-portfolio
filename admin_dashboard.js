import {
    auth,
    onAuthStateChanged,
    signOut,
    db,
    collection,
    query,
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    orderBy
} from './auth.js';
import { openChat } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
    let chatsUnsubscribe = null;

    // --- Auth State ---
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Not signed in → go to login
            window.location.href = 'index.html';
            return;
        }

        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || userDoc.data().role !== "admin") {
            // Not an admin → redirect to client dashboard
            window.location.href = 'orders.html';
            return;
        }

        // ✅ Admin verified → show dashboard
        document.getElementById('admin-email').textContent = user.email;
        listenForAllOrders();
        listenForAllChats();
    });

    // --- Logout ---
    document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

    // --- Listen for all orders ---
    function listenForAllOrders() {
        const ordersListDiv = document.getElementById('all-orders-list');
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                ordersListDiv.innerHTML = '<p>No orders found.</p>';
                return;
            }
            ordersListDiv.innerHTML = '';
            snapshot.forEach(doc => {
                const order = doc.data();
                const orderElement = document.createElement('div');
                orderElement.className = 'order-list-item';
                orderElement.innerHTML = `
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Client:</strong> ${order.clientName} (${order.email})</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                `;
                ordersListDiv.appendChild(orderElement);
            });
        });
    }

    // --- Listen for all chats ---
    function listenForAllChats() {
        const chatsListDiv = document.getElementById('all-chats-list');
        const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));
        
        chatsUnsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                chatsListDiv.innerHTML = '<p>No active chats.</p>';
                return;
            }
            chatsListDiv.innerHTML = '';
            snapshot.forEach(doc => {
                const chat = doc.data();
                if (chat.userId && chat.userEmail) {
                    const chatElement = document.createElement('div');
                    chatElement.className = 'chat-list-item';
                    chatElement.dataset.userId = chat.userId;
                    chatElement.dataset.userEmail = chat.userEmail;
                    chatElement.innerHTML = `<p><strong>${chat.userEmail}</strong></p>`;
                    chatsListDiv.appendChild(chatElement);
                }
            });
        });
    }

    // --- Update Order Status ---
    async function updateOrderStatus(orderId, newStatus) {
        try {
            await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
            console.log(`Order ${orderId} updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating order:", error);
        }
    }

    // Example: handle dashboard clicks
    document.getElementById('dashboard-container').addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-update-status')) {
            const orderId = e.target.dataset.orderId;
            const newStatus = e.target.dataset.newStatus;
            await updateOrderStatus(orderId, newStatus);
        }
    });
});