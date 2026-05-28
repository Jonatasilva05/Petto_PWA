export class VetModel {
    constructor() {
        this.apiUrl = '/api';
    }

    // Busca os números gerais do dashboard do veterinário
    async getDashboardMetrics() {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/vet/dashboard-metrics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao carregar métricas do dashboard');
        return await response.json();
    }

    // Busca as consultas agendadas para o dia atual
    async getConsultasHoje() {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/agendamentos/hoje`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao carregar consultas de hoje');
        return await response.json();
    }

    async fetchPacientes() {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/vet/pacientes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar pacientes');
        return await response.json();
    }

    // Envia os dados do novo prontuário para a API
    async salvarProntuario(payload) {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/vet/prontuario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao salvar prontuário');
        return data;
    }

    // Envia os dados do novo agendamento
    async salvarAgendamento(payload) {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/vet/agendamento`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao salvar agendamento');
        return data;
    }

    // Busca os dados do Perfil (Nome e Foto)
    async getPerfilVet() {
        const token = localStorage.getItem('auth-token-petto');
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o Token para pegar o ID do Usuário
        
        const response = await fetch(`${this.apiUrl}/auth/perfil/${payload.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Erro ao carregar perfil');
        return await response.json();
    }
}