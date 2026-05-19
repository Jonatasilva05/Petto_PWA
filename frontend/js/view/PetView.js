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

    // Função de segurança para evitar injeção de código (XSS)
    escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    }

    // Gerencia o clique nas abas de filtro
    bindFiltrosHistorico(callback) {
        const tabs = document.querySelectorAll('.filter-tab');
        if (!tabs.length) return;
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove a borda de todos e adiciona no clicado
                tabs.forEach(t => t.classList.remove('active-outline'));
                e.target.classList.add('active-outline');
                
                // Retorna o texto da aba (Tudo, Vacinas, Exames, Alergias)
                callback(e.target.textContent.trim()); 
            });
        });
    }

    // Renderiza a lista na tela
    renderHistorico(historicoData, filtro = 'Tudo') {
        const listContainer = document.querySelector('.list-container');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        // Filtra os dados com base no texto da aba clicada
        const dadosFiltrados = filtro === 'Tudo' 
            ? historicoData 
            : historicoData.filter(item => {
                if (filtro === 'Vacinas') return item.categoria === 'Vacina';
                if (filtro === 'Medicações') return item.categoria === 'Medicação';
                if (filtro === 'Exames') return item.categoria === 'Exame/Consulta';
                if (filtro === 'Alergias') return item.categoria === 'Alergia';
                return item.categoria === filtro;
            });

        if (dadosFiltrados.length === 0) {
            listContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top: 20px;">Nenhum registro encontrado para este filtro.</p>`;
            return;
        }

        dadosFiltrados.forEach(item => {
            let iconClass, iconTag, tagBg, tagColor;
            
            // Define estilos com base na categoria
            if (item.categoria === 'Vacina') {
                iconClass = 'bg-vacina'; iconTag = 'fa-check'; tagBg = 'var(--tag-bg)'; tagColor = 'var(--tag-text)';
            } else if (item.categoria === 'Medicação') {
                iconClass = 'bg-med-red'; iconTag = 'fa-rotate-right'; tagBg = '#e0f2f1'; tagColor = '#00897b';
            } else if (item.categoria === 'Alergia') {
                iconClass = 'bg-alergia'; iconTag = 'fa-clipboard-list'; tagBg = '#f3e8ff'; tagColor = '#7e22ce';
            } else {
                iconClass = 'bg-exame'; iconTag = 'fa-flask'; tagBg = '#e9ecef'; tagColor = '#6c757d';
            }

            const safeNome = this.escapeHTML(item.nome);
            const safeData = item.data ? this.escapeHTML(item.data.split('T')[0]) : 'Data não informada';

            const cardHtml = `
                <div class="list-item">
                    <div class="item-icon ${iconClass}"><i class="fa-solid ${iconTag}"></i></div>
                    <div class="item-details">
                        <div class="title-row">
                            <h3>${safeNome}</h3>
                            <span class="category-tag" style="background:${tagBg}; color:${tagColor};">${item.categoria}</span>
                        </div>
                        <p>${safeData !== 'Data não informada' ? 'Data: ' + safeData : safeData}</p>
                    </div>
                    <div class="status-area">
                        <div class="status-icon-circle circle-green"><i class="fa-solid fa-check"></i></div>
                        <i class="fa-solid fa-chevron-right arrow-icon"></i>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    }
}