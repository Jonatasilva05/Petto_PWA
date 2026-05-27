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
}