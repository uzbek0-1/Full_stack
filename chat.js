let userRole = '';
let userEmail = '';
let selectedChat = '';
let messages = [];
let hasStartedChat = false;
let category = 'service';

// Initialize chat page
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    userRole = localStorage.getItem('userRole');
    userEmail = localStorage.getItem('userEmail');
    const isAdmin = userRole === 'admin';
    
    // Update page title
    document.getElementById('chatTitle').textContent = isAdmin ? 'Chat Management' : 'Support Chat';
    
    // Create sidebar content
    createSidebar(isAdmin);
    
    // Update empty state
    updateEmptyState(isAdmin);
});

function createSidebar(isAdmin) {
    const sidebar = document.getElementById('chatSidebar');
    
    if (isAdmin) {
         window.location.replace('https://my.livechatinc.com/home');
        ;
    } else {
        window.location.replace('https://direct.lc.chat/19186092/');
        ;
    }
}

function selectChatSession(sessionId, userEmail) {
    selectedChat = sessionId;
    
    // Update active session styling
    document.querySelectorAll('.session-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Update chat header
    document.getElementById('chatHeaderTitle').textContent = `Chat with ${userEmail}`;
    
    // Load mock messages
    messages = [
        {
            id: '1',
            sender: 'user',
            content: sessionId === '1' ? 'My laptop screen is flickering' : 'Do you have iPhone 12 screens in stock?',
            timestamp: new Date(Date.now() - 300000),
            senderEmail: userEmail
        },
        {
            id: '2',
            sender: 'admin',
            content: 'I can help you with that. Let me check our inventory and get back to you.',
            timestamp: new Date(Date.now() - 240000),
            senderEmail: 'admin@dernsupport.com'
        }
    ];
    
    displayMessages();
    showChatInput();
}

function startChat() {
    hasStartedChat = true;
    
    // Add welcome message
    messages = [{
        id: '1',
        sender: 'admin',
        content: `Hello! I see you're looking for ${category === 'purchase' ? 'parts to purchase' : 'repair services'}. How can I help you today?`,
        timestamp: new Date(),
        senderEmail: 'admin@dernsupport.com'
    }];
    
    displayMessages();
    showChatInput();
    
    // Hide start chat button
    document.querySelector('.btn').style.display = 'none';
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
                <div class="message-time">${message.timestamp.toLocaleTimeString()}</div>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showChatInput() {
    document.getElementById('chatInput').classList.remove('hidden');
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (!content) return;
    
    const isAdmin = userRole === 'admin';
    const message = {
        id: Date.now().toString(),
        sender: isAdmin ? 'admin' : 'user',
        content: content,
        timestamp: new Date(),
        senderEmail: userEmail
    };
    
    messages.push(message);
    input.value = '';
    displayMessages();
    
    // Simulate admin response for users
    if (!isAdmin) {
        setTimeout(() => {
            const adminResponse = {
                id: (Date.now() + 1).toString(),
                sender: 'admin',
                content: 'Thank you for your message. Let me help you with that. Can you provide more details about your device?',
                timestamp: new Date(),
                senderEmail: 'admin@dernsupport.com'
            };
            messages.push(adminResponse);
            displayMessages();
        }, 1000);
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function updateEmptyState(isAdmin) {
    const emptyStateText = document.getElementById('emptyStateText');
    if (isAdmin) {
        emptyStateText.textContent = 'Select a chat session to start messaging';
    } else {
        emptyStateText.textContent = 'Select a category and start chatting with our support team';
    }
}