let allPosts = [];

async function init() {
    try {
        const response = await fetch('posts.json');
        const fileList = await response.json();
        const postPromises = fileList.map(file => fetch(`data/${file}`).then(res => res.json()));
        
        allPosts = await Promise.all(postPromises);
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderPosts(allPosts);
        renderTrends();
        checkURL();
    } catch (e) {
        document.getElementById('app').innerHTML = `<p style="padding:20px;">Add your first post to data/ folder.</p>`;
    }
}

function renderPosts(posts) {
    const container = document.getElementById('app');
    container.innerHTML = posts.map(post => `
        <article class="post" onclick="openPost('${post.id}')">
            <div class="avatar">${post.title.charAt(0)}</div>
            <div class="post-body">
                <div class="post-header">
                    <b>Admin</b> <span>@me · ${post.date}</span>
                </div>
                <div class="post-text">${post.previewText}</div>
                ${post.images && post.images.length ? `<img src="${post.images[0]}" class="post-img" alt="post image">` : ''}
                <div style="color:var(--accent); margin-top:10px; font-size:0.9rem;">
                    ${post.tags.map(t => `#${t}`).join(' ')}
                </div>
            </div>
        </article>
    `).join('');
}

function renderTrends() {
    const tagMap = {};
    allPosts.flatMap(p => p.tags).forEach(t => tagMap[t] = (tagMap[t] || 0) + 1);
    const container = document.getElementById('tagCloud');
    container.innerHTML = Object.keys(tagMap).map(tag => `
        <a href="#" class="tag-link" onclick="filterByTag('${tag}')">#${tag} <br><small style="font-weight:normal;color:var(--dimText)">${tagMap[tag]} posts</small></a>
    `).join('');
}

function filterByTag(tag) {
    const filtered = allPosts.filter(p => p.tags.includes(tag));
    renderPosts(filtered);
    document.getElementById('feedTitle').innerText = `#${tag}`;
}

function openPost(id) {
    const post = allPosts.find(p => p.id === id);
    if (!post) return;
    window.location.hash = id;
    const modal = document.getElementById('modal');
    document.getElementById('modalBody').innerHTML = `
        <div class="post-header">
            <div class="avatar">${post.title.charAt(0)}</div>
            <div style="margin-left:10px"><b>Admin</b><br><small style="color:var(--dimText)">@me</small></div>
        </div>
        <div class="post-text" style="font-size:1.2rem; margin-top:20px;">${post.fullContent}</div>
        <div class="gallery">
            ${post.images.map(img => `<img src="${img}" class="post-img">`).join('')}
        </div>
        <div style="color:var(--dimText); margin-top:20px; font-size:0.9rem; border-top:1px solid var(--border); padding-top:15px;">
            ${post.date} · Svalipi Posts
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

function closeModalOnSideClick(e) { if (e.target.id === 'modal') closeModal(); }

document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

document.getElementById('searchBar').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allPosts.filter(p => p.title.toLowerCase().includes(term) || p.previewText.toLowerCase().includes(term));
    renderPosts(filtered);
});

function checkURL() {
    const id = window.location.hash.substring(1);
    if (id) openPost(id);
}

window.onhashchange = checkURL;
init();
