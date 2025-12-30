const CURRENT_VIEWING_ID = 1; 

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();
    setupProfileInteractions();
    
    const defaultTab = document.querySelector('.tab-btn');
    if (defaultTab) {
        switchTab('posts', defaultTab); 
    }
});

function setupProfileInteractions() {
    const actionsContainer = document.querySelector('.profile-actions');
    if (!actionsContainer) return;

    const followBtn = actionsContainer.querySelector('.btn-action.primary');
    if (followBtn) {
        followBtn.addEventListener('click', () => {
            const isFollowing = followBtn.classList.contains('following');
            
            if (isFollowing) {
                followBtn.classList.remove('following');
                followBtn.textContent = 'Seguir';
                followBtn.style.background = ''; 
                followBtn.style.color = '';
                followBtn.style.border = '';
            } else {
                followBtn.classList.add('following');
                followBtn.textContent = 'Seguindo';
                followBtn.style.background = 'transparent';
                followBtn.style.border = '1px solid var(--neon-purple)';
                followBtn.style.color = 'var(--neon-purple)';
            }
        });
    }

    const msgBtn = actionsContainer.querySelector('.btn-action:not(.primary)');
    if (msgBtn) {
        msgBtn.addEventListener('click', () => {
            window.location.href = 'server.html';
        });
    }
}

async function loadUserProfile() {
    try {
        const user = await API.getProfile(CURRENT_VIEWING_ID);
        
        if (user) {
            const nameContainer = document.querySelector('.username');
            if (nameContainer) {
                while (nameContainer.firstChild) {
                    nameContainer.removeChild(nameContainer.firstChild);
                }
                
                nameContainer.appendChild(document.createTextNode(user.username + ' '));
                
                if (user.verified) {
                    const icon = document.createElement('i');
                    icon.className = 'fa-solid fa-circle-check verified-badge';
                    nameContainer.appendChild(icon);
                }
            }

            const tagEl = document.querySelector('.user-tag');
            if (tagEl) tagEl.textContent = user.tag || `@user${user.id}`;

            const bioEl = document.querySelector('.user-bio');
            if (bioEl) bioEl.textContent = user.bio || "Usuário do Sanctuaryum.";
            
            const avatarEl = document.querySelector('.profile-avatar');
            if (avatarEl && user.avatar) {
                avatarEl.src = user.avatar;
            }
        }
    } catch (e) {
        console.error("Erro ao carregar perfil:", e);
    }
}

async function switchTab(tabName, clickedBtn) {
    if (clickedBtn) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        clickedBtn.classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            const onClickAttr = btn.getAttribute('onclick');
            if(onClickAttr && onClickAttr.includes(tabName)) {
                btn.classList.add('active');
            }
        });
    }

    const container = document.getElementById('profile-content');
    
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    container.classList.remove('servers-mode');

    if (tabName === 'posts') {
        renderLoading(container);
        try {
            const posts = await API.getUserPosts(CURRENT_VIEWING_ID);
            while (container.firstChild) container.removeChild(container.firstChild);
            renderPosts(container, posts);
        } catch (e) { 
            renderError(container, "Não foi possível carregar os posts."); 
        }

    } else if (tabName === 'servers') {
        container.classList.add('servers-mode');
        renderLoading(container);
        try {
            const servers = [];
            
            while (container.firstChild) container.removeChild(container.firstChild);
            renderServers(container, servers);
        } catch (e) {
            renderError(container, "Erro ao buscar servidores.");
        }

    } else if (tabName === 'media') {
        renderPlaceholder(container, "Nenhuma mídia encontrada.");
    } else {
        renderPlaceholder(container, "Conteúdo indisponível.");
    }
}

function renderPosts(container, posts) {
    if(!posts || posts.length === 0) {
        renderPlaceholder(container, "Nenhum post publicado ainda.");
        return;
    }

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';

        const header = document.createElement('div');
        header.className = 'post-header';

        const avatar = document.createElement('img');
        avatar.className = 'post-avatar';
        const authorAvatar = (post.author && post.author.avatar) ? post.author.avatar : "https://via.placeholder.com/40";
        avatar.src = authorAvatar;

        const metaDiv = document.createElement('div');
        
        const nameDiv = document.createElement('div');
        nameDiv.style.fontWeight = 'bold';
        const authorName = (post.author && post.author.username) ? post.author.username : 'Usuário';
        nameDiv.textContent = authorName;
        
        const timeDiv = document.createElement('div');
        timeDiv.style.fontSize = '0.8rem';
        timeDiv.style.color = '#666';
        timeDiv.textContent = post.timestamp || 'Recentemente';

        metaDiv.appendChild(nameDiv);
        metaDiv.appendChild(timeDiv);
        header.appendChild(avatar);
        header.appendChild(metaDiv);

        const text = document.createElement('div');
        text.style.lineHeight = '1.5';
        text.style.color = '#e4e4e7';
        text.textContent = post.content || post.text || '';

        card.appendChild(header);
        card.appendChild(text);

        if (post.image) {
            const img = document.createElement('img');
            img.className = 'post-image';
            img.src = post.image;
            card.appendChild(img);
        }

        container.appendChild(card);
    });
}

function renderServers(container, servers) {
    if(!servers || servers.length === 0) {
        renderPlaceholder(container, "Este usuário não participa de servidores públicos.");
        return;
    }

    servers.forEach(server => {
        const card = document.createElement('div');
        card.className = 'server-card'; 

        const icon = document.createElement('div');
        icon.className = 'server-icon'; 
        if(server.icon) {
            icon.style.backgroundImage = `url('${server.icon}')`;
        } else {
            icon.style.backgroundColor = '#333';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            const i = document.createElement('i');
            i.className = 'fa-solid fa-server';
            i.style.color = '#666';
            icon.appendChild(i);
        }
        
        const info = document.createElement('div');
        info.className = 'server-info';

        const name = document.createElement('div');
        name.className = 'server-name';
        name.textContent = server.name;

        const role = document.createElement('div');
        role.className = 'server-role';
        
        const userRole = server.role || 'Membro';
        role.textContent = userRole;
        
        if (userRole === 'Admin' || userRole === 'Dono') {
            role.classList.add('is-admin');
        }

        info.appendChild(name);
        info.appendChild(role);
        card.appendChild(icon);
        card.appendChild(info);

        container.appendChild(card);
    });
}

function renderLoading(container) {
    const div = document.createElement('div');
    div.style.padding = '40px';
    div.style.textAlign = 'center';
    div.style.color = '#888';
    
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-circle-notch fa-spin';
    icon.style.fontSize = '2rem';
    icon.style.marginBottom = '15px';
    
    const text = document.createElement('div');
    text.textContent = 'Carregando dados...';

    div.appendChild(icon);
    div.appendChild(text);
    container.appendChild(div);
}

function renderPlaceholder(container, text) {
    const div = document.createElement('div');
    div.style.padding = '40px';
    div.style.textAlign = 'center';
    div.style.color = '#666';
    
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-ghost';
    icon.style.fontSize = '2rem';
    icon.style.marginBottom = '15px';
    icon.style.opacity = '0.3';

    const msg = document.createElement('div');
    msg.textContent = text;

    div.appendChild(icon);
    div.appendChild(msg);
    container.appendChild(div);
}

function renderError(container, msg) {
    const div = document.createElement('div');
    div.style.padding = '30px';
    div.style.textAlign = 'center';
    div.style.color = '#ef4444';
    div.textContent = msg;
    container.appendChild(div);
}