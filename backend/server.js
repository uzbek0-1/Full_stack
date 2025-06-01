const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

// Paths to JSON files for storing data
const POSTS_FILE = path.join(__dirname, 'posts.json');
const ITEMS_FILE = path.join(__dirname, 'items.json');

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/dernchat', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));

// Chat Session Schema
const chatSessionSchema = new mongoose.Schema({
    userEmail: String,
    category: String,
    status: String,
    messages: [{
        sender: String,
        content: String,
        timestamp: Date,
        senderEmail: String
    }]
});
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

// Create HTTP server with Socket.IO
const server = http.createServer();
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'userRole', 'userEmail']
    }
});

// Helper to read data from file
async function readData(file) {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}

// Helper to write data to file
async function writeData(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Middleware to parse JSON body
server.on('request', (req, res) => {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, userRole, userEmail');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Parse URL and method
    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    // Helper to send JSON response
    const sendResponse = (status, data) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    };

    // Helper to check if user is admin
    const isAdmin = req.headers['userrole'] === 'admin';

    // Parse request body
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            // Blog Posts Endpoints
            if (method === 'GET' && url.pathname === '/api/posts') {
                const posts = await readData(POSTS_FILE);
                sendResponse(200, posts);
            } else if (method === 'GET' && url.pathname.startsWith('/api/posts/')) {
                const id = url.pathname.split('/')[3];
                const posts = await readData(POSTS_FILE);
                const post = posts.find(p => p.id === id);
                if (post) {
                    sendResponse(200, post);
                } else {
                    sendResponse(404, { error: 'Post not found' });
                }
            } else if (method === 'POST' && url.pathname === '/api/posts') {
                if (!isAdmin) {
                    return sendResponse(403, { error: 'Admin access required' });
                }
                const { title, category, content } = JSON.parse(body);
                if (!title || !category || !content) {
                    return sendResponse(400, { error: 'Missing required fields' });
                }
                const posts = await readData(POSTS_FILE);
                const newPost = {
                    id: Date.now().toString(),
                    title,
                    category,
                    content,
                    views: 0,
                    createdAt: new Date().toISOString(),
                    author: req.headers['useremail'] || 'unknown'
                };
                posts.unshift(newPost);
                await writeData(POSTS_FILE, posts);
                sendResponse(201, newPost);
            } else if (method === 'PUT' && url.pathname.startsWith('/api/posts/')) {
                if (!isAdmin) {
                    return sendResponse(403, { error: 'Admin access required' });
                }
                const id = url.pathname.split('/')[3];
                const { title, category, content } = JSON.parse(body);
                if (!title || !category || !content) {
                    return sendResponse(400, { error: 'Missing required fields' });
                }
                const posts = await readData(POSTS_FILE);
                const postIndex = posts.findIndex(p => p.id === id);
                if (postIndex === -1) {
                    return sendResponse(404, { error: 'Post not found' });
                }
                posts[postIndex] = { ...posts[postIndex], title, category, content };
                await writeData(POSTS_FILE, posts);
                sendResponse(200, posts[postIndex]);
            } else if (method === 'DELETE' && url.pathname.startsWith('/api/posts/')) {
                if (!isAdmin) {
                    return sendResponse(403, { error: 'Admin access required' });
                }
                const id = url.pathname.split('/')[3];
                const posts = await readData(POSTS_FILE);
                const updatedPosts = posts.filter(p => p.id !== id);
                if (posts.length === updatedPosts.length) {
                    return sendResponse(404, { error: 'Post not found' });
                }
                await writeData(POSTS_FILE, updatedPosts);
                sendResponse(200, { message: 'Post deleted' });
            }
            // Inventory Items Endpoints
            else if (method === 'GET' && url.pathname === '/api/items') {
                const items = await readData(ITEMS_FILE);
                sendResponse(200, items);
            } else if (method === 'GET' && url.pathname.startsWith('/api/items/')) {
                const id = url.pathname.split('/')[3];
                const items = await readData(ITEMS_FILE);
                const item = items.find(i => i.id === id);
                if (item) {
                    sendResponse(200, item);
                } else {
                    sendResponse(404, { error: 'Item not found' });
                }
            } else if (method === 'POST' && url.pathname === '/api/items') {
                if (!isAdmin) {
                    return sendResponse(403, { error: 'Admin access required' });
                }
                const { name, category, price, stock, compatibility, description } = JSON.parse(body);
                if (!name || !category || !price || !stock || !compatibility || !description) {
                    return sendResponse(400, { error: 'Missing required fields' });
                }
                const items = await readData(ITEMS_FILE);
                const newItem = {
                    id: Date.now().toString(),
                    name,
                    category,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    compatibility,
                    description,
                    createdAt: new Date().toISOString()
                };
                items.unshift(newItem);
                await writeData(ITEMS_FILE, items);
                sendResponse(201, newItem);
            } else if (method === 'PUT' && url.pathname.startsWith('/api/items/')) {
                if (!isAdmin) {
                    return sendResponse(403, { error: 'Admin access required' });
                }
                const id = url.pathname.split('/')[3];
                const { name, category, price, stock, compatibility, description } = JSON.parse(body);
                if (!name || !category || !price || !stock || !compatibility || !description) {
                    return sendResponse(400, { error: 'Missing required fields' });
                }
                const items = await readData(ITEMS_FILE);
                const itemIndex = items.findIndex(i => i.id === id);
                if (itemIndex === -1) {
                    return sendResponse(404, { error: 'Item not found' });
                }
                items[itemIndex] = {
                    ...items[itemIndex],
                    name,
                    category,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    compatibility,
                    description
                };
                await writeData(ITEMS_FILE, items);
                sendResponse(200, items[itemIndex]);
            } else if (method === 'DELETE' && url.pathname.startsWith('/api/items/')) {
                if (!isAdmin) {
                    return sendResponse(403, { error: 'Admin access required' });
                }
                const id = url.pathname.split('/')[3];
                const items = await readData(ITEMS_FILE);
                const updatedItems = items.filter(i => i.id !== id);
                if (items.length === updatedItems.length) {
                    return sendResponse(404, { error: 'Item not found' });
                }
                await writeData(ITEMS_FILE, updatedItems);
                sendResponse(200, { message: 'Item deleted' });
            }
            // Chat Endpoints
            else if (method === 'GET' && url.pathname === '/api/chats') {
                const chats = await ChatSession.find({ status: 'active' });
                sendResponse(200, chats);
            } else if (method === 'GET' && url.pathname.startsWith('/api/chats/')) {
                const id = url.pathname.split('/')[3];
                const chat = await ChatSession.findById(id);
                if (chat) {
                    sendResponse(200, chat);
                } else {
                    sendResponse(404, { error: 'Chat not found' });
                }
            } else if (method === 'POST' && url.pathname === '/api/chats') {
                const { userEmail, category } = JSON.parse(body);
                if (!userEmail || !category) {
                    return sendResponse(400, { error: 'Missing required fields' });
                }
                const chat = new ChatSession({
                    userEmail,
                    category,
                    status: 'active',
                    messages: [{
                        sender: 'admin',
                        content: `Hello! I see you're looking for ${category === 'purchase' ? 'parts to purchase' : 'repair services'}. How can I help you today?`,
                        timestamp: new Date(),
                        senderEmail: 'admin@dernsupport.com'
                    }]
                });
                await chat.save();
                io.emit('chatStarted', chat);
                sendResponse(201, chat);
            } else {
                sendResponse(404, { error: 'Endpoint not found' });
            }
        } catch (err) {
            console.error(err);
            sendResponse(500, { error: 'Server error' });
        }
    });
});

// Socket.IO for real-time chat
io.on('connection', (socket) => {
    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
    });

    socket.on('sendMessage', async ({ chatId, message }) => {
        try {
            const chat = await ChatSession.findById(chatId);
            if (!chat) return;
            chat.messages.push(message);
            await chat.save();
            io.to(chatId).emit('message', message);

            // Simulate admin response for non-admin users
            if (message.sender !== 'admin') {
                setTimeout(async () => {
                    const adminMessage = {
                        sender: 'admin',
                        content: 'Thank you for your message. Can you provide more details about your device?',
                        timestamp: new Date(),
                        senderEmail: 'admin@dernsupport.com'
                    };
                    chat.messages.push(adminMessage);
                    await chat.save();
                    io.to(chatId).emit('message', adminMessage);
                }, 1000);
            }
        } catch (err) {
            console.error('Error handling message:', err);
        }
    });
});

// Start server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});