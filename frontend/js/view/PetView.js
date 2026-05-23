
export class PetView {
    constructor() {
        this.petListContainer = document.getElementById('pet-list-container');
        this.tutorEmptyState = document.getElementById('tutor-empty-state');
        this.fabButton = document.getElementById('btn-go-add-pet');
    }

    renderPets(pets, onViewCarteira) {
        if (!this.petListContainer) return;
        this.petListContainer.innerHTML = '';

        if (pets.length === 0) {
            this.tutorEmptyState?.classList.remove('hidden');
            this.fabButton?.classList.add('hidden'); // Esconde o FAB se estiver vazio
            return;
        }
        
        this.tutorEmptyState?.classList.add('hidden');
        this.fabButton?.classList.remove('hidden');

        pets.forEach(pet => {
            // Criação do Card baseado no layout de home.html e index(1).tsx
            const card = document.createElement('div');
            card.className = 'pet-card';
            
            // Lógica para verificar se a foto existe
            const fotoSrc = pet.foto_url ? pet.foto_url : './assets/image/cachorro.png';

            card.innerHTML = `
                <img src="${fotoSrc}" alt="${pet.nome}" class="pet-img">
                <div class="pet-details">
                    <h3>${pet.nome}</h3>
                    <p>${pet.raca || 'Sem raça'} ${pet.idade_valor ? '• ' + pet.idade_valor + ' ' + pet.idade_unidade : ''}</p>
                </div>
                <div class="pet-status-icons">
                    <span class="status-icon ${pet.is_details_complete ? 'active' : ''}" title="Detalhes Completos">📋</span>
                    <span class="status-icon ${pet.has_vaccines ? 'active' : ''}" title="Vacinas">💉</span>
                </div>
            `;

            // Ao clicar no card, vai para a carteira (ou abre as opções)
            card.addEventListener('click', () => {
                onViewCarteira(pet.id_pet);
            });

            this.petListContainer.appendChild(card);
        });
    }

    showSkeleton() {
        if(this.petListContainer) {
            this.petListContainer.innerHTML = `
                <div class="pet-card" style="opacity: 0.5;">
                    <div style="width: 70px; height: 70px; border-radius: 35px; background: #ddd; margin-right: 15px;"></div>
                    <div style="flex: 1;">
                        <div style="height: 15px; background: #ddd; width: 60%; margin-bottom: 10px; border-radius: 5px;"></div>
                        <div style="height: 10px; background: #ddd; width: 40%; border-radius: 5px;"></div>
                    </div>
                </div>
            `;
        }
    }
}
