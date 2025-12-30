const API_BASE_URL = "http://localhost:5000/api";

const API = {
    async getProfile(userId = 1) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) throw new Error('Erro ao carregar perfil');
        return await response.json();
    },

    async getSocialFeed() {
        const response = await fetch(`${API_BASE_URL}/posts/feed`);
        if (!response.ok) throw new Error('Erro ao carregar feed');
        return await response.json();
    },

    async getUserPosts(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`);
        if (!response.ok) throw new Error('Erro ao carregar posts do usuário');
        return await response.json();
    },

    async createPost(postData) {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });
        return await response.json();
    },

    async getFeaturedServers() {
        const response = await fetch(`${API_BASE_URL}/servers/featured`);
        if (!response.ok) throw new Error('Erro ao carregar servidores');
        return await response.json();
    },

    async getAllServers() {
        const response = await fetch(`${API_BASE_URL}/servers`);
        return await response.json();
    },
    
    async createServer(serverData) {
        const response = await fetch(`${API_BASE_URL}/servers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serverData)
        });
        return await response.json();
    },

    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error('Credenciais inválidas');
        return await response.json();
    },

    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    },

    async getServerDetails(serverId) {
        const response = await fetch(`${API_BASE_URL}/servers/${serverId}`);
        return await response.json();
    },

    async getChannels(serverId) {
        const response = await fetch(`${API_BASE_URL}/servers/${serverId}/channels`);
        return await response.json();
    },

    async getChannelMessages(channelId) {
        const response = await fetch(`${API_BASE_URL}/channels/${channelId}/messages`);
        return await response.json();
    },

    async sendMessage(channelId, text) {
        const response = await fetch(`${API_BASE_URL}/channels/${channelId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return await response.json();
    },

    async getServerMembers(serverId) {
        const response = await fetch(`${API_BASE_URL}/servers/${serverId}/members`);
        return await response.json();
    },

    async getArtistProfile(userId) {
        const response = await fetch(`${API_BASE_URL}/music/artist/${userId}`);
        if (response.status === 404) return null; 
        return await response.json();
    },

    async createArtistProfile(artistData) {
        const response = await fetch(`${API_BASE_URL}/music/artist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(artistData)
        });
        if (!response.ok) throw new Error('Erro ao criar perfil de artista.');
        return await response.json();
    }
};