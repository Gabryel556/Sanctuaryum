document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    const token = localStorage.getItem('sanc_token');
    
    const authButtons = document.getElementById('auth-buttons');
    const loggedButtons = document.getElementById('logged-buttons');

    if (token) {
        authButtons.classList.add('hidden');
        loggedButtons.classList.remove('hidden');
    } else {
        loggedButtons.classList.add('hidden');
        authButtons.classList.remove('hidden');
    }
}

function logoutFromLanding() {
    localStorage.removeItem('sanc_token');
    localStorage.removeItem('sanc_user');
    window.location.reload();
}