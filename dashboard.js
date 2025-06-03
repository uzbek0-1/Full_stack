// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const isAdmin = userRole === 'admin';
    
    // Update user info
    document.getElementById('userInfo').textContent = `${userEmail} (${isAdmin ? 'Admin' : 'User'})`;
    
    // Update dashboard description
    const description = isAdmin 
        ? 'Manage your support services, inventory, and view analytics.'
        : 'Access support chat, browse repair guides, and check available parts.';
    document.getElementById('dashboardDescription').textContent = description;
    
    // Update active chats count based on role
    
    
    // Create dashboard cards
    createDashboardCards(isAdmin);
});

function createDashboardCards(isAdmin) {
    const cardsContainer = document.getElementById('dashboardCards');
    
    const cards = [
        {
            icon: 'fas fa-comments',
            iconColor: '#3b82f6',
            title: 'Live Chat',
            description: isAdmin ? 'Chat with customers and provide support' : 'Get help from our support team',
            buttonText: isAdmin ? 'Manage Chats' : 'Start Chat',
            link: 'chat.html'
        },
        {
            icon: 'fas fa-book-open',
            iconColor: '#10b981',
            title: 'Repair Guides',
            description: isAdmin ? 'Create and manage repair tutorials' : 'Learn how to fix devices yourself',
            buttonText: isAdmin ? 'Manage Posts' : 'Browse Guides',
            link: 'blog.html'
        },
        {
            icon: 'fas fa-box',
            iconColor: '#8b5cf6',
            title: 'Parts Inventory',
            description: isAdmin ? 'Manage inventory and pricing' : 'Browse available parts and prices',
            buttonText: isAdmin ? 'Manage Inventory' : 'Browse Parts',
            link: 'inventory.html'
        }
    ];
    
    // Add analytics card for admin
    if (isAdmin) {
        cards.push({
            icon: 'fas fa-chart-bar',
            iconColor: '#f59e0b',
            title: 'Analytics',
            description: 'View demand trends and popular content',
            buttonText: 'View Analytics',
            link: 'analytics.html'
        });
    }
    
    cardsContainer.innerHTML = cards.map(card => `
        <div class="card">
            <div class="card-header">
                <i class="${card.icon}" style="color: ${card.iconColor};"></i>
                <h3>${card.title}</h3>
            </div>
            <div class="card-description">${card.description}</div>
            <a href="${card.link}">
                <button class="btn btn-primary">${card.buttonText}</button>
            </a>
        </div>
    `).join('');
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}