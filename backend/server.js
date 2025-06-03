const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../'))); // Serve frontend files

const usersFile = path.join(__dirname, 'users.json');
const blogsFile = path.join(__dirname, 'blog.json');
const inventoryFile = path.join(__dirname, 'inventory.json');

// Initialize files if they don't exist
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]));
}

if (!fs.existsSync(blogsFile)) {
    const samplePosts = [
        {
            id: '1',
            title: 'How to Fix a Flickering Laptop Screen',
            content: `A flickering laptop screen can be caused by several issues. First, check your display drivers...

Step 1: Update your graphics drivers
Step 2: Check the display cable connection
Step 3: Adjust screen refresh rate
Step 4: Test with external monitor

If these steps don't resolve the issue, the problem might be hardware-related and require professional repair.`,
            category: 'Laptop Repair',
            views: 1250,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            author: 'admin@dernsupport.com'
        },
        {
            id: '2',
            title: 'iPhone Battery Replacement Guide',
            content: `Replacing an iPhone battery requires careful handling and the right tools...

Tools needed:
- Pentalobe screwdriver
- Suction cup
- Plastic opening tools
- Adhesive strips

Step-by-step process:
1. Power off your iPhone
2. Remove the two screws near the charging port
3. Use suction cup to lift the screen
4. Disconnect the battery connector
5. Remove old battery and install new one

Warning: This process voids your warranty. Consider professional service if unsure.`,
            category: 'Phone Repair',
            views: 2100,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            author: 'admin@dernsupport.com'
        },
        {
            id: '3',
            title: 'Troubleshooting Gaming Console Overheating',
            content: `Gaming consoles can overheat due to dust buildup and poor ventilation...

Common causes:
- Dust accumulation in vents
- Thermal paste degradation
- Fan malfunction
- Poor room ventilation

Solutions:
1. Clean air vents with compressed air
2. Ensure proper ventilation around console
3. Replace thermal paste (advanced users)
4. Check and replace cooling fans if necessary

Regular maintenance can prevent most overheating issues.`,
            category: 'Gaming Console',
            views: 890,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            author: 'admin@dernsupport.com'
        }
    ];
    fs.writeFileSync(blogsFile, JSON.stringify(samplePosts, null, 2));
}

if (!fs.existsSync(inventoryFile)) {
    const sampleItems = [
        {
            id: '1',
            name: 'Laptop Screen Replacement',
            category: 'Laptop Parts',
            price: 99.99,
            stock: 10,
            compatibility: 'Various laptop models (15.6-inch)',
            description: 'High-quality LED screen replacement for laptops.'
        },
        {
            id: '2',
            name: 'iPhone Battery',
            category: 'Phone Parts',
            price: 29.99,
            stock: 25,
            compatibility: 'iPhone 11, 12, 13',
            description: 'OEM battery replacement for iPhone models.'
        },
        {
            id: '3',
            name: 'PS5 Cooling Fan',
            category: 'Console Parts',
            price: 49.99,
            stock: 5,
            compatibility: 'PlayStation 5',
            description: 'Replacement cooling fan for PS5 consoles.'
        }
    ];
    fs.writeFileSync(inventoryFile, JSON.stringify(sampleItems, null, 2));
}

// Middleware to check admin permissions
const requireAdmin = (req, res, next) => {
    const userRole = req.headers.userrole;
    if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// User Authentication Routes
app.get('/api/users', (req, res) => {
    const users = JSON.parse(fs.readFileSync(usersFile));
    res.json(users);
});

app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@dernsupport.com') {
        return res.status(400).json({ error: 'Admin email cannot be registered' });
    }
    const users = JSON.parse(fs.readFileSync(usersFile));
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }
    users.push({ email, password, role: 'user' });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.json({ email, role: 'user' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@dernsupport.com' && password === 'adminPassword') {
        return res.json({ email, role: 'admin' });
    }
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ email: user.email, role: user.role });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Blog Routes
app.get('/api/posts', (req, res) => {
    try {
        const posts = JSON.parse(fs.readFileSync(blogsFile));
        res.json(posts);
    } catch (error) {
        console.error('Error reading blog posts:', error);
        res.status(500).json({ error: 'Failed to load posts' });
    }
});

