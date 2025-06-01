let userRole = '';
let userEmail = '';
let selectedChat = '';
let messages = [];
let hasStartedChat = false;
let category = 'service';
let socket;

// Initialize Socket.IO
document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    userRole = localStorage.getItem('userRole');
    userEmail = localStorage.getItem('userEmail');
    const isAdmin = userRole === 'admin';

    // Connect to Socket.IO
    socket = io('http://localhost:3000');

    document.getElementById('chatTitle').textContent = isAdmin ? 'Chat Management' : 'Support Chat';
    await createSidebar(isAdmin);
    updateEmptyState(isAdmin);
});

async function createSidebar(isAdmin) {
    const sidebar = document.getElementById('chatSidebar');
    if (isAdmin) {
        const response = await fetch('http://localhost:3000/api/chats');
        const chatSessions = await response.json();
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h3>Active Chats</h3>
            </div>
            <div class="chat-sessions">
                ${chatSessions.map(session => `
                    <div class="session-item" onclick="selectChatSession('${session._id}', '${session.userEmail}')">
                        <div class="session-header">
                            <span class="session-email">${session.userEmail}</span>
                            <span class="badge ${session.category === 'purchase' ? 'badge-primary' : 'badge-secondary'}">
                                ${session.category}
                            </span>
                        </div>
                        <div class="session-message">${session.messages[session.messages.length - 1]?.content || ''}</div>
                        <div class="session-time">${new Date(session.messages[session.messages.length - 1]?.timestamp).toLocaleTimeString()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h3>Start a Conversation</h3>
            </div>
            <div style="padding: 1rem;">
                <div class="form-group">
                    <label>What do you need help with?</label>
                    <select id="categorySelect" onchange="category = this.value" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
                        <option value="service">Repair Services</option>
                        <option value="purchase">Purchase Parts</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="startChat()" ${hasStartedChat ? 'style="display: none;"' : ''}>
                    Start Chat
                </button>
            </div>
        `;
    }
}

async function selectChatSession(sessionId, userEmail) {
    selectedChat = sessionId;
    document.querySelectorAll('.session-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('chatHeaderTitle').textContent = `Chat with ${userEmail}`;

    const response = await fetch(`http://localhost:3000/api/chats/${sessionId}`);
    const chat = await response.json();
    messages = chat.messages;
    displayMessages();
    showChatInput();

    socket.emit('joinChat', sessionId);
    socket.on('message', (message) => {
        messages.push(message);
        displayMessages();
    });
}

async function startChat() {
    hasStartedChat = true;
    const response = await fetch('http://localhost:3000/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, category })
    });
    const chat = await response.json();
    selectedChat = chat._id;
    messages = chat.messages;
    displayMessages();
    showChatInput();
    document.querySelector('.btn').style.display = 'none';

    socket.emit('joinChat', chat._id);
    socket.on('message', (message) => {
        messages.push(message);
        displayMessages();
    });
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content) return;

    const message = {
        sender: userRole,
        content,
        timestamp: new Date(),
        senderEmail: userEmail
    };

    socket.emit('sendMessage', { chatId: selectedChat, message });
    input.value = '';
}

function displayMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    document.getElementById('emptyState').style.display = 'none';
    messagesContainer.innerHTML = messages.map(message => `
        <div class="message ${message.sender}">
            <div class="message-content">
                <div class="message-header">
                    <i class="fas ${message.sender === 'admin' ? 'fa-wrench' : 'fa-user'}"></i>
                    <span>${message.sender === 'admin' ? 'Support' : 'You'}</span>
                </div>
                <div>${message.content}</div>
                <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
            </div>
        </div>
    `).join('');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showChatInput() {
    document.getElementById('chatInput').classList.remove('hidden');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function updateEmptyState(isAdmin) {
    const emptyStateText = document.getElementById('emptyStateText');
    emptyStateText.textContent = isAdmin
        ? 'Select a chat session to start messaging'
        : 'Select a category and start chatting with our support team';
}