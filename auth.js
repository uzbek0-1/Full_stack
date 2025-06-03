document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
        window.location.href = 'dashboard.html';
    }
});

// Tab switching
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Mock authentication with admin password
    const isAdmin = email === 'admin@dernsupport.com' && password === 'adminPassword';
    const userRole = isAdmin ? 'admin' : 'user';
    
    // Store user session
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');
    
    window.location.href = 'dashboard.html';
});

// Register form handler
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    // Mock registration
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');
    
    window.location.href = 'dashboard.html';
});
function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.length === 0) {
        alert('No registered users. Please sign up first.');
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', user.role);
        window.location.href = 'index.html';
    } else {
        alert('Invalid email or password');
    }
}