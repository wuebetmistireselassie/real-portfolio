// admin_dashboard.js
import { 
    auth, db, onAuthStateChanged,
    signInWithEmailAndPassword, signOut,
    collection, doc, getDoc, onSnapshot, updateDoc 
} from './auth.js';
import { openChat, sendSystemMessage } from './chat.js';

// === DOM Elements ===
const loginView = document.getElementById("admin-login-view");
const dashboardView = document.getElementById("admin-dashboard-view");
const unauthorizedView = document.getElementById("unauthorized-view");

const loginForm = document.getElementById("admin-login-form");
const loginError = document.getElementById("admin-auth-error");
const logoutBtn = document.getElementById("admin-logout-btn");

const ordersList = document.getElementById("all-orders-list");
const chatsList = document.getElementById("all-chats-list");

// === Admin Login ===
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.classList.add("hidden");

    const email = document.getElementById("admin-login-email").value;
    const password = document.getElementById("admin-login-password").value;

    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, "users", cred.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().role !== "admin") {
            loginView.classList.add("hidden");
            unauthorizedView.classList.remove("hidden");
            await signOut(auth);
            return;
        }

        loginView.classList.add("hidden");
        dashboardView.classList.remove("hidden");

        loadOrders();
        loadChats();

    } catch (err) {
        loginError.textContent = "Invalid login. Try again.";
        loginError.classList.remove("hidden");
    }
});

// === Auto check session ===
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
            loginView.classList.add("hidden");
            dashboardView.classList.remove("hidden");
            loadOrders();
            loadChats();
        }
    }
});

// === Logout ===
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    dashboardView.classList.add("hidden");
    loginView.classList.remove("hidden");
});

// === Load Orders (Realtime) ===
function loadOrders() {
    const ordersRef = collection(db, "orders");

    onSnapshot(ordersRef, (snapshot) => {
        ordersList.innerHTML = "";

        if (snapshot.empty) {
            ordersList.innerHTML = "<p>No orders yet.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const order = docSnap.data();
            renderOrder(order, docSnap.id);
        });
    });
}

// === Render Single Order ===
function renderOrder(order, orderId) {
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
        <h3>Order ID: ${orderId}</h3>
        <p><strong>Client:</strong> ${order.clientEmail || "N/A"}</p>
        <p><strong>Service:</strong> ${order.serviceName || "N/A"}</p>
        <p><strong>Status:</strong> <span class="status">${order.status || "Pending"}</span></p>
        <button class="approve-btn">✅ Approve Payment</button>
        <button class="reject-btn">❌ Reject Payment</button>
        <button class="chat-btn">💬 Contact Client</button>
    `;

    // Approve
    card.querySelector(".approve-btn").onclick = async () => {
        try {
            await updateDoc(doc(db, "orders", orderId), { status: "Paid" });
            await sendSystemMessage(order.clientId, "✅ Your payment has been approved.");
        } catch (err) {
            console.error(err);
            alert("Failed to approve payment.");
        }
    };

    // Reject
    card.querySelector(".reject-btn").onclick = async () => {
        try {
            await updateDoc(doc(db, "orders", orderId), { status: "Rejected" });
            await sendSystemMessage(order.clientId, "❌ Your payment was rejected.");
        } catch (err) {
            console.error(err);
            alert("Failed to reject payment.");
        }
    };

    // Contact Client
    card.querySelector(".chat-btn").onclick = () => {
        if (!order.clientId) {
            alert("Client ID missing for this order.");
            return;
        }
        openChat(order.clientId, `Chat with ${order.clientEmail || "Client"}`);
    };

    ordersList.appendChild(card);
}

// === Load Chats (Realtime) ===
function loadChats() {
    const chatsRef = collection(db, "chats");

    onSnapshot(chatsRef, (snapshot) => {
        chatsList.innerHTML = "";

        if (snapshot.empty) {
            chatsList.innerHTML = "<p>No chats yet.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const chat = docSnap.data();
            const item = document.createElement("div");
            item.className = "chat-item";
            item.innerHTML = `
                <p><strong>${chat.clientEmail || "Unknown Client"}</strong></p>
                <button class="open-chat">💬 Open Chat</button>
            `;

            item.querySelector(".open-chat").onclick = () => {
                openChat(docSnap.id, `Chat with ${chat.clientEmail || "Client"}`);
            };

            chatsList.appendChild(item);
        });
    });
}