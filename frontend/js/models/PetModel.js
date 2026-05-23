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

        return data.map(p => ({
            ...p,
            is_details_complete: p.is_details_complete === 1,
            has_vaccines: p.has_vaccines > 0,
            has_meds: p.has_meds > 0
        }));
    }

    async getPetById(petId) {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/pets/${petId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao carregar perfil do pet.');
        return data;
    }
    
    async cadastrarPetCompleto(payload) {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/pets/cadastro-completo`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao salvar os dados do pet.');
        return data;
    }

    async getHistoricoPet(petId) {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/pets/${petId}/historico`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao carregar o histórico do pet.');
        
        return data;
    }

    async deletePet(petId) {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/pets/${petId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            let errorMessage = 'Erro ao excluir o pet.';
            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (e) {}
            throw new Error(errorMessage);
        }

        try { return await response.json(); } catch (e) { return true; }
    }
}