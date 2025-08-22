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
    orderBy // <-- ADDED THIS
} from './auth.js';
import { openChat } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_UID = "mL8wfi0Bgvan5yh9yxCthmEDhJc2"; 
    
    // ... (rest of the initial variable declarations remain the same) ...

    onAuthStateChanged(auth, user => {
        // ... (function content remains the same) ...
    });

    loginForm.addEventListener('submit', (e) => {
        // ... (function content remains the same) ...
    });

    logoutBtn.addEventListener('click', () => signOut(auth));

    function listenForAllOrders() {
        // ... (function content remains the same) ...
    }

    // --- THIS FUNCTION HAS BEEN UPDATED ---
    function listenForAllChats() {
        const chatsListDiv = document.getElementById('all-chats-list');
        // UPDATED: Added orderBy() to sort by the 'lastUpdate' field in descending order
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

    document.getElementById('dashboard-container').addEventListener('click', async (e) => {
        // ... (function content remains the same) ...
    });

    async function updateOrderStatus(orderId, newStatus) {
        // ... (function content remains the same) ...
    }
});
