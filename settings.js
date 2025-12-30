document.addEventListener('DOMContentLoaded', async () => {
    await loadUserSettings();
    setupNavigation();
    setupAccountActions();
    setupProfileEditActions();
});

async function loadUserSettings() {
    try {
        const userStr = localStorage.getItem('sanc_user');
        const user = userStr ? JSON.parse(userStr) : { 
            email: 'neo@sanctuaryum.com', 
            vibe: 'social' 
        };

        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) emailInput.value = user.email;

        if (user.vibe) {
            const vibeRadios = document.querySelectorAll('input[name="vibe"]');
            vibeRadios.forEach(radio => {
                if (radio.parentElement.textContent.toLowerCase().includes(user.vibe)) {
                    radio.checked = true;
                    updateRadioVisuals();
                }
            });
        }

    } catch (e) {
        console.error("Erro ao carregar configurações:", e);
    }
}

function setupNavigation() {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn:not(.logout-btn)');
    
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sidebarBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetId = btn.id.replace('btn-', 'section-');
            switchSection(targetId);
        });
    });
}

function switchSection(sectionId) {
    const sections = document.querySelectorAll('.settings-section');
    
    sections.forEach(sec => {
        if (sec.id === sectionId) {
            sec.classList.remove('hidden');
            sec.style.opacity = '0';
            setTimeout(() => sec.style.opacity = '1', 50);
        } else {
            sec.classList.add('hidden');
        }
    });
}

function setupAccountActions() {
    const emailGroup = document.querySelector('.input-group');
    if (emailGroup) {
        const emailBtn = emailGroup.querySelector('button');
        const emailInput = emailGroup.querySelector('input');
        
        if (emailBtn && emailInput) {
            emailBtn.addEventListener('click', () => {
                if (emailInput.disabled) {
                    emailInput.disabled = false;
                    emailInput.focus();
                    emailBtn.textContent = 'Salvar';
                    emailBtn.classList.add('btn-primary');
                    emailBtn.classList.remove('btn-secondary');
                } else {
                    emailInput.disabled = true;
                    emailBtn.textContent = 'Mudar';
                    emailBtn.classList.add('btn-secondary');
                    emailBtn.classList.remove('btn-primary');
                    alert(`Email atualizado para: ${emailInput.value}`);
                }
            });
        }
    }

    const pwdBtn = document.querySelectorAll('.setting-card button')[1];
    if (pwdBtn && pwdBtn.textContent.includes('Senha')) {
        pwdBtn.addEventListener('click', () => {
            const newPwd = prompt("Digite sua nova senha:");
            if (newPwd) {
                alert("Senha alterada com sucesso!");
            }
        });
    }

    const twoFaBtn = document.querySelector('.badge-gamer');
    if (twoFaBtn) {
        twoFaBtn.addEventListener('click', () => {
            const isActive = twoFaBtn.textContent.includes('Desativar');
            if (isActive) {
                twoFaBtn.textContent = 'Ativar 2FA';
                twoFaBtn.style.background = 'var(--neon-purple)';
                alert("Autenticação de dois fatores desativada.");
            } else {
                twoFaBtn.textContent = 'Desativar 2FA';
                twoFaBtn.style.background = '#ef4444';
                alert("Segurança máxima ativada! Verifique seu email.");
            }
        });
    }

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm("Tem certeza que deseja sair do Sanctuaryum?")) {
                localStorage.removeItem('sanc_user');
                alert("Desconectado.");
                window.location.href = 'index.html';
            }
        });
    }
}

function setupProfileEditActions() {
    const radioOptions = document.querySelectorAll('.radio-option');
    
    radioOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            
            const input = option.querySelector('input[type="radio"]');
            if (input) {
                input.checked = true;
                updateRadioVisuals();
                
                const vibeName = option.querySelector('span').textContent;
                console.log(`Vibe alterada para: ${vibeName}`);
            }
        });
    });
}

function updateRadioVisuals() {
    const radioOptions = document.querySelectorAll('.radio-option');
    
    radioOptions.forEach(opt => {
        const input = opt.querySelector('input');
        if (input && input.checked) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
}