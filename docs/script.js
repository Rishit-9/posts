let allPosts = [];

// Navigation Toggles
function toggleLeftNav() { document.getElementById('leftNav').classList.toggle('active'); }
function toggleRightNav() { document.getElementById('rightNav').classList.toggle('active'); }

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
    } catch (e) { console.error("Error:", e); }
}

function renderPosts(posts) {
    const container = document.getElementById('app');
    container.innerHTML = posts.map(post => `
        <article class="post" onclick="openPost('${post.id}')">
            <div class="avatar">${post.title.charAt(0)}</div>
            <div class="post-body">
                <div class="post-header"><b>Admin</b> <span>@me · ${post.date}</span></div>
                <div class="post-text">${post.previewText}</div>
                ${post.images && post.images.length ? `<img src="${post.images[0]}" class="post-img">` : ''}
            </div>
        </article>
    `).join('');
}

function renderTrends() {
    const tagMap = {};
    allPosts.flatMap(p => p.tags).forEach(t => tagMap[t] = (tagMap[t] || 0) + 1);
    const container = document.getElementById('tagCloud');
    container.innerHTML = Object.keys(tagMap).map(tag => `
        <a href="#" class="tag-link" onclick="filterByTag('${tag}'); toggleRightNav();">#${tag} <br><small style="color:var(--dimText)">${tagMap[tag]} posts</small></a>
    `).join('');
}

function filterByTag(tag) {
    const filtered = allPosts.filter(p => p.tags.includes(tag));
    renderPosts(filtered);
    window.scrollTo(0,0);
}

// Unified Search
const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allPosts.filter(p => p.title.toLowerCase().includes(term) || p.previewText.toLowerCase().includes(term));
    renderPosts(filtered);
};

document.getElementById('searchBar').addEventListener('input', handleSearch);
document.getElementById('searchBarMobile').addEventListener('input', handleSearch);

// Modal and Theme logic...
function openPost(id) {
    const post = allPosts.find(p => p.id === id);
    if (!post) return;
    window.location.hash = id;
    const modal = document.getElementById('modal');
    document.getElementById('modalBody').innerHTML = `
        <div class="post-header"><b>Admin</b> <span style="color:var(--dimText)">@me</span></div>
        <div class="post-text" style="font-size:1.1rem; margin-top:15px;">${post.fullContent}</div>
        ${post.images.map(img => `<img src="${img}" class="post-img">`).join('')}
    `;
    modal.style.display = 'block';
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
