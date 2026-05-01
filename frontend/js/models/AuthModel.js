export class AuthModel {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api'; 
    }
    
    async login(email, senha) {
        const response = await fetch(`${this.apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao fazer login.');
        
        localStorage.setItem('auth-token-petto', data.token);
        localStorage.setItem('user-role', data.role);
        // O JWT carrega informações básicas que podemos extrair para a UI
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem('user-name', payload.nome);
        
        return data;
    }

    async cadastrar(payload) {
        const response = await fetch(`${this.apiUrl}/auth/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao realizar cadastro.');
        return data;
    }

    async buscarCep(cep) {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) throw new Error('CEP não encontrado');
        return data;
    }

    async checkEmail(email) {
        const response = await fetch(`${this.apiUrl}/auth/check-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }
        return true;
    }

    logout() {
        localStorage.removeItem('auth-token-petto');
        localStorage.removeItem('user-role');
        localStorage.removeItem('user-name');
    }

    isLoggedIn() {
        return !!localStorage.getItem('auth-token-petto');
    }
}