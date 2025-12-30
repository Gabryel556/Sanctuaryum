let currentMode = 'social'; 

document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialData();
    
    setMode('social'); 
    setupSearch();     
});

async function loadInitialData() {
    try {
        const [social, servers] = await Promise.all([
            API.getSocialFeed(),
            API.getFeaturedServers()
        ]);

        window.socialData = social;
        window.serverData = servers;
        
        console.log("Dados carregados da API.");
    } catch (error) {
        console.error("Aguardando Backend...", error);
        window.socialData = [];
        window.serverData = [];
    }
}

function safeElement(tag, className, text = null) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
}

function setMode(mode) {
    currentMode = mode;
    const body = document.body;
    
    const btnSocial = document.getElementById('btn-social');
    const btnComm = document.getElementById('btn-community');
    
    if (mode === 'social') {
        body.classList.remove('mode-community');
        body.classList.add('mode-social');
        btnSocial.classList.add('active');
        btnComm.classList.remove('active');
        
        updateHero("Seu mundo, ", "criado por você.", "Fotos, momentos e música em harmonia.", "Em Alta", "Feed");
        
        renderTags(["Fotografia", "Música", "Arte", "Tech", "Lifestyle"]);
        renderGrid(window.socialData || [], 'social');

    } else {
        body.classList.remove('mode-social');
        body.classList.add('mode-community');
        btnComm.classList.add('active');
        btnSocial.classList.remove('active');
        
        updateHero("Encontre sua ", "Galera.", "Servidores, chats de voz e comunidades.", "Ascendidos (Top Boost)", "Explorar Servidores");
        
        renderTags(["Jogos", "Dev", "RPG", "Anime", "Hardware"]);
        renderGrid(window.serverData || [], 'gamer');
    }
}

function updateHero(prefixText, gradientText, subtitle, featTitle, feedTitle) {
    const h1 = document.getElementById('hero-title');
    h1.textContent = ''; 
    
    const textNode = document.createTextNode(prefixText);
    const span = safeElement('span', 'gradient-text', gradientText);
    
    h1.appendChild(textNode);
    h1.appendChild(span);

    document.getElementById('hero-subtitle').textContent = subtitle;
    document.getElementById('featured-title').textContent = featTitle;
    document.getElementById('feed-title').textContent = feedTitle;
}

function renderTags(tags) {
    const container = document.getElementById('filter-container');
    container.textContent = ''; 
    
    const btnAll = safeElement('button', 'filter-tag active', 'Todos');
    btnAll.onclick = () => resetFilter(btnAll);
    container.appendChild(btnAll);
    
    tags.forEach(t => {
        const btn = safeElement('button', 'filter-tag', t);
        btn.onclick = () => filterData(t, btn);
        container.appendChild(btn);
    });
}

function filterData(tag, btnElement) {
    document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    const sourceData = currentMode === 'social' ? (window.socialData || []) : (window.serverData || []);
    const type = currentMode === 'social' ? 'social' : 'gamer';

    const filtered = sourceData.filter(item => item.tags && item.tags.includes(tag));
    renderGrid(filtered, type);
}

function resetFilter(btnElement) {
    document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    const sourceData = currentMode === 'social' ? (window.socialData || []) : (window.serverData || []);
    const type = currentMode === 'social' ? 'social' : 'gamer';
    renderGrid(sourceData, type);
}

function setupSearch() {
    const input = document.getElementById('server-search');
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const sourceData = currentMode === 'social' ? (window.socialData || []) : (window.serverData || []);
        const type = currentMode === 'social' ? 'social' : 'gamer';

        const filtered = sourceData.filter(item => {
            const name = (item.title || item.name || "").toLowerCase();
            const tags = item.tags ? item.tags.join(' ').toLowerCase() : "";
            return name.includes(term) || tags.includes(term);
        });
        
        renderGrid(filtered, type);
    });
}

function renderGrid(data, type) {
    const featuredGrid = document.getElementById('grid-featured');
    const generalGrid = document.getElementById('grid-general');
    
    featuredGrid.textContent = ''; 
    generalGrid.textContent = ''; 

    if (!data || data.length === 0) {
        const emptyMsg = safeElement('div', '', 'Verifique sua conexão.');
        emptyMsg.style.color = '#666';
        emptyMsg.style.padding = '20px';
        generalGrid.appendChild(emptyMsg);
        return;
    }

    data.forEach((item, index) => {
        const cardElement = createCardElement(item, type);
        if (index < 2) featuredGrid.appendChild(cardElement);
        else generalGrid.appendChild(cardElement);
    });
}

function createCardElement(item, type) {
    const card = safeElement('div', type === 'social' ? 'card card-social' : 'card card-gamer');

    const banner = safeElement('div', 'banner');
    const imgUrl = item.img || item.banner || 'https://via.placeholder.com/300x150/222/fff?text=No+Image';
    banner.style.backgroundImage = `url('${imgUrl}')`;
    card.appendChild(banner);

    const content = safeElement('div', 'content');

    if (type === 'social') {
        content.appendChild(safeElement('div', 'title', item.title || 'Sem Título'));
        
        const meta = safeElement('div', 'meta');
        const iconHeart = safeElement('i', 'fa-regular fa-heart');
        meta.appendChild(iconHeart);
        const authorName = typeof item.author === 'object' ? item.author.username : item.author;
        meta.appendChild(document.createTextNode(` ${item.likes || 0} • ${authorName || 'Anon'}`));
        
        content.appendChild(meta);

    } else {
        const icon = safeElement('div', 'icon');
        icon.style.backgroundImage = `url('${item.icon || ''}')`;
        content.appendChild(icon);
        
        content.appendChild(safeElement('div', 'title', item.name || 'Servidor'));
        
        const meta = safeElement('div', 'meta', `${item.members || 0} membros`);
        meta.style.marginBottom = '8px';
        content.appendChild(meta);

        const tagsDiv = safeElement('div');
        if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(t => {
                const tagSpan = safeElement('span', 'card-tag', `#${t}`);
                tagsDiv.appendChild(tagSpan);
            });
        }
        content.appendChild(tagsDiv);
    }

    card.appendChild(content);
    return card;
}