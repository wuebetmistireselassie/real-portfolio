import { db, auth, onSnapshot, collection, addDoc, serverTimestamp, query, orderBy, doc, setDoc } from './auth.js';
import { CLOUDINARY_CONFIG } from './config.js';

let currentUnsubscribe = null;

function sanitizeText(text) {
    const temp = document.createElement('div');
    temp.textContent = text;
    return temp.innerHTML;
}

export async function openChat(chatId, title) {
    const user = auth.currentUser;
    if (!user || !chatId) {
        console.error("User not logged in or chatId missing.");
        return;
    }

    try {
        const conversationRef = doc(db, 'conversations', chatId);
        await setDoc(conversationRef, {
            userId: chatId, 
            userEmail: (chatId === user.uid) ? user.email : title.replace('Chat with ', ''),
            lastUpdate: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Failed to create/update conversation document:", error);
    }

    const chatModal = document.getElementById('chat-modal');
    const messagesDiv = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-input-form');
    const closeBtn = document.getElementById('close-chat-btn');

    chatForm.dataset.chatId = chatId;
    document.getElementById('chat-header-title').textContent = title;
    chatModal.style.display = 'flex';
    messagesDiv.innerHTML = '<p>Loading messages...</p>';

    listenForMessages(chatId);

    chatForm.onsubmit = handleSendMessage;
    closeBtn.onclick = closeChat;
    document.getElementById('chat-file-label').onclick = () => document.getElementById('chat-file-input').click();
    document.getElementById('chat-file-input').onchange = handleFileSelect;
}

function closeChat() {
    // Function content remains the same...
}

function listenForMessages(chatId) {
    // Function content remains the same...
}

function displayMessage(msg) {
    // Function content remains the same...
}

async function handleSendMessage(e) {
    e.preventDefault();
    const user = auth.currentUser;
    const messageInput = document.getElementById('chat-message-input');
    const text = messageInput.value.trim();
    const chatId = e.target.dataset.chatId;

    if (!text && !document.getElementById('chat-file-input').files[0]) return;

    try {
        // Add the message to the subcollection
        const messagesRef = collection(db, `conversations/${chatId}/messages`);
        await addDoc(messagesRef, {
            text: text, senderId: user.uid,
            senderEmail: user.email, timestamp: serverTimestamp()
        });
        
        // --- ADDED THIS BLOCK TO UPDATE THE TIMESTAMP ---
        const conversationRef = doc(db, 'conversations', chatId);
        await setDoc(conversationRef, { lastUpdate: serverTimestamp() }, { merge: true });
        
        messageInput.value = '';
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message.");
    }
}

async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    const chatId = document.getElementById('chat-input-form').dataset.chatId;
    if (!chatId || !user) return;

    const sendBtn = document.getElementById('send-chat-btn');
    const originalBtnText = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Uploading...';

    try {
        const fileUrl = await uploadFileToCloudinary(file);
        
        // Add the message with file to the subcollection
        const messagesRef = collection(db, `conversations/${chatId}/messages`);
        await addDoc(messagesRef, {
            text: document.getElementById('chat-message-input').value.trim(),
            senderId: user.uid, senderEmail: user.email,
            timestamp: serverTimestamp(), fileUrl: fileUrl,
            fileName: file.name, fileType: file.type
        });
        
        // --- ADDED THIS BLOCK TO UPDATE THE TIMESTAMP ---
        const conversationRef = doc(db, 'conversations', chatId);
        await setDoc(conversationRef, { lastUpdate: serverTimestamp() }, { merge: true });

        document.getElementById('chat-message-input').value = '';
    } catch (error) {
        console.error("File upload failed:", error);
        alert("There was an error uploading your file.");
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = originalBtnText;
        e.target.value = '';
    }
}

async function uploadFileToCloudinary(file) {
    // Function content remains the same...
}

export async function sendSystemMessage(chatId, text) {
    // Function content remains the same...
}
