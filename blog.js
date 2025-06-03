let userRole = '';
let posts = [];

// Initialize blog page
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

    // Load posts from backend
    await loadPosts();

    // Display posts
    displayPosts();
});

function updatePageContent(isAdmin) {
    document.getElementById('blogTitle').textContent = isAdmin ? 'Manage Repair Guides' : 'Repair Guides';
    document.getElementById('blogHeader').textContent = isAdmin ? 'Your Repair Guides' : 'Learn to Fix Your Devices';
    document.getElementById('blogDescription').textContent = isAdmin
        ? 'Create and manage repair tutorials for your customers.'
        : 'Step-by-step guides to help you repair your electronic devices.';

    if (isAdmin) {
        document.getElementById('createPostBtn').classList.remove('hidden');
    }

    document.getElementById('emptyBlogText').textContent = isAdmin
        ? 'Create your first repair guide to help customers.'
        : 'Check back later for new repair guides.';
}

async function loadPosts() {
    try {
        const response = await fetch('http://localhost:3000/api/posts', {
            headers: {
                'userRole': localStorage.getItem('userRole'),
                'userEmail': localStorage.getItem('userEmail')
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        posts = await response.json();
        console.log('Loaded posts:', posts.length);
    } catch (err) {
        console.error('Error loading posts:', err);
        // Show user-friendly error message
        showErrorMessage('Failed to load blog posts. Please check your connection and try again.');
        posts = [];
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #fee2e2;
        color: #dc2626;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        border: 1px solid #fecaca;
    `;
    errorDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(errorDiv, mainContent.firstChild);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        background: #dcfce7;
        color: #16a34a;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        border: 1px solid #bbf7d0;
    `;
    successDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(successDiv, mainContent.firstChild);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function displayPosts() {
    const postsContainer = document.getElementById('blogPosts');
    const emptyState = document.getElementById('emptyBlogState');
    const isAdmin = userRole === 'admin';

    if (posts.length === 0) {
        emptyState.classList.remove('hidden');
        postsContainer.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');

    postsContainer.innerHTML = posts
        .map(
            post => `
        <div class="post-card" onclick="viewPost('${post.id}')">
            <div class="post-header">
                <span class="badge badge-secondary">${post.category}</span>
                ${
                    isAdmin
                        ? `
                    <div class="post-actions">
                        <button onclick="event.stopPropagation(); editPost('${post.id}')" title="Edit post">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="event.stopPropagation(); deletePost('${post.id}')" title="Delete post">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
                        : ''
                }
            </div>
            <div class="post-title">${post.title}</div>
            <div class="post-excerpt">${post.content.substring(0, 100)}...</div>
            <div class="post-meta">
                <div class="post-meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="post-meta-item">
                    <i class="fas fa-eye"></i>
                    <span>${post.views || 0}</span>
                </div>
            </div>
            <button class="btn btn-secondary" onclick="event.stopPropagation(); viewPost('${post.id}')">
                Read Guide
            </button>
        </div>
    `
        )
        .join('');
}

async function viewPost(postId) {
    try {
        // Get the post details
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            headers: {
                'userRole': localStorage.getItem('userRole'),
                'userEmail': localStorage.getItem('userEmail')
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }
        
        const post = await response.json();

        // Increment view count
        await fetch(`http://localhost:3000/api/posts/${postId}/views`, {
            method: 'PATCH',
            headers: {
                'userRole': localStorage.getItem('userRole'),
                'userEmail': localStorage.getItem('userEmail')
            }
        });

        // Show post detail modal
        const modal = document.getElementById('postDetailModal');
        const content = document.getElementById('postDetailContent');
        const isAdmin = userRole === 'admin';

        content.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <span class="badge badge-secondary">${post.category}</span>
        </div>
        <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">${post.title}</h2>
        <div style="display: flex; gap: 2rem; margin-bottom: 2rem; font-size: 0.875rem; color: #6b7280;">
            <div class="post-meta-item">
                <i class="fas fa-calendar"></i>
                <span>${new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="post-meta-item">
                <i class="fas fa-eye"></i>
                <span>${(post.views || 0) + 1} views</span>
            </div>
            <div class="post-meta-item">
                <i class="fas fa-user"></i>
                <span>By ${post.author}</span>
            </div>
        </div>
        ${
            isAdmin
                ? `
            <div style="margin-bottom: 1rem;">
                <button class="btn btn-secondary" onclick="editPost('${post.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary" onclick="deletePost('${post.id}'); hidePostDetail();" style="margin-left: 0.5rem;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `
                : ''
        }
        <div style="white-space: pre-line; line-height: 1.6;">
            ${post.content}
        </div>
    `;

        modal.classList.remove('hidden');
        
        // Refresh posts to update view count
        await loadPosts();
        displayPosts();
    } catch (err) {
        console.error('Error viewing post:', err);
        showErrorMessage('Failed to load post details.');
    }
}

function hidePostDetail() {
    document.getElementById('postDetailModal').classList.add('hidden');
}

function showCreateModal() {
    document.getElementById('createPostModal').classList.remove('hidden');
    // Reset form
    document.getElementById('createPostForm').reset();
    // Ensure form is set to create mode
    document.getElementById('createPostForm').onsubmit = createPost;
}

function hideCreateModal() {
    document.getElementById('createPostModal').classList.add('hidden');
    document.getElementById('createPostForm').reset();
}

async function editPost(postId) {
    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            headers: {
                'userRole': localStorage.getItem('userRole'),
                'userEmail': localStorage.getItem('userEmail')
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch post for editing');
        }
        
        const post = await response.json();
        
        // Populate form with existing data
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postCategory').value = post.category;
        document.getElementById('postContent').value = post.content;

        showCreateModal();

        // Change form submission to update instead of create
        const form = document.getElementById('createPostForm');
        form.onsubmit = function (e) {
            e.preventDefault();
            updatePost(postId);
        };
    } catch (err) {
        console.error('Error fetching post for edit:', err);
        showErrorMessage('Failed to load post for editing.');
    }
}

async function updatePost(postId) {
    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value.trim();
    const content = document.getElementById('postContent').value.trim();

    if (!title || !category || !content) {
        showErrorMessage('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'userRole': localStorage.getItem('userRole'),
                'userEmail': localStorage.getItem('userEmail')
            },
            body: JSON.stringify({ title, category, content })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update post');
        }
        
        showSuccessMessage('Post updated successfully!');
        await loadPosts();
        displayPosts();
        hideCreateModal();
        hidePostDetail();

        // Reset form submission to create mode
        document.getElementById('createPostForm').onsubmit = createPost;
    } catch (err) {
        console.error('Error updating post:', err);
        showErrorMessage('Failed to update post. Please try again.');
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'userRole': localStorage.getItem('userRole'),
                'userEmail': localStorage.getItem('userEmail')
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete post');
        }
        
        showSuccessMessage('Post deleted successfully!');
        await loadPosts();
        displayPosts();
    } catch (err) {
        console.error('Error deleting post:', err);
        showErrorMessage('Failed to delete post. Please try again.');
    }
}

// Create post form handler
document.getElementById('createPostForm').addEventListener('submit', createPost);

async function createPost(e) {
    e.preventDefault();

    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value.trim();
    const content = document.getElementById('postContent').value.trim();

    if (!title || !category || !content) {
        showErrorMessage('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'userRole': localStorage.getItem('userRole'),
                'userEmail': localStorage.getItem('userEmail')
            },
            body: JSON.stringify({ title, category, content })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create post');
        }
        
        showSuccessMessage('Post created successfully!');
        await loadPosts();
        displayPosts();
        hideCreateModal();
    } catch (err) {
        console.error('Error creating post:', err);
        showErrorMessage('Failed to create post. Please try again.');
    }
}