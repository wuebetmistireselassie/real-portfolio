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
    
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    let chatsUnsubscribe = null;
    let ordersUnsubscribe = null;

    // 🔑 Watch authentication state
    onAuthStateChanged(auth, user => {
        if (user && user.uid === ADMIN_UID) {
            // ✅ Admin recognized without re-login
            loginSection.style.display = "none";
            dashboardSection.style.display = "block";
            listenForAllOrders();
            listenForAllChats();
        } else {
            // Non-admins cannot view dashboard
            loginSection.style.display = "block";
            dashboardSection.style.display = "none";
        }
    });

    // 👇 Keeping login form for fallback, but not needed if admin logs in via orders.html
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert("Login failed: " + error.message);
        }
    });

    logoutBtn.addEventListener('click', () => signOut(auth));

    function listenForAllOrders() {
        const ordersListDiv = document.getElementById('orders-list');
        const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
        
        ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            ordersListDiv.innerHTML = "";
            snapshot.forEach(docSnap => {
                const order = docSnap.data();
                const div = document.createElement("div");
                div.className = "order-item";
                div.innerHTML = `
                    <p><strong>${order.clientName}</strong> - ${order.serviceType}</p>
                    <p>Status: ${order.status}</p>
                `;
                ordersListDiv.appendChild(div);
            });
        });
    }

    function listenForAllChats() {
        const chatsListDiv = document.getElementById('all-chats-list');
        const q = query(collection(db, 'conversations'), orderBy('lastUpdate', 'desc'));

        chatsUnsubscribe = onSnapshot(q, (snapshot) => {
            chatsListDiv.innerHTML = '';
            if (snapshot.empty) {
                chatsListDiv.innerHTML = '<p>No active chats.</p>';
                return;
            }
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
});