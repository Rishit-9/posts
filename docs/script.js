let allPosts = [];

async function init() {
    try {
        const response = await fetch('posts.json');
        const fileList = await response.json();
        
        const postPromises = fileList.map(file => 
            fetch(`data/${file}`).then(res => res.json())
        );
        
        allPosts = await Promise.all(postPromises);
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
        
        renderPosts(allPosts);
        renderTagCloud();
        checkURL();
    } catch (e) {
        document.getElementById('app').innerHTML = "Error loading posts. Check console.";
    }
}

function renderPosts(posts) {
    const container = document.getElementById('app');
    if (posts.length === 0) {
        container.innerHTML = "<h3>No posts found.</h3>";
        return;
    }
    container.innerHTML = posts.map(post => `
        <div class="post-card" onclick="openPost('${post.id}')">
            ${post.images && post.images.length ? `<img src="${post.images[0]}" loading="lazy">` : ''}
            <div class="post-info">
                <small>${new Date(post.date).toLocaleDateString()}</small>
                <h2>${post.title}</h2>
                <p>${post.previewText}</p>
                <div>${post.tags.map(t => `<span class="tag">#${t}</span>`).join('')}</div>
            </div>
        </div>
    `).join('');
}

function renderTagCloud() {
    const tags = [...new Set(allPosts.flatMap(p => p.tags))];
    const container = document.getElementById('tagCloud');
    container.innerHTML = tags.map(t => `<span class="tag" onclick="filterByTag('${t}')">#${t}</span>`).join('');
}

function filterByTag(tag) {
    const filtered = allPosts.filter(p => p.tags.includes(tag));
    renderPosts(filtered);
}

function openPost(id) {
    const post = allPosts.find(p => p.id === id);
    if (!post) return;

    window.location.hash = id;
    const modal = document.getElementById('modal');
    const body = document.getElementById('modalBody');

    body.innerHTML = `
        <header style="background:transparent; border:none; padding:0; position:relative;">
            <small>${post.date}</small>
            <h1 style="font-size:2.5rem; margin:10px 0;">${post.title}</h1>
        </header>
        <div class="modal-tags" style="margin-bottom:20px;">
            ${post.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
        </div>
        <div class="images-gallery">
            ${post.images.map(img => `<img src="${img}" style="width:100%; border-radius:20px; margin-bottom:20px; box-shadow:0 5px 15px rgba(0,0,0,0.2)">`).join('')}
        </div>
        <div class="content" style="font-size:1.2rem; line-height:1.8; white-space: pre-wrap;">
            ${post.fullContent}
        </div>
    `;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    window.location.hash = '';
}

function closeModalOnSideClick(e) {
    if (e.target.id === 'modal') closeModal();
}

// Search logic
document.getElementById('searchBar').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allPosts.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.tags.some(t => t.toLowerCase().includes(term))
    );
    renderPosts(filtered);
});

// Theme Switcher
document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

// Routing
function checkURL() {
    const id = window.location.hash.substring(1);
    if (id) openPost(id);
}

window.onhashchange = checkURL;
init();
