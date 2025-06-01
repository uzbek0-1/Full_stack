// Initialize analytics page
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    
    if (!isLoggedIn || userRole !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load analytics data
    loadServicesChart();
    loadTrendsChart();
    loadPartsChart();
    loadBlogChart();
});

function loadServicesChart() {
    const servicesData = [
        { service: 'Screen Repair', requests: 45, trend: '+12%' },
        { service: 'Battery Replacement', requests: 38, trend: '+8%' },
        { service: 'Water Damage', requests: 22, trend: '-5%' },
        { service: 'Software Issues', requests: 31, trend: '+15%' },
        { service: 'Charging Port', requests: 19, trend: '+3%' }
    ];
    
    const container = document.getElementById('servicesChart');
    container.innerHTML = servicesData.map((service, index) => `
        <div class="service-item">
            <div class="service-info">
                <div class="service-rank">${index + 1}</div>
                <div class="service-details">
                    <h4>${service.service}</h4>
                    <p>${service.requests} requests</p>
                </div>
            </div>
            <span class="badge ${service.trend.startsWith('+') ? 'trend-positive' : 'trend-negative'}">
                ${service.trend}
            </span>
        </div>
    `).join('');
}

function loadTrendsChart() {
    const trendsData = [
        { month: 'Jan', chats: 120, posts: 8, sales: 45 },
        { month: 'Feb', chats: 135, posts: 12, sales: 52 },
        { month: 'Mar', chats: 148, posts: 15, sales: 61 },
        { month: 'Apr', chats: 162, posts: 18, sales: 58 },
        { month: 'May', chats: 178, posts: 22, sales: 67 },
        { month: 'Jun', chats: 195, posts: 25, sales: 73 }
    ];
    
    const container = document.getElementById('trendsChart');
    const maxValue = Math.max(...trendsData.map(d => Math.max(d.chats, d.posts * 8, d.sales)));
    
    container.innerHTML = `
        <div style="display: flex; align-items: end; gap: 1rem; height: 250px; width: 100%;">
            ${trendsData.map(data => `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                    <div style="display: flex; align-items: end; gap: 2px; height: 200px;">
                        <div style="width: 20px; background: #3b82f6; height: ${(data.chats / maxValue) * 200}px; border-radius: 2px;" title="Chats: ${data.chats}"></div>
                        <div style="width: 20px; background: #10b981; height: ${(data.posts * 8 / maxValue) * 200}px; border-radius: 2px;" title="Posts: ${data.posts}"></div>
                        <div style="width: 20px; background: #f59e0b; height: ${(data.sales / maxValue) * 200}px; border-radius: 2px;" title="Sales: ${data.sales}"></div>
                    </div>
                    <span style="font-size: 0.75rem; color: #6b7280;">${data.month}</span>
                </div>
            `).join('')}
        </div>
        <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; font-size: 0.875rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 2px;"></div>
                <span>Chats</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 12px; height: 12px; background: #10b981; border-radius: 2px;"></div>
                <span>Posts</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 2px;"></div>
                <span>Sales</span>
            </div>
        </div>
    `;
}

function loadPartsChart() {
    const partsData = [
        { part: 'iPhone Screens', requests: 67, category: 'Phone Parts' },
        { part: 'Laptop Batteries', requests: 43, category: 'Laptop Parts' },
        { part: 'Phone Batteries', requests: 38, category: 'Phone Parts' },
        { part: 'Cooling Fans', requests: 25, category: 'Gaming Console' },
        { part: 'Keyboards', requests: 21, category: 'Laptop Parts' }
    ];
    
    const container = document.getElementById('partsChart');
    const maxRequests = Math.max(...partsData.map(p => p.requests));
    
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${partsData.map(part => `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="min-width: 120px; font-size: 0.875rem; font-weight: 500;">${part.part}</div>
                    <div style="flex: 1; background: #f1f5f9; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="width: ${(part.requests / maxRequests) * 100}%; height: 100%; background: #8b5cf6; border-radius: 10px;"></div>
                    </div>
                    <div style="min-width: 40px; text-align: right; font-size: 0.875rem; font-weight: 600;">${part.requests}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function loadBlogChart() {
    const blogData = [
        { title: 'iPhone Battery Replacement Guide', views: 2100, category: 'Phone Repair' },
        { title: 'How to Fix a Flickering Laptop Screen', views: 1250, category: 'Laptop Repair' },
        { title: 'Troubleshooting Gaming Console Overheating', views: 890, category: 'Gaming Console' },
        { title: 'MacBook Water Damage Recovery', views: 756, category: 'Laptop Repair' },
        { title: 'Android Phone Won\'t Turn On', views: 634, category: 'Phone Repair' }
    ];
    
    const container = document.getElementById('blogChart');
    
    container.innerHTML = blogData.map((post, index) => `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: flex-start; gap: 1rem; flex: 1;">
                <div style="width: 2rem; height: 2rem; border-radius: 50%; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem;">
                    ${index + 1}
                </div>
                <div style="flex: 1;">
                    <p style="font-weight: 500; font-size: 0.875rem; line-height: 1.4; margin-bottom: 0.5rem;">${post.title}</p>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span class="badge badge-secondary" style="font-size: 0.75rem;">${post.category}</span>
                        <span style="font-size: 0.75rem; color: #6b7280;">${post.views} views</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}