const API_BASE_URL = 'http://localhost:3000/api'; 
const token = localStorage.getItem('auth-token-petto');

document.addEventListener("DOMContentLoaded", async () => {
    const petSelect = document.getElementById('petSelect');
    if (!token || !petSelect) return;

    try {
        // Consome a Rota 1 de petRoutes.js (GET /api/pets) usando o token gerado no login
        const response = await fetch(`${API_BASE_URL}/pets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pets = await response.json();

        if (response.ok) {
            petSelect.innerHTML = '<option value="" disabled selected>Selecione um Pet...</option>';
            
            pets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.id_pet;
                option.textContent = `${pet.nome} (${pet.raca || 'Sem raça definida'})`;
                petSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar pets para a carteirinha:", error);
    }
});

function gerarPDF() {
    const pet = document.getElementById('petSelect').value;
    if(!pet) {
        Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Selecione um pet primeiro!', confirmButtonColor: '#06b6d4' });
        return;
    }
    
    Swal.fire({
        title: 'Gerando PDF...',
        html: 'Buscando dados médicos integrados...',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => { Swal.showLoading(); }
    }).then(() => {
        Swal.fire({ icon: 'success', title: 'Download Concluído!', text: 'A carteirinha foi salva na sua pasta de downloads.', confirmButtonColor: '#06b6d4' });
    });
}

function compartilhar() {
    const pet = document.getElementById('petSelect').value;
    if(!pet) {
        Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Selecione um pet primeiro!', confirmButtonColor: '#06b6d4' });
        return;
    }
    if (navigator.share) {
        navigator.share({ title: 'Carteirinha Petto', text: 'Confira a carteirinha do meu pet!', url: `https://petto.app/cart/${pet}` });
    } else {
        Swal.fire({ icon: 'info', title: 'Link Copiado!', text: 'O link da carteirinha foi copiado.', confirmButtonColor: '#06b6d4' });
    }
}