// admin_dashboard.js
import { 
    db, auth, onAuthStateChanged,
    collection, doc, getDoc, onSnapshot, updateDoc, setDoc
} from './auth.js';
import { openChat, sendSystemMessage } from './chat.js';

// === Ensure only admin can access dashboard ===
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html"; // not logged in
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().role !== "admin") {
            alert("Unauthorized access. Admins only.");
            await auth.signOut();
            window.location.href = "index.html";
            return;
        }

        // load orders once admin confirmed
        loadOrders();
    } catch (err) {
        console.error("Error verifying admin:", err);
        await auth.signOut();
        window.location.href = "index.html";
    }
});

// === Live load all orders ===
function loadOrders() {
    const ordersRef = collection(db, "orders");

    onSnapshot(ordersRef, (snapshot) => {
        const ordersDiv = document.getElementById("orders-list");
        ordersDiv.innerHTML = "";

        if (snapshot.empty) {
            ordersDiv.innerHTML = "<p>No orders yet.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const order = docSnap.data();
            renderOrder(order, docSnap.id, ordersDiv);
        });
    });
}

// === Render a single order card ===
function renderOrder(order, orderId, container) {
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

    // === Approve ===
    card.querySelector(".approve-btn").onclick = async () => {
        try {
            await updateDoc(doc(db, "orders", orderId), { status: "Paid" });
            await sendSystemMessage(order.clientId, "✅ Your payment has been approved. Work will begin soon.");
        } catch (err) {
            console.error("Approve error:", err);
            alert("Failed to approve payment.");
        }
    };

    // === Reject ===
    card.querySelector(".reject-btn").onclick = async () => {
        try {
            await updateDoc(doc(db, "orders", orderId), { status: "Rejected" });
            await sendSystemMessage(order.clientId, "❌ Your payment was rejected. Please contact support.");
        } catch (err) {
            console.error("Reject error:", err);
            alert("Failed to reject payment.");
        }
    };

    // === Contact Client ===
    card.querySelector(".chat-btn").onclick = () => {
        if (!order.clientId) {
            alert("Client ID missing for this order.");
            return;
        }
        openChat(order.clientId, `Chat with ${order.clientEmail || "Client"}`);
    };

    container.appendChild(card);
}