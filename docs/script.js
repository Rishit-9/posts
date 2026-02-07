let allPosts = [];

function toggleDrawer(id) {
    document.getElementById(id).classList.toggle('active');
    document.getElementById('drawer-overlay').classList.toggle('active');
}

function closeAllDrawers() {
    document.getElementById('leftNav').classList.remove('active');
    document.getElementById('rightNav').classList.remove('active');
    document.getElementById('drawer-overlay').classList.remove('active');
}

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
    } catch (e) { console.error("Load failed", e); }
}

function renderPosts(posts) {
    const container = document.getElementById('app');
    container.innerHTML = posts.map(p => `
        <article class="post" onclick="openPost('${p.id}')">
            <div class="avatar">${p.title.charAt(0)}</div>
            <div class="post-body">
                <div class="post-header"><b>Admin</b> <span style="color:var(--dim)">@me · ${p.date}</span></div>
                <div class="post-text" style="margin-top:5px;">${p.previewText}</div>
                ${p.images && p.images.length ? `<img src="${p.images[0]}" class="post-img">` : ''}
                <div style="margin-top:10px; color:var(--accent); font-weight:600;">
                    ${p.tags.map(t => `#${t}`).join(' ')}
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
        <div class="nav-link" style="font-size:1rem; border-bottom: 1px solid var(--border); border-radius:0;" onclick="filterByTag('${tag}'); closeAllDrawers();">
            <div style="color:var(--accent); font-weight:bold;">#${tag}</div>
            <div style="font-size:0.8rem; color:var(--dim)">${tagMap[tag]} posts</div>
        </div>
    `).join('');
}

function filterByTag(tag) {
    const filtered = allPosts.filter(p => p.tags.includes(tag));
    renderPosts(filtered);
    document.querySelector('.feed-header h2').innerText = `#${tag}`;
}

function openPost(id) {
    const post = allPosts.find(p => p.id === id);
    if (!post) return;
    window.location.hash = id;
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="post-header" style="display:flex; gap:12px; margin-bottom:20px;">
            <div class="avatar">${post.title.charAt(0)}</div>
            <div><b>Admin</b><br><small style="color:var(--dim)">@me</small></div>
        </div>
        <div style="font-size:1.15rem; line-height:1.6; white-space:pre-wrap;">${post.fullContent}</div>
        ${post.images.map(img => `<img src="${img}" class="post-img">`).join('')}
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