app.get('/api/posts/:id', (req, res) => {
    try {
        const posts = JSON.parse(fs.readFileSync(blogsFile));
        const post = posts.find(p => p.id === req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error('Error reading blog post:', error);
        res.status(500).json({ error: 'Failed to load post' });
    }
});

app.post('/api/posts', requireAdmin, (req, res) => {
    try {
        const { title, category, content } = req.body;
        const userEmail = req.headers.useremail;
        
        if (!title || !category || !content) {
            return res.status(400).json({ error: 'Title, category, and content are required' });
        }

        const posts = JSON.parse(fs.readFileSync(blogsFile));
        
        const newPost = {
            id: Date.now().toString(),
            title,
            category,
            content,
            views: 0,
            createdAt: new Date().toISOString(),
            author: userEmail
        };

        posts.unshift(newPost);
        fs.writeFileSync(blogsFile, JSON.stringify(posts, null, 2));
        
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.put('/api/posts/:id', requireAdmin, (req, res) => {
    try {
        const posts = JSON.parse(fs.readFileSync(blogsFile));
        const postIndex = posts.findIndex(p => p.id === req.params.id);
        
        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const { title, category, content, views } = req.body;
        
        posts[postIndex] = {
            ...posts[postIndex],
            ...(title && { title }),
            ...(category && { category }),
            ...(content && { content }),
            ...(views !== undefined && { views }),
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(blogsFile, JSON.stringify(posts, null, 2));
        res.json(posts[postIndex]);
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

app.patch('/api/posts/:id/views', (req, res) => {
    try {
        const posts = JSON.parse(fs.readFileSync(blogsFile));
        const postIndex = posts.findIndex(p => p.id === req.params.id);
        
        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }

        posts[postIndex].views = (posts[postIndex].views || 0) + 1;
        fs.writeFileSync(blogsFile, JSON.stringify(posts, null, 2));
        
        res.json({ views: posts[postIndex].views });
    } catch (error) {
        console.error('Error updating post views:', error);
        res.status(500).json({ error: 'Failed to update views' });
    }
});

app.delete('/api/posts/:id', requireAdmin, (req, res) => {
    try {
        const posts = JSON.parse(fs.readFileSync(blogsFile));
        const postIndex = posts.findIndex(p => p.id === req.params.id);
        
        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const deletedPost = posts.splice(postIndex, 1)[0];
        fs.writeFileSync(blogsFile, JSON.stringify(posts, null, 2));
        
        res.json({ message: 'Post deleted successfully', post: deletedPost });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Inventory Routes
app.get('/api/items', (req, res) => {
    try {
        const items = JSON.parse(fs.readFileSync(inventoryFile));
        res.json(items);
    } catch (error) {
        console.error('Error reading inventory items:', error);
        res.status(500).json({ error: 'Failed to load items' });
    }
});

// Inventory Routes
app.get('/api/items', (req, res) => {
    try {
        const items = JSON.parse(fs.readFileSync(inventoryFile));
        res.json(items);
    } catch (error) {
        console.error('Error in GET /api/items:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to load items', details: error.message });
    }
});

app.get('/api/items/:id', (req, res) => {
    try {
        const items = JSON.parse(fs.readFileSync(inventoryFile));
        const item = items.find(i => i.id === req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error in GET /api/items/:id:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to load item', details: error.message });
    }
});

app.post('/api/items', requireAdmin, (req, res) => {
    try {
        const { name, category, price, stock, compatibility, description } = req.body;
        const userEmail = req.headers.useremail;

        if (!name || !category || price === undefined || stock === undefined || !compatibility || !description) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (isNaN(price) || isNaN(stock)) {
            return res.status(400).json({ error: 'Price and stock must be valid numbers' });
        }

        const items = JSON.parse(fs.readFileSync(inventoryFile));

        const newItem = {
            id: Date.now().toString(),
            name,
            category,
            price: parseFloat(price),
            stock: parseInt(stock),
            compatibility,
            description,
            createdAt: new Date().toISOString(),
            author: userEmail
        };

        items.unshift(newItem);
        fs.writeFileSync(inventoryFile, JSON.stringify(items, null, 2));

        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error in POST /api/items:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to create item', details: error.message });
    }
});

app.put('/api/items/:id', requireAdmin, (req, res) => {
    try {
        const items = JSON.parse(fs.readFileSync(inventoryFile));
        const itemIndex = items.findIndex(i => i.id === req.params.id);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const { name, category, price, stock, compatibility, description } = req.body;

        items[itemIndex] = {
            ...items[itemIndex],
            ...(name && { name }),
            ...(category && { category }),
            ...(price !== undefined && { price: parseFloat(price) }),
            ...(stock !== undefined && { stock: parseInt(stock) }),
            ...(compatibility && { compatibility }),
            ...(description && { description }),
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(inventoryFile, JSON.stringify(items, null, 2));
        res.json(items[itemIndex]);
    } catch (error) {
        console.error('Error in PUT /api/items/:id:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to update item', details: error.message });
    }
});

app.delete('/api/items/:id', requireAdmin, (req, res) => {
    try {
        const items = JSON.parse(fs.readFileSync(inventoryFile));
        const itemIndex = items.findIndex(i => i.id === req.params.id);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const deletedItem = items.splice(itemIndex, 1)[0];
        fs.writeFileSync(inventoryFile, JSON.stringify(items, null, 2));

        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error('Error in DELETE /api/items/:id:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to delete item', details: error.message });
    }
});