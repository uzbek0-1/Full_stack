document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
});

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

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.error) {
            alert(data.error);
        } else {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userRole', data.role);
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        alert('Error logging in. Is the server running?');
    }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.error) {
            alert(data.error);
        } else {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userRole', data.role);
            alert('Registration successful!');
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        alert('Error registering. Is the server running?');
    }
});

function logout() {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}