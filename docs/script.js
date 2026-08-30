let allPosts = [];

function toggleDrawer(id) {
    document.getElementById(id).classList.toggle('active');
    document.getElementById('drawer-overlay').classList.toggle('active');
}

function closeAllDrawers() {
    document.querySelectorAll('.sidebar').forEach(s => s.classList.remove('active'));
    document.getElementById('drawer-overlay').classList.remove('active');
}

function formatLocalTime(dateStr) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; 
        return d.toLocaleString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    } catch (e) {
        return dateStr;
    }
}

function resetFeed() {
    renderPosts(allPosts);
    document.querySelector('.feed-header h2').innerText = 'Home';
    document.getElementById('searchBar').value = '';
    window.location.hash = '';
    closeAllDrawers();
}

// Share Button Logic
function sharePost(id, e) {
    if (e) e.stopPropagation(); 
    
    let siteUrl = window.location.origin + window.location.pathname;
    if (!siteUrl.endsWith('/')) siteUrl += '/';
    const shareLink = `${siteUrl}p/${id}.html`;
    
    navigator.clipboard.writeText(shareLink).then(() => {
        const btn = e.target.closest('.share-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.style.color = '#00ba7c'; 
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = '';
        }, 2000);
    });
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
    } catch (e) { 
        document.getElementById('app').innerHTML = `<div style="padding:20px;">No posts found. Add a JSON file!</div>`;
    }
}

function renderPosts(posts) {
    const container = document.getElementById('app');
    container.innerHTML = posts.map(p => `
        <article class="post" onclick="openPost('${p.id}')">
            <div class="avatar" style="font-size:1rem; letter-spacing:-0.5px;">RG</div>
            <div class="post-body">
                <div class="post-header"><b>Rishit</b> <span style="color:var(--dim)">@me · ${formatLocalTime(p.date)}</span></div>
                <div class="post-text" style="margin: 8px 0;">${p.previewText}</div>
                ${p.images && p.images.length ? `<img src="${p.images[0]}" class="post-img" onerror="this.style.display='none'">` : ''}
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                    <div style="color:var(--accent); font-weight:600;">
                        ${p.tags.map(t => `#${t}`).join(' ')}
                    </div>
                    <button class="share-btn" onclick="sharePost('${p.id}', event)">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></svg>
                    </button>
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
        <div class="trend-item" onclick="filterByTag('${tag}'); closeAllDrawers();">
            <div style="font-size:0.8rem; color:var(--dim)">Trending</div>
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
        <div style="display:flex; gap:12px; margin-bottom:20px;">
            <div class="avatar" style="font-size:1rem; letter-spacing:-0.5px;">RG</div>
            <div>
                <b>Rishit</b> <span style="color:var(--dim)">@me</span>
                <div style="color:var(--dim); font-size:0.9rem;">${formatLocalTime(post.date)}</div>
            </div>
        </div>
        <div style="font-size:1.2rem; line-height:1.6; white-space:pre-wrap; margin-bottom:15px;">${post.fullContent}</div>
        ${post.images.map(img => `<img src="${img}" class="post-img" onerror="this.style.display='none'">`).join('')}
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
            <div style="color:var(--accent); font-weight:bold;">
                ${post.tags.map(t => `#${t}`).join(' ')}
            </div>
            <button class="share-btn" onclick="sharePost('${post.id}', event)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></svg>
            </button>
        </div>
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
