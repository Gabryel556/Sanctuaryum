const urlParams = new URLSearchParams(window.location.search);
const CURRENT_SERVER_ID = urlParams.get('id') || 101; 

let currentChannelId = null;
let isPlaying = false; 

document.addEventListener('DOMContentLoaded', async () => {
    loadCurrentUser();
    await loadServerContext();
    setupChatInput();
    setupPlayerControls(); 
});

function loadCurrentUser() {
    try {
        const userStr = localStorage.getItem('sanc_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            
            const avatarEl = document.querySelector('.user-mini-avatar');
            if (avatarEl) {
                avatarEl.style.backgroundImage = `url('${user.avatar || 'https://via.placeholder.com/40'}')`;
            }

            const nameEl = document.querySelector('.mini-name');
            if (nameEl) nameEl.textContent = user.username || 'Visitante';

            const tagEl = document.querySelector('.mini-tag');
            if (tagEl) {
                tagEl.textContent = user.tag || `#${user.id.toString().padStart(4, '0')}`;
            }
        }
    } catch (e) {
        console.error("Erro ao carregar usuário:", e);
    }
}

async function loadServerContext() {
    try {
        const [server, members, channels] = await Promise.all([
            API.getServerDetails(CURRENT_SERVER_ID),
            API.getServerMembers(CURRENT_SERVER_ID),
            API.getChannels(CURRENT_SERVER_ID)
        ]);

        document.getElementById('server-name').textContent = server.name;
        renderMembers(members);
        renderChannels(channels);

        if (channels.length > 0) switchChannel(channels[0]);
        
    } catch (error) {
        console.error("Erro ao carregar chat:", error);
    }
}

function renderChannels(channels) {
    const container = document.getElementById('channels-container');
    container.textContent = ''; 

    const label = document.createElement('div');
    label.className = 'channel-category';
    label.textContent = 'CANAIS';
    container.appendChild(label);

    channels.forEach(channel => {
        const btn = document.createElement('div');
        btn.className = 'channel-btn';
        btn.dataset.id = channel.id;
        
        const icon = document.createElement('i');
        if (channel.type === 'voice') {
            icon.className = 'fa-solid fa-microphone-lines channel-icon';
        } else {
            icon.className = 'fa-solid fa-cube channel-icon'; 
        }
        
        btn.appendChild(icon);
        btn.appendChild(document.createTextNode(channel.name));
        
        btn.onclick = () => switchChannel(channel);
        
        container.appendChild(btn);
    });
}

function switchChannel(channel) {
    if (currentChannelId === channel.id) return;
    currentChannelId = channel.id;

    document.querySelectorAll('.channel-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.id == channel.id);
    });

    document.getElementById('current-channel-name').textContent = channel.name;
    loadMessages(channel.id);
}

async function loadMessages(channelId) {
    const list = document.getElementById('messages-list');
    list.textContent = ''; 
    
    const loading = document.createElement('div');
    loading.style.padding = '20px';
    loading.style.color = '#666';
    loading.textContent = 'Carregando mensagens...';
    list.appendChild(loading);

    try {
        const messages = await API.getChannelMessages(channelId);
        renderMessages(messages);
    } catch (error) {
        list.textContent = 'Erro ao carregar mensagens.';
    }
}

function renderMessages(messages) {
    const list = document.getElementById('messages-list');
    list.textContent = ''; 
    
    messages.forEach(msg => {
        list.appendChild(createMessageElement(msg));
    });
    
    list.scrollTop = list.scrollHeight;
}

function createMessageElement(msg) {
    const div = document.createElement('div');
    div.className = 'message';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.style.backgroundImage = `url('${msg.user_avatar || 'https://via.placeholder.com/40'}')`;

    const content = document.createElement('div');
    content.className = 'msg-content';

    const header = document.createElement('h4');
    header.textContent = msg.username;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'msg-time';
    timeSpan.textContent = msg.timestamp || 'Hoje 10:42';
    
    header.appendChild(timeSpan);

    const text = document.createElement('div');
    text.className = 'msg-text';
    text.textContent = msg.text;

    content.appendChild(header);
    content.appendChild(text);

    div.appendChild(avatar);
    div.appendChild(content);

    return div;
}

function setupChatInput() {
    const input = document.getElementById('message-input');
    
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            const text = input.value;
            input.value = ''; 
            
            const tempMsg = {
                id: Date.now(),
                username: "Você",
                user_avatar: "https://via.placeholder.com/40", 
                text: text,
                timestamp: "Agora"
            };

            const list = document.getElementById('messages-list');
            list.appendChild(createMessageElement(tempMsg));
            list.scrollTop = list.scrollHeight;

            try {
                await API.sendMessage(currentChannelId, text);
            } catch (err) {
                alert("Falha ao enviar.");
            }
        }
    });
}

function renderMembers(members) {
    const container = document.getElementById('members-container');
    container.textContent = '';
    
    const title = document.createElement('div');
    title.className = 'role-title';
    title.textContent = `ONLINE — ${members.length}`;
    container.appendChild(title);

    members.forEach(m => {
        const item = document.createElement('div');
        item.className = 'member-item';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'member-avatar';
        avatarDiv.style.backgroundImage = `url('${m.avatar}')`;
        
        const statusDot = document.createElement('div');
        statusDot.className = `status-dot status-${m.status || 'offline'}`;
        avatarDiv.appendChild(statusDot);

        const nameDiv = document.createElement('div');
        nameDiv.style.fontWeight = '500';
        nameDiv.style.color = m.color || '#ccc';
        nameDiv.textContent = m.username;

        item.appendChild(avatarDiv);
        item.appendChild(nameDiv);
        container.appendChild(item);
    });
}

function setupPlayerControls() {
    const playerContainer = document.getElementById('docked-player');
    const toggleBtn = document.getElementById('player-toggle');
    const playBtn = document.getElementById('btn-play');
    const playIcon = playBtn ? playBtn.querySelector('i') : null;
    const volSlider = document.getElementById('vol-slider');

    const currentTrack = JSON.parse(localStorage.getItem('current_track') || 'null');

    if (currentTrack) {
        playerContainer.classList.remove('hidden');
        document.getElementById('dock-title').textContent = currentTrack.title;
        document.getElementById('dock-artist').textContent = currentTrack.artist;
        document.getElementById('dock-art').style.backgroundImage = `url('${currentTrack.cover}')`;
        document.getElementById('dock-art').textContent = ''; 
    } else {
        playerContainer.classList.remove('hidden'); 
    }

    if (toggleBtn && playerContainer) {
        toggleBtn.addEventListener('click', () => {
            playerContainer.classList.toggle('collapsed');
        });
    }

    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isPlaying = !isPlaying;
            
            if (playIcon) {
                playIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
            }
        });
    }

    if (volSlider) {
        volSlider.addEventListener('input', (e) => {
            const vol = e.target.value;
        });
    }
}