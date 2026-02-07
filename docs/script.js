let allPosts = [];

// Drawer Logic
function toggleNav(id) {
    const el = document.getElementById(id);
    el.classList.toggle('active');
}

// Auto-close drawers when clicking outside or on a selection
document.addEventListener('click', (e) => {
    if (window.innerWidth < 1000) {
        if (e.target.classList.contains('active')) {
            e.target.classList.remove('active');
        }
    }
});

async function init() {
    try {
        const res = await fetch('posts.json');
        const files = await res.json();
        const promises = files.map(f => fetch(`data/${f}`).then(r => r.json()));
        allPosts = await Promise.all(promises);
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderPosts(allPosts);
        renderTrends();
        checkURL();
    } catch (e) { console.error("Init failed", e); }
}

function renderPosts(posts) {
    const app = document.getElementById('app');
    app.innerHTML = posts.map(p => `
        <article class="post" onclick="openPost('${p.id}')">
            <div class="avatar">${p.title.charAt(0)}</div>
            <div class="body">
                <div class="header"><b>Admin</b> <span style="color:var(--dimText)">@me · ${p.date}</span></div>
                <div class="text" style="margin:8px 0;">${p.previewText}</div>
                ${p.images && p.images.length ? `<img src="${p.images[0]}" class="post-img">` : ''}
            </div>
        </article>
    `).join('');
}

function renderTrends() {
    const tags = [...new Set(allPosts.flatMap(p => p.tags))];
    const container = document.getElementById('tagCloud');
    container.innerHTML = tags.map(t => `
        <div class="nav-item" style="font-size:1rem;" onclick="filterByTag('${t}')">#${t}</div>
    `).join('');
}

function filterByTag(tag) {
    const filtered = allPosts.filter(p => p.tags.includes(tag));
    renderPosts(filtered);
    if (window.innerWidth < 1000) document.getElementById('rightNav').classList.remove('active');
}

document.getElementById('searchBar').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allPosts.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.previewText.toLowerCase().includes(term) ||
        p.tags.some(t => t.toLowerCase().includes(term))
    );
    renderPosts(filtered);
});

function openPost(id) {
    const post = allPosts.find(p => p.id === id);
    if (!post) return;
    window.location.hash = id;
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="header"><b>Admin</b> @me</div>
        <p style="font-size:1.2rem; line-height:1.6;">${post.fullContent}</p>
        ${post.images.map(img => `<img src="${img}" class="post-img">`).join('')}
        <div style="margin-top:20px; color:var(--accent)">${post.tags.map(t => `#${t}`).join(' ')}</div>
    `;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; window.location.hash = ''; }
function closeModalOnSideClick(e) { if (e.target.id === 'modal') closeModal(); }

document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    root.setAttribute('data-theme', root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

function checkURL() {
    const id = window.location.hash.substring(1);
    if (id) openPost(id);
}

window.onhashchange = checkURL;
init();
