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
    } catch (e) { console.error("Loading error:", e); }
}

function renderPosts(posts) {
    const container = document.getElementById('app');
    container.innerHTML = posts.map(post => `
        <article class="post" onclick="openPost('${post.id}')">
            <div class="avatar"></div>
            <div class="post-body">
                <div class="post-header">
                    <b>MyName</b> <span>@me · ${post.date}</span>
                </div>
                <div class="post-text">${post.previewText}</div>
                ${post.images && post.images.length ? `<img src="${post.images[0]}" class="post-img">` : ''}
                <div style="color:var(--accent); margin-top:8px; font-size:0.9rem;">
                    ${post.tags.map(t => `#${t}`).join(' ')}
                </div>
            </div>
        </article>
    `).join('');
}

function renderTrends() {
    const tags = [...new Set(allPosts.flatMap(p => p.tags))];
    const container = document.getElementById('tagCloud');
    container.innerHTML = tags.map(t => `
        <a href="#" class="tag-link" onclick="filterByTag('${t}')">#${t}</a>
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
        <div class="post-header"><b>MyName</b> <span style="color:var(--dimText)">@me</span></div>
        <div class="post-text" style="font-size:1.2rem; margin-top:10px;">${post.fullContent}</div>
        ${post.images.map(img => `<img src="${img}" class="post-img" style="margin-top:10px;">`).join('')}
    `;
    modal.style.display = 'block';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; window.location.hash = ''; }
function closeModalOnSideClick(e) { if (e.target.id === 'modal') closeModal(); }

document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
});

function checkURL() {
    const id = window.location.hash.substring(1);
    if (id) openPost(id);
}

window.onhashchange = checkURL;
init();
