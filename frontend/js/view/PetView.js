export class PetView {
    constructor() {
        this.petListContainer = document.getElementById('pet-list-container');
        this.tutorDashboard = document.getElementById('tutor-dashboard');
        this.emptyState = this.tutorDashboard.querySelector('.empty-state');
    }

    renderPets(pets) {
        this.petListContainer.innerHTML = '';

        if (pets.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';

        pets.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'pet-card-container'; // Estilo do seu PetCard.tsx
            
            // Lógica de ícone de status
            const isComplete = pet.is_details_complete && pet.has_vaccines && pet.has_meds;
            const statusIcon = isComplete 
                ? '<span class="status-icon success">✅</span>' 
                : '<span class="status-icon warning">⚠️</span>';

            card.innerHTML = `
                <img src="${pet.foto_url ? 'http://localhost:3000' + pet.foto_url : './assets/icons/icon-192x192.png'}" class="pet-image">
                <div class="pet-info">
                    <div class="pet-name-row">
                        <span class="pet-name">${pet.nome}</span>
                        ${statusIcon}
                    </div>
                    <span class="pet-breed">${pet.raca}</span>
                </div>
                <button class="btn-options" data-id="${pet.id_pet}">⋮</button>
            `;
            
            card.addEventListener('click', () => {
                window.location.hash = `vacinacao?petId=${pet.id_pet}`;
            });

            this.petListContainer.appendChild(card);
        });
    }

    showSkeleton() {
        // Simula o PetCardSkeleton.tsx[cite: 44]
        this.petListContainer.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
    }
}