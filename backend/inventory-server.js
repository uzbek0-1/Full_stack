const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Path to the JSON file for storing items
const ITEMS_FILE = path.join(__dirname, 'items.json');

// Helper to read items from file
async function readItems() {
    try {
        const data = await fs.readFile(ITEMS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn’t exist, start with an empty array
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}

// Helper to write items to file
async function writeItems(items) {
    await fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2));
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust for production
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, userRole, userEmail');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204); // No Content
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

    try {
        if (method === 'GET' && url.pathname === '/api/items') {
            // Fetch all items
            const items = await readItems();
            sendResponse(200, items);
        } else if (method === 'GET' && url.pathname.startsWith('/api/items/')) {
            // Fetch single item by ID
            const id = url.pathname.split('/')[3];
            const items = await readItems();
            const item = items.find(i => i.id === id);
            if (item) {
                sendResponse(200, item);
            } else {
                sendResponse(404, { error: 'Item not found' });
            }
        } else if (method === 'POST' && url.pathname === '/api/items') {
            // Create new item (admin only)
            if (!isAdmin) {
                return sendResponse(403, { error: 'Admin access required' });
            }
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const { name, category, price, stock, compatibility, description } = JSON.parse(body);
                    if (!name || !category || !price || !stock || !compatibility || !description) {
                        return sendResponse(400, { error: 'Missing required fields' });
                    }
                    const items = await readItems();
                    const newItem = {
                        id: Date.now().toString(),
                        name,
                        category,
                        price: parseFloat(price),
                        stock: parseInt(stock),
                        compatibility,
                        description,
                        createdAt: new Date().toISOString(),
                        author: req.headers['useremail'] || 'unknown'
                    };
                    items.unshift(newItem);
                    await writeItems(items);
                    sendResponse(201, newItem);
                } catch (err) {
                    sendResponse(400, { error: 'Invalid JSON payload' });
                }
            });
        } else if (method === 'PUT' && url.pathname.startsWith('/api/items/')) {
            // Update item (admin only)
            if (!isAdmin) {
                return sendResponse(403, { error: 'Admin access required' });
            }
            const id = url.pathname.split('/')[3];
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const { name, category, price, stock, compatibility, description } = JSON.parse(body);
                    if (!name || !category || !price || !stock || !compatibility || !description) {
                        return sendResponse(400, { error: 'Missing required fields' });
                    }
                    const items = await readItems();
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
                    await writeItems(items);
                    sendResponse(200, items[itemIndex]);
                } catch (err) {
                    sendResponse(400, { error: 'Invalid JSON payload' });
                }
            });
        } else if (method === 'DELETE' && url.pathname.startsWith('/api/items/')) {
            // Delete item (admin only)
            if (!isAdmin) {
                return sendResponse(403, { error: 'Admin access required' });
            }
            const id = url.pathname.split('/')[3];
            const items = await readItems();
            const updatedItems = items.filter(i => i.id !== id);
            if (items.length === updatedItems.length) {
                return sendResponse(404, { error: 'Item not found' });
            }
            await writeItems(updatedItems);
            sendResponse(200, { message: 'Item deleted' });
        } else {
            sendResponse(404, { error: 'Endpoint not found' });
        }
    } catch (err) {
        console.error(err);
        sendResponse(500, { error: 'Server error' });
    }
});

// Start server
server.listen(3001, () => {
    console.log('Inventory server running on http://localhost:3001');
});