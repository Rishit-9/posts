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
    } catch (e) { console.error(e); }
}

function renderPosts(posts) {
    const container = document.getElementById('app');
    container.innerHTML = posts.map(post => `
        <article class="post" onclick="openPost('${post.id}')">
            <div class="avatar-placeholder">${post.title.charAt(0)}</div>
            <div class="post-body">
                <div class="post-header">
                    <b>MyName</b> <span>@me · ${new Date(post.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                </div>
                <div class="post-text">${post.previewText}</div>
                ${post.images && post.images.length ? `
                    <div class="post-img-container">
                        <img src="${post.images[0]}" loading="lazy">
                    </div>
                ` : ''}
                <div style="margin-top:10px; color:var(--accent); font-size:0.8rem;">
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
        <div class="trend-item" onclick="filterByTag('${tag}')">
            <span class="trend-count">Trending</span>
            <span class="trend-tag">#${tag}</span>
            <span class="trend-count">${tagMap[tag]} posts</span>
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
    const modal = document.getElementById('modal');
    document.getElementById('modalBody').innerHTML = `
        <div class="post-header">
            <div class="avatar-placeholder">${post.title.charAt(0)}</div>
            <div style="margin-left:10px"><b>MyName</b><br><small style="color:var(--dimText)">@me</small></div>
        </div>
        <div class="post-text" style="font-size:1.3rem; margin-top:15px;">${post.fullContent}</div>
        <div class="images-gallery">
            ${post.images.map(img => `<img src="${img}" style="width:100%; border-radius:16px; margin-top:15px;">`).join('')}
        </div>
        <div style="color:var(--dimText); padding:15px 0; border-bottom:1px solid var(--border)">
            ${new Date(post.date).toLocaleTimeString()} · ${new Date(post.date).toLocaleDateString()}
        </div>
    `;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    window.location.hash = '';
}

function closeModalOnSideClick(e) { if (e.target.id === 'modal') closeModal(); }

document.getElementById('searchBar').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allPosts.filter(p => p.title.toLowerCase().includes(term) || p.previewText.toLowerCase().includes(term));
    renderPosts(filtered);
});

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
