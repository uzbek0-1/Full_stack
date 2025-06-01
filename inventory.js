let userRole = '';
let items = [];
let filteredItems = [];

// Initialize inventory page
document.addEventListener('DOMContentLoaded', async function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';

    // Update page content based on role
    updatePageContent(isAdmin);

    // Load items from backend
    await loadItems();

    // Populate category filter
    populateCategoryFilter();

    // Display items
    filterItems();
});

function updatePageContent(isAdmin) {
    document.getElementById('inventoryTitle').textContent = isAdmin ? 'Inventory Management' : 'Parts Catalog';
    document.getElementById('inventoryHeader').textContent = isAdmin ? 'Manage Inventory' : 'Available Parts & Components';
    document.getElementById('inventoryDescription').textContent = isAdmin
        ? 'Add, edit, and manage your parts inventory and pricing.'
        : 'Browse our selection of electronic parts and components.';

    if (isAdmin) {
        document.getElementById('addItemBtn').classList.remove('hidden');
    }

    document.getElementById('emptyInventoryText').textContent = isAdmin
        ? 'Add your first inventory item to get started.'
        : 'Check back later for new parts and components.';
}

async function loadItems() {
    try {
        const response = await fetch('http://localhost:3000/api/items', {
            headers: {
                userRole: localStorage.getItem('userRole'),
                userEmail: localStorage.getItem('userEmail')
            }
        });
        if (!response.ok) throw new Error('Failed to fetch items');
        items = await response.json();
        filteredItems = [...items];
    } catch (err) {
        console.error('Error loading items:', err);
        items = [];
        filteredItems = [];
    }
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = ['all', ...new Set(items.map(item => item.category))];

    categoryFilter.innerHTML = categories
        .map(category => `<option value="${category}">${category === 'all' ? 'All Categories' : category}</option>`)
        .join('');
}

function filterItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    filteredItems = items.filter(item => {
        const matchesSearch =
            !searchTerm ||
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.compatibility.toLowerCase().includes(searchTerm);

        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    displayItems();
}

function displayItems() {
    const itemsContainer = document.getElementById('inventoryGrid');
    const emptyState = document.getElementById('emptyInventoryState');
    const isAdmin = userRole === 'admin';

    if (filteredItems.length === 0) {
        emptyState.classList.remove('hidden');
        itemsContainer.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');

    itemsContainer.innerHTML = filteredItems
        .map(
            item => `
        <div class="card" style="position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <span class="badge badge-secondary">${item.category}</span>
                ${
                    isAdmin
                        ? `
                    <div style="display: flex; gap: 0.25rem;">
                        <button onclick="editItem('${item.id}')" style="background: none; border: none; padding: 0.25rem; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteItem('${item.id}')" style="background: none; border: none; padding: 0.25rem; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
                        : ''
                }
            </div>
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; line-height: 1.4;">${item.name}</h3>
            <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">${item.description}</p>
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                        <i class="fas fa-dollar-sign" style="color: #10b981;"></i>
                        <span style="font-size: 1.125rem; font-weight: 600; color: #10b981;">$${item.price.toFixed(2)}</span>
                    </div>
                    <span class="badge ${item.stock > 0 ? 'badge-primary' : 'badge-secondary'}" style="background: ${
                        item.stock > 0 ? '#dbeafe'

 : '#f3f4f6'
                    }; color: ${item.stock > 0 ? '#1d4ed8' : '#6b7280'};">
                        ${item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                    </span>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Compatible with:</p>
                    <p style="font-size: 0.875rem; font-weight: 500;">${item.compatibility}</p>
                </div>
                ${
                    !isAdmin
                        ? `
                    <button class="btn ${item.stock > 0 ? 'btn-primary' : 'btn-secondary'}" ${item.stock === 0 ? 'disabled' : ''}>
                        ${item.stock > 0 ? 'Contact for Purchase' : 'Out of Stock'}
                    </button>
                `
                        : ''
                }
            </div>
        </div>
    `
        )
        .join('');
}

function showAddItemModal() {
    document.getElementById('addItemModal').classList.remove('hidden');
}

function hideAddItemModal() {
    document.getElementById('addItemModal').classList.add('hidden');
    document.getElementById('addItemForm').reset();
}

async function editItem(itemId) {
    try {
        const response = await fetch(`http://localhost:3000/api/items/${itemId}`, {
            headers: {
                userRole: localStorage.getItem('userRole'),
                userEmail: localStorage.getItem('userEmail')
            }
        });
        if (!response.ok) throw new Error('Failed to fetch item');
        const item = await response.json();

        // Populate form with existing data
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemStock').value = item.stock;
        document.getElementById('itemCompatibility').value = item.compatibility;
        document.getElementById('itemDescription').value = item.description;

        showAddItemModal();

        // Change form submission to update instead of create
        const form = document.getElementById('addItemForm');
        form.onsubmit = function (e) {
            e.preventDefault();
            updateItem(itemId);
        };
    } catch (err) {
        console.error('Error fetching item for edit:', err);
    }
}

async function updateItem(itemId) {
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const stock = parseInt(document.getElementById('itemStock').value);
    const compatibility = document.getElementById('itemCompatibility').value;
    const description = document.getElementById('itemDescription').value;

    if (!name || !category || !price || !stock || !compatibility || !description) return;

    try {
        const response = await fetch(`http://localhost:3000/api/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                userRole: localStorage.getItem('userRole'),
                userEmail: localStorage.getItem('userEmail')
            },
            body: JSON.stringify({ name, category, price, stock, compatibility, description })
        });
        if (!response.ok) throw new Error('Failed to update item');
        await loadItems();
        populateCategoryFilter();
        filterItems();
        hideAddItemModal();

        // Reset form submission
        document.getElementById('addItemForm').onsubmit = createItem;
    } catch (err) {
        console.error('Error updating item:', err);
    }
}

async function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    userRole: localStorage.getItem('userRole'),
                    userEmail: localStorage.getItem('userEmail')
                }
            });
            if (!response.ok) throw new Error('Failed to delete item');
            await loadItems();
            populateCategoryFilter();
            filterItems();
        } catch (err) {
            console.error('Error deleting item:', err);
        }
    }
}

// Create item form handler
document.getElementById('addItemForm').addEventListener('submit', createItem);

async function createItem(e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const stock = parseInt(document.getElementById('itemStock').value);
    const compatibility = document.getElementById('itemCompatibility').value;
    const description = document.getElementById('itemDescription').value;

    if (!name || !category || !price || !stock || !compatibility || !description) return;

    try {
        const response = await fetch('http://localhost:3000/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                userRole: localStorage.getItem('userRole'),
                userEmail: localStorage.getItem('userEmail')
            },
            body: JSON.stringify({ name, category, price, stock, compatibility, description })
        });
        if (!response.ok) throw new Error('Failed to create item');
        await loadItems();
        populateCategoryFilter();
        filterItems();
        hideAddItemModal();
    } catch (err) {
        console.error('Error creating item:', err);
    }
}