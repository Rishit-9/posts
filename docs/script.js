let allPosts = [];

function toggleDrawer(id) {
    document.getElementById(id).classList.toggle('active');
    document.getElementById('drawer-overlay').classList.toggle('active');
}

function closeAllDrawers() {
    document.querySelectorAll('.sidebar').forEach(s => s.classList.remove('active'));
    document.getElementById('drawer-overlay').classList.remove('active');
}

// 🕒 NEW: Converts the post's time to the viewer's local device time
function formatLocalTime(dateStr) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; // Fallback if format is weird
        
        // Formats to e.g., "Aug 31, 2026, 4:37 PM"
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

async function init() {
    try {
        const res = await fetch('posts.json');
        const files = await res.json();
        const promises = files.map(f => fetch(`data/${f}`).then(r => r.json()));
        allPosts = await Promise.all(promises);
        
        // Sorting works perfectly with the new full timestamps
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
            <!-- PFP updated to RG -->
            <div class="avatar" style="font-size:1rem; letter-spacing:-0.5px;">RG</div>
            <div class="post-body">
                <!-- Username updated to Rishit and Date uses formatLocalTime -->
                <div class="post-header"><b>Rishit</b> <span style="color:var(--dim)">@me · ${formatLocalTime(p.date)}</span></div>
                <div class="post-text" style="margin: 8px 0;">${p.previewText}</div>
                ${p.images && p.images.length ? `<img src="${p.images[0]}" class="post-img" onerror="this.style.display='none'">` : ''}
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
            <!-- PFP updated to RG -->
            <div class="avatar" style="font-size:1rem; letter-spacing:-0.5px;">RG</div>
            <div>
                <!-- Username updated to Rishit -->
                <b>Rishit</b> <span style="color:var(--dim)">@me</span>
                <div style="color:var(--dim); font-size:0.9rem;">${formatLocalTime(post.date)}</div>
            </div>
        </div>
        <div style="font-size:1.2rem; line-height:1.6; white-space:pre-wrap; margin-bottom:15px;">${post.fullContent}</div>
        ${post.images.map(img => `<img src="${img}" class="post-img" onerror="this.style.display='none'">`).join('')}
        <div style="margin-top:15px; color:var(--accent); font-weight:bold;">
            ${post.tags.map(t => `#${t}`).join(' ')}
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
