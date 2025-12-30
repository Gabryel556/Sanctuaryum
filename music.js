let isPlaying = false;
let currentTrackIndex = 0;
let playerVolume = 50;
let musicQueue = [];
let currentUserArtist = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initMusicApp();
    setupGlobalPlayer();
});

async function initMusicApp() {
    const content = document.getElementById('music-content');
    
    try {
        const userStr = localStorage.getItem('sanc_user');
        const user = userStr ? JSON.parse(userStr) : {};
        
        if (user.id) {
            currentUserArtist = await API.getArtistProfile(user.id);
        }

        renderSidebarButton();
        
        const homeBtn = document.querySelector('.lib-btn'); 
        if (homeBtn) {
            loadView('home', homeBtn); 
        } else {
            loadView('home');
        }

    } catch (error) {
        console.error("Erro music:", error);
        content.textContent = '';
        const errorMsg = document.createElement('div');
        errorMsg.style.padding = '20px';
        errorMsg.style.color = '#ef4444';
        errorMsg.textContent = 'Erro ao carregar sistema de música.';
        content.appendChild(errorMsg);
    }
}

function switchLibraryTab(viewName, btnElement) {
    loadView(viewName, btnElement);
}

function loadView(viewName, btnElement) {
    const container = document.getElementById('music-content');
    
    if (btnElement) {
        document.querySelectorAll('.lib-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    if (viewName === 'home') {
        renderHome(container);
    } else if (viewName === 'liked' || viewName === 'collection') {
        renderCollection(container);
    } else if (viewName === 'dashboard') {
        renderArtistDashboard(container);
    } else {
        renderPlaceholder(container, viewName);
    }
}

function renderSidebarButton() {
    const container = document.getElementById('artist-btn-container');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const btn = document.createElement('button');
    const icon = document.createElement('i');
    
    if (currentUserArtist) {
        btn.className = 'lib-btn artist-btn';
        icon.className = 'fa-solid fa-chart-simple';
        
        btn.appendChild(icon);
        btn.appendChild(document.createTextNode(' Painel do Artista'));
        btn.onclick = () => loadView('dashboard');
    } else {
        btn.className = 'lib-btn create-artist-btn';
        icon.className = 'fa-solid fa-star';
        
        btn.appendChild(icon);
        btn.appendChild(document.createTextNode(' Seja um Artista'));
        btn.onclick = openArtistModal;
    }
    
    container.appendChild(btn);
}

async function renderHome(container) {
    const hero = document.createElement('div');
    hero.className = 'music-hero';
    
    const overlay = document.createElement('div');
    overlay.className = 'hero-overlay';
    
    const content = document.createElement('div');
    content.className = 'hero-content';
    
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = 'DESTAQUE DA COMUNIDADE';

    const h1 = document.createElement('h1');
    h1.textContent = 'Sanctuary Waves';
    
    const p = document.createElement('p');
    p.textContent = 'Descubra novas frequências.';
    
    const actions = document.createElement('div');
    actions.className = 'hero-actions';

    const btnPlay = document.createElement('button');
    btnPlay.className = 'play-hero';
    const iconPlay = document.createElement('i');
    iconPlay.className = 'fa-solid fa-play';
    btnPlay.appendChild(iconPlay);
    btnPlay.appendChild(document.createTextNode(' Ouvir Rádio'));
    btnPlay.onclick = startRadioPlayback;

    actions.appendChild(btnPlay);
    content.appendChild(tag);
    content.appendChild(h1);
    content.appendChild(p);
    content.appendChild(actions);
    
    hero.appendChild(content);
    hero.appendChild(overlay);
    container.appendChild(hero);

    const section = document.createElement('section');
    section.className = 'music-section';
    
    const h2 = document.createElement('h2');
    h2.textContent = 'Tendências';
    section.appendChild(h2);

    const list = document.createElement('div');
    list.className = 'track-list';

    const loading = document.createElement('div');
    loading.style.padding = '20px';
    loading.style.color = '#666';
    loading.textContent = 'Carregando músicas...';
    list.appendChild(loading);
    section.appendChild(list);
    container.appendChild(section);

    try {
        const tracks = [];

        list.removeChild(loading);

        if (tracks.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style.padding = '20px';
            emptyMsg.style.color = '#888';
            emptyMsg.textContent = 'Nenhuma faixa encontrada no momento.';
            list.appendChild(emptyMsg);
        } else {
            musicQueue = tracks;
            tracks.forEach((track, index) => {
                const row = createTrackRow(track, index);
                list.appendChild(row);
            });
        }

    } catch (err) {
        list.textContent = 'Erro ao buscar faixas.';
    }
}

function createTrackRow(track, index) {
    const row = document.createElement('div');
    row.className = 'track-row';
    row.onclick = () => {
        currentTrackIndex = index;
        isPlaying = true;
        updatePlayerUI();
    };

    const numDiv = document.createElement('div');
    numDiv.className = 'track-num';
    numDiv.textContent = index + 1;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'track-info';

    const imgDiv = document.createElement('div');
    imgDiv.className = 'track-img';
    if (track.cover) imgDiv.style.backgroundImage = `url('${track.cover}')`;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'track-details';
    
    const titleDiv = document.createElement('div');
    titleDiv.textContent = track.title || 'Sem Título';
    
    const artistSpan = document.createElement('span');
    artistSpan.style.color = '#888';
    artistSpan.style.fontSize = '0.8rem';
    artistSpan.textContent = track.artist || 'Desconhecido';

    detailsDiv.appendChild(titleDiv);
    detailsDiv.appendChild(artistSpan);
    
    infoDiv.appendChild(imgDiv);
    infoDiv.appendChild(detailsDiv);

    const albumDiv = document.createElement('div');
    albumDiv.className = 'track-album';
    albumDiv.textContent = track.album || '-';

    const timeDiv = document.createElement('div');
    timeDiv.className = 'track-time';
    timeDiv.textContent = track.duration || '--:--';

    row.appendChild(numDiv);
    row.appendChild(infoDiv);
    row.appendChild(albumDiv);
    row.appendChild(timeDiv);

    return row;
}

function renderCollection(container) {
    const h1 = document.createElement('h1');
    h1.textContent = 'Sua Coleção';
    h1.style.padding = '20px';
    
    const p = document.createElement('p');
    p.textContent = 'Conecte-se a artistas para ver suas coleções aqui.';
    p.style.padding = '0 20px';
    p.style.color = '#888';

    container.appendChild(h1);
    container.appendChild(p);
}

function renderPlaceholder(container, text) {
    const div = document.createElement('div');
    div.style.padding = '40px';
    div.style.textAlign = 'center';
    div.style.color = '#666';
    div.textContent = text;
    container.appendChild(div);
}

function renderArtistDashboard(container) {
    if (!currentUserArtist) return;

    const header = document.createElement('div');
    header.style.padding = '20px 0';

    const h1 = document.createElement('h1');
    h1.textContent = `Olá, ${currentUserArtist.name}`;

    const badge = document.createElement('div');
    const isVerified = currentUserArtist.verified;
    badge.className = `artist-status-badge ${isVerified ? 'verified' : 'pending'}`;
    
    const icon = document.createElement('i');
    icon.className = `fa-solid ${isVerified ? 'fa-check-circle' : 'fa-lock'}`;
    
    badge.appendChild(icon);
    badge.appendChild(document.createTextNode(isVerified ? ' Verificado' : ' Verificação Pendente'));

    header.appendChild(h1);
    header.appendChild(badge);
    container.appendChild(header);

    const statsGrid = document.createElement('div');
    statsGrid.className = 'horizontal-grid';

    const createStatCard = (val, label, color) => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.style.textAlign = 'center';
        
        const valDiv = document.createElement('div');
        valDiv.style.fontSize = '2rem';
        valDiv.style.fontWeight = 'bold';
        valDiv.style.color = color || 'white';
        valDiv.textContent = val;
        
        const labelDiv = document.createElement('div');
        labelDiv.style.fontSize = '0.8rem';
        labelDiv.style.color = '#888';
        labelDiv.textContent = label;
        
        card.appendChild(valDiv);
        card.appendChild(labelDiv);
        return card;
    };

    statsGrid.appendChild(createStatCard('0', 'Ouvintes', 'var(--neon-purple)'));
    statsGrid.appendChild(createStatCard('0', 'Faixas', 'white'));

    const uploadCard = document.createElement('div');
    uploadCard.className = 'album-card';
    uploadCard.style.display = 'flex';
    uploadCard.style.alignItems = 'center';
    uploadCard.style.justifyContent = 'center';
    uploadCard.style.cursor = 'pointer';
    uploadCard.style.border = '1px dashed #666';
    uploadCard.onclick = () => alert('Funcionalidade de Upload em breve!');

    const upIcon = document.createElement('i');
    upIcon.className = 'fa-solid fa-upload';
    upIcon.style.fontSize = '1.5rem';
    
    const upText = document.createElement('span');
    upText.style.marginLeft = '10px';
    upText.textContent = 'Upload Faixa';

    uploadCard.appendChild(upIcon);
    uploadCard.appendChild(upText);
    statsGrid.appendChild(uploadCard);

    container.appendChild(statsGrid);
}

