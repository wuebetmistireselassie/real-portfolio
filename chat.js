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
    const chatModal = document.getElementById('chat-modal');
    if (currentUnsubscribe) {
        currentUnsubscribe();
        currentUnsubscribe = null;
    }
    chatModal.style.display = 'none';
}

function listenForMessages(chatId) {
    const messagesDiv = document.getElementById('chat-messages');
    const messagesRef = collection(db, `conversations/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    currentUnsubscribe = onSnapshot(q, (snapshot) => {
        messagesDiv.innerHTML = '';
        if (snapshot.empty) {
            messagesDiv.innerHTML = '<p>No messages yet. Start the conversation!</p>';
        } else {
            snapshot.forEach(doc => {
                displayMessage(doc.data());
            });
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    });
}

function displayMessage(msg) {
    const user = auth.currentUser;
    if (!user) return;

    const messagesDiv = document.getElementById('chat-messages');
    const messageContainer = document.createElement('div');
    const sender = msg.senderEmail ? msg.senderEmail.split('@')[0] : 'User';

    messageContainer.className = `chat-message ${msg.senderId === user.uid ? 'sent' : 'received'}`;

    let fileHTML = '';
    if (msg.fileUrl) {
        fileHTML = `
            <div class="file-attachment">
                <a href="${msg.fileUrl}" target="_blank" download="${msg.fileName}">
                    <span class="file-icon">📄</span>
                    <span class="file-name">${sanitizeText(msg.fileName)}</span>
                </a>
            </div>
        `;
    }

    if (msg.isSystemMessage) {
        messageContainer.innerHTML = `<div class="message-bubble system" style="width: 100%; text-align: center; background: #eee; color: #777; font-style: italic; margin: 10px 0;">${sanitizeText(msg.text)}</div>`;
    } else {
         messageContainer.innerHTML = `
            <div class="message-sender">${sanitizeText(sender)}</div>
            <div class="message-bubble ${msg.senderId === user.uid ? 'sent' : 'received'}">
                ${msg.text ? sanitizeText(msg.text) : ''}
                ${fileHTML}
            </div>
        `;
    }

    messagesDiv.appendChild(messageContainer);
}

async function handleSendMessage(e) {
    e.preventDefault();
    const user = auth.currentUser;
    const messageInput = document.getElementById('chat-message-input');
    const text = messageInput.value.trim();
    const chatId = e.target.dataset.chatId;

    if (!text && !document.getElementById('chat-file-input').files[0]) return;

    try {
        const messagesRef = collection(db, `conversations/${chatId}/messages`);
        await addDoc(messagesRef, {
            text: text,
            senderId: user.uid,
            senderEmail: user.email,
            timestamp: serverTimestamp()
        });
        
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
        
        const messagesRef = collection(db, `conversations/${chatId}/messages`);
        await addDoc(messagesRef, {
            text: document.getElementById('chat-message-input').value.trim(),
            senderId: user.uid,
            senderEmail: user.email,
            timestamp: serverTimestamp(),
            fileUrl: fileUrl,
            fileName: file.name,
            fileType: file.type
        });
        
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error('Cloudinary upload failed');

    const data = await response.json();
    return data.secure_url;
}

export async function sendSystemMessage(chatId, text) {
    if (!chatId || !text) return;
    try {
        const messagesRef = collection(db, `conversations/${chatId}/messages`);
        await addDoc(messagesRef, {
            text: text,
            isSystemMessage: true,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error sending system message:", error);
    }
}