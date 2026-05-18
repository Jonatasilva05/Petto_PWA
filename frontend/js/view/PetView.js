export class PetView {
    constructor() {
        this.petListContainer = document.getElementById('pet-list-container');
        this.tutorEmptyState = document.getElementById('tutor-empty-state');
        this.fabButton = document.getElementById('btn-go-add-pet');
    }

    // Adicionamos onEditPet e onDeletePet como parâmetros
    renderPets(pets, onViewCarteira, onEditPet, onDeletePet) {
        if (!this.petListContainer) return;
        this.petListContainer.innerHTML = '';

        if (pets.length === 0) {
            this.tutorEmptyState?.classList.remove('hidden');
            this.fabButton?.classList.add('hidden'); 
            return; 
        }
        
        this.tutorEmptyState?.classList.add('hidden');
        this.fabButton?.classList.remove('hidden');

        // Função interna para formatar de forma limpa e direta a idade do Pet
        const calcularIdadeTexto = (pet) => {
            if (pet.data_nascimento) {
                const nascimento = new Date(pet.data_nascimento);
                const hoje = new Date();
                
                let anos = hoje.getFullYear() - nascimento.getFullYear();
                let meses = hoje.getMonth() - nascimento.getMonth();
                let dias = hoje.getDate() - nascimento.getDate();

                if (dias < 0) {
                    meses--;
                    const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
                    dias += ultimoDiaMesAnterior;
                }
                if (meses < 0) {
                    anos--;
                    meses += 12;
                }

                // Prioriza a exibição da maior unidade sem "quebrar" o texto
                if (anos > 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
                if (meses > 0) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
                if (dias >= 0) return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
            }

            // Fallback: se não houver data de nascimento, usa o valor fixo salvo do formulário aproximado
            if (pet.idade_valor !== null && pet.idade_valor !== undefined && pet.idade_valor !== '') {
                const unidade = pet.idade_unidade || 'anos';
                return `${pet.idade_valor} ${unidade}`;
            }

            return null;
        };

        pets.forEach(pet => {
            const cardContainer = document.createElement('div');
            cardContainer.className = 'pet-card-container';
            
            const fotoSrc = pet.foto_url ? '..' + pet.foto_url : '../assets/image/cachorro.png';
            const nomeSeguro = (pet.nome && pet.nome !== 'null' && pet.nome !== 'undefined') ? pet.nome : 'Sem nome';
            const racaSegura = (pet.raca && pet.raca !== 'null' && pet.raca !== 'Selecione...' && pet.raca !== 'undefined') ? pet.raca : 'Sem raça definida';

            // Executa a nova lógica de idade limpa
            const idadeFormatada = calcularIdadeTexto(pet);
            const ageText = idadeFormatada ? ` • ${idadeFormatada}` : '';

            cardContainer.innerHTML = `
                <div class="pet-card-top">
                    <img src="${fotoSrc}" alt="${nomeSeguro}" class="pet-img" onerror="this.src='../assets/image/cachorro.png'">
                    <div class="pet-details" style="flex: 1;">
                        <h3>${nomeSeguro}</h3>
                        <p>${racaSegura}${ageText}</p>
                    </div>
                    
                    <div class="pet-options-container">
                        <button class="btn-options">
                            <i class="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <div class="dropdown-menu hidden">
                            <div class="dropdown-item btn-edit">
                                <i class="fa-solid fa-pen"></i> Editar
                            </div>
                            <div class="dropdown-item btn-delete">
                                <i class="fa-solid fa-trash"></i> Excluir
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="pet-action-buttons">
                    <div class="action-btn" data-action="carteira">
                        <i class="fa-solid fa-wallet" style="color: #0056b3;"></i>
                        <span>Carteira</span>
                    </div>
                    <div class="action-btn" data-action="vacinas">
                        <i class="fa-solid fa-syringe" style="color: #0056b3;"></i>
                        <span>Vacinas</span>
                    </div>
                    <div class="action-btn" data-action="consultas">
                        <i class="fa-solid fa-notes-medical" style="color: #ff4d4d;"></i>
                        <span>Consultas</span>
                    </div>
                </div>
            `;

            const cardTop = cardContainer.querySelector('.pet-card-top');
            cardTop.style.cursor = 'pointer';
            cardTop.addEventListener('click', () => {
                window.location.href = `./pets/perfilPet.html?id=${pet.id_pet}`;
            });

            const btnCarteira = cardContainer.querySelector('[data-action="carteira"]');
            btnCarteira.addEventListener('click', () => onViewCarteira(pet.id_pet));

            const btnOptions = cardContainer.querySelector('.btn-options');
            const dropdownMenu = cardContainer.querySelector('.dropdown-menu');
            const btnEdit = cardContainer.querySelector('.btn-edit');
            const btnDelete = cardContainer.querySelector('.btn-delete');

            btnOptions.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.dropdown-menu:not(.hidden)').forEach(menu => {
                    if (menu !== dropdownMenu) menu.classList.add('hidden');
                });
                dropdownMenu.classList.toggle('hidden');
            });

            btnEdit.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.add('hidden');
                onEditPet(pet.id_pet);
            });

            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.add('hidden');
                onDeletePet(pet.id_pet, nomeSeguro);
            });

            this.petListContainer.appendChild(cardContainer);
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu:not(.hidden)').forEach(menu => {
                menu.classList.add('hidden');
            });
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