function setupGlobalPlayer() {
    const playBtn = document.querySelector('.play-circle');
    const prevBtn = document.querySelector('.fa-backward-step');
    const nextBtn = document.querySelector('.fa-forward-step');
    const volumeFill = document.querySelector('.vol-fill');
    
    if(playBtn) playBtn.addEventListener('click', togglePlay);
    
    if(prevBtn && prevBtn.parentElement) {
        prevBtn.parentElement.addEventListener('click', () => changeTrack(-1));
    }
    
    if(nextBtn && nextBtn.parentElement) {
        nextBtn.parentElement.addEventListener('click', () => changeTrack(1));
    }

    const volBar = document.querySelector('.vol-bar');
    if(volBar) {
        volBar.addEventListener('click', (e) => {
            const rect = volBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const pct = Math.min(100, Math.max(0, (x / width) * 100));
            
            if(volumeFill) volumeFill.style.width = `${pct}%`;
            playerVolume = pct;
        });
    }
}

function togglePlay() {
    if (musicQueue.length === 0) return;
    isPlaying = !isPlaying;
    updatePlayerUI();
}

function changeTrack(direction) {
    if (musicQueue.length === 0) return;

    currentTrackIndex += direction;
    
    if (currentTrackIndex >= musicQueue.length) currentTrackIndex = 0;
    if (currentTrackIndex < 0) currentTrackIndex = musicQueue.length - 1;
    
    isPlaying = true;
    updatePlayerUI();
}

