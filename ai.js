function createEl(tag, className, text = null) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
}

document.addEventListener('DOMContentLoaded', () => {
    setupAI();
    makeDraggable(document.getElementById('ai-fab'));
});

function setupAI() {
    const fab = document.getElementById('ai-fab');
    const windowEl = document.getElementById('ai-window');
    const closeBtn = document.getElementById('ai-close');
    const sendBtn = document.getElementById('ai-send');
    const input = document.getElementById('ai-input');

    let isDragging = false;

    fab.addEventListener('mousedown', () => { isDragging = false; });
    fab.addEventListener('mousemove', () => { isDragging = true; });

    const toggleChat = () => {
        if (isDragging) return; 

        windowEl.classList.toggle('open');
        
        if (windowEl.classList.contains('open')) {
            fab.classList.remove('idle');
            updateWindowPosition();
            input.focus();
        }
    };

    fab.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', () => windowEl.classList.remove('open'));

    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';
        showTyping(true);
        
        setTimeout(() => {
            const response = mockAIResponse(text);
            showTyping(false);
            addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
}

function updateWindowPosition() {
    const fab = document.getElementById('ai-fab');
    const windowEl = document.getElementById('ai-window');
    
    const fabRect = fab.getBoundingClientRect();
    const winHeight = window.innerHeight;
    
    let leftPos = fabRect.left - 320;
    if (leftPos < 20) leftPos = fabRect.right + 20;
    
    windowEl.style.left = leftPos + 'px';

    if (fabRect.top < winHeight / 2) {
        windowEl.style.top = (fabRect.bottom + 15) + 'px';
        windowEl.style.bottom = 'auto';
        windowEl.style.transformOrigin = 'top right';
    } else {
        windowEl.style.bottom = (winHeight - fabRect.top + 15) + 'px';
        windowEl.style.top = 'auto';
        windowEl.style.transformOrigin = 'bottom right';
    }
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        
        element.style.bottom = 'auto';
        element.style.right = 'auto';

        const windowEl = document.getElementById('ai-window');
        if (windowEl.classList.contains('open')) {
            updateWindowPosition();
        }
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function addMessage(text, sender) {
    const container = document.getElementById('ai-messages');
    const msg = createEl('div', `ai-msg ${sender}`, text);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function showTyping(show) {
    const indicator = document.getElementById('ai-typing');
    indicator.style.display = show ? 'flex' : 'none';
    const container = document.getElementById('ai-messages');
    container.scrollTop = container.scrollHeight;
}

function mockAIResponse(input) {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('olá') || lowerInput.includes('oi')) {
        return "Saudações, viajante! Eu sou o Nexus, seu assistente no Sanctuaryum. Como posso ajudar a proteger sua jornada hoje?";
    }
    
    if (lowerInput.includes('servidor') || lowerInput.includes('criar')) {
        return "Para criar um servidor, clique no botão '+' na barra de navegação superior e selecione a aba 'Servidor'. Quer dicas de nomes épicos?";
    }

    if (lowerInput.includes('segurança') || lowerInput.includes('senha')) {
        return "Segurança é nossa prioridade. Recomendamos ativar a autenticação de dois fatores (2FA) nas Configurações. Nunca compartilhe sua senha, nem comigo!";
    }

    if (lowerInput.includes('música') || lowerInput.includes('waves')) {
        return "O Sanctuary Waves está sintonizado! Acesse a aba 'Waves' para ouvir mixes focados em foco e relaxamento.";
    }

    return "Interessante... Ainda estou aprendendo sobre o comportamento humano. Por enquanto, posso ajudar com navegação e segurança básica do sistema.";
}