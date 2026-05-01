export class PetView {
    constructor() {
        this.petListContainer = document.getElementById('pet-list-container');
        this.tutorEmptyState = document.getElementById('tutor-empty-state');
    }

    renderPets(pets, onViewCarteira) {
        if (!this.petListContainer) return;
        this.petListContainer.innerHTML = '';

        if (pets.length === 0) {
            this.tutorEmptyState?.classList.remove('hidden');
            return;
        }
        this.tutorEmptyState?.classList.add('hidden');

        pets.forEach(pet => {
            const wrapper = document.createElement('div');
            
            // Define a idade para exibir
            let idadeTexto = '';
            if (pet.idade_valor) {
                idadeTexto = `${pet.idade_valor} ${pet.idade_unidade}`;
            } else {
                idadeTexto = 'Idade não informada';
            }

            // Card Principal
            const mainCard = document.createElement('div');
            mainCard.className = 'pet-card-main';
            mainCard.innerHTML = `
                <img src="${pet.foto_url ? 'http://localhost:3000' + pet.foto_url : './assets/image/cachorro.png'}" class="pet-avatar">
                <div class="pet-info">
                    <h3>${pet.nome}</h3>
                    <p>${pet.raca || 'Sem raça'} • ${idadeTexto}</p>
                </div>
            `;

            // Botões que abrem no estilo Sanfona
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'pet-card-actions';
            actionsDiv.innerHTML = `
                <button class="action-btn" id="btn-cart-${pet.id_pet}"><span class="icon">🪪</span>Carteira</button>
                <button class="action-btn"><span class="icon">💉</span>Vacinas</button>
                <button class="action-btn"><span class="icon">🩺</span>Consultas</button>
            `;

            // Lógica de abrir a sanfona
            mainCard.addEventListener('click', () => {
                const isShowing = actionsDiv.classList.contains('show');
                // Fecha todas as outras primeiro (opcional, para ficar mais limpo)
                document.querySelectorAll('.pet-card-actions').forEach(el => el.classList.remove('show'));
                if (!isShowing) actionsDiv.classList.add('show');
            });

            // Lógica de ir para a carteira
            wrapper.appendChild(mainCard);
            wrapper.appendChild(actionsDiv);
            this.petListContainer.appendChild(wrapper);

            // Binds dos botões de ação
            document.getElementById(`btn-cart-${pet.id_pet}`).addEventListener('click', () => {
                onViewCarteira(pet.id_pet); // Redireciona para o detalhe
            });
        });
    }

    showSkeleton() {
        if(this.petListContainer) {
            this.petListContainer.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';
        }
    }
}