function startRadioPlayback() {
    if (musicQueue.length > 0) {
        currentTrackIndex = 0;
        isPlaying = true;
        updatePlayerUI();
    } else {
        alert("Nenhuma música disponível na rádio.");
    }
}

function updatePlayerUI() {
    if (musicQueue.length === 0) return;

    const track = musicQueue[currentTrackIndex];
    
    const icon = document.querySelector('.play-circle i');
    if(icon) {
        icon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }

    const titleEl = document.querySelector('.mini-title');
    const artistEl = document.querySelector('.mini-artist');
    const coverEl = document.querySelector('.mini-cover');

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (coverEl && track.cover) coverEl.src = track.cover;

    const playerBar = document.querySelector('.music-player-bar');
    if(playerBar) playerBar.classList.remove('hidden');
}

function openArtistModal() {
    const modal = document.getElementById('artist-modal');
    if(modal) modal.classList.remove('hidden');
}

function closeArtistModal() {
    const modal = document.getElementById('artist-modal');
    if(modal) modal.classList.add('hidden');
}

async function handleArtistSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    
    btn.textContent = '';
    const spinner = document.createElement('i');
    spinner.className = 'fa-solid fa-circle-notch fa-spin';
    btn.appendChild(spinner);
    btn.appendChild(document.createTextNode(' Processando...'));
    btn.disabled = true;

    const nameInput = document.getElementById('artist-name');
    const genreInput = document.getElementById('artist-genre');
    const bioInput = document.getElementById('artist-bio');

    const data = {
        name: nameInput ? nameInput.value : '',
        genre: genreInput ? genreInput.value : '',
        bio: bioInput ? bioInput.value : ''
    };

    try {
        const newArtist = await API.createArtistProfile(data);
        currentUserArtist = newArtist;
        
        alert("Perfil de Artista criado! Aguarde a verificação de identidade.");
        closeArtistModal();
        renderSidebarButton();
        loadView('dashboard');

    } catch (error) {
        alert("Erro ao criar perfil: " + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}