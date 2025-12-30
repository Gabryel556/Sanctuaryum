function openModal() {
    const modal = document.getElementById('creation-modal');
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('creation-modal');
    modal.classList.add('hidden');
}

document.getElementById('creation-modal').addEventListener('click', (e) => {
    if (e.target.id === 'creation-modal') {
        closeModal();
    }
});

function switchModalTab(tabName) {
    const tabs = document.querySelectorAll('.m-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    const activeBtn = Array.from(tabs).find(t => t.textContent.toLowerCase().includes(tabName === 'post' ? 'post' : 'server'));
    if(activeBtn) activeBtn.classList.add('active');

    const tabPost = document.getElementById('tab-post');
    const tabServer = document.getElementById('tab-server');

    if (tabName === 'post') {
        tabPost.classList.remove('hidden');
        tabServer.classList.add('hidden');
    } else {
        tabPost.classList.add('hidden');
        tabServer.classList.remove('hidden');
    }
}

document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});