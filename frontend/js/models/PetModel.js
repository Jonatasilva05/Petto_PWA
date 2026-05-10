export class PetModel {
    constructor() {
        this.apiUrl = '/api'; 
    }

    async getPets() {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/pets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao carregar pets');

        // Formatação igual ao seu código original
        return data.map(p => ({
            ...p,
            is_details_complete: p.is_details_complete === 1,
            has_vaccines: p.has_vaccines > 0,
            has_meds: p.has_meds > 0
        }));
    }
}