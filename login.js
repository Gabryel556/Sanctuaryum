function toggleMode(mode) {
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    loginBox.classList.toggle('hidden', mode === 'register');
    registerBox.classList.toggle('hidden', mode === 'login');
}

async function handleLogin(e) {
    e.preventDefault();
    
    const emailInput = e.target.querySelector('input[type="email"]');
    const passInput = e.target.querySelector('input[type="password"]');
    const btn = e.target.querySelector('button');
    const originalText = btn.textContent; 

    setLoadingState(btn, true, 'Entrando...');

    try {
        const data = await API.login(emailInput.value, passInput.value);
        console.log("Login realizado!", data);
        localStorage.setItem('sanc_token', data.token);
        localStorage.setItem('sanc_user', JSON.stringify(data.user));
        
        window.location.href = 'compass.html';

    } catch (error) {
        alert("Erro: " + error.message);
        setLoadingState(btn, false, originalText);
        passInput.value = ''; 
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const passInput = form.querySelector('input[type="password"]');
    const btn = form.querySelector('button');
    const originalText = btn.textContent;

    setLoadingState(btn, true, 'Criando conta...');

    try {
        const userData = {
            username: nameInput.value,
            email: emailInput.value,
            password: passInput.value
        };

        const data = await API.register(userData);
        
        alert("Conta criada com sucesso! Faça login.");
        toggleMode('login');
        
        setLoadingState(btn, false, originalText);

    } catch (error) {
        alert("Erro no registro: " + error.message);
        setLoadingState(btn, false, originalText);
    }
}

function setLoadingState(btn, isLoading, text) {
    btn.disabled = isLoading;
    btn.textContent = '';

    if (isLoading) {
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-circle-notch fa-spin';
        
        btn.appendChild(icon);
        btn.appendChild(document.createTextNode(' ' + text));
    } else {
        btn.textContent = text;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'register') {
        toggleMode('register');
    }
});