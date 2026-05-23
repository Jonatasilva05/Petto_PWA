document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('petId');
    const listContainer = document.getElementById('lista-vacinas');
    const filterTabs = document.querySelectorAll('.filter-tab');

    let dadosVacinas = [];

    document.getElementById('btn-voltar').addEventListener('click', () => {
        window.location.href = `../pets/perfilPet.html?id=${petId}`;
    });

    const escapeHTML = (str) => {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
    };

    const classificarStatus = (item) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Se tem data de aplicação e já passou ou é hoje
        if (item.data && new Date(item.data) <= hoje) {
            return { status: 'Aplicadas', classeStatus: 'status-aplicada', classeIcone: 'icon-aplicada', icone: 'fa-check', textoData: `Aplicado em: ${item.data.split('T')[0]}` };
        } 
        
        // Se tem data prevista (adapte 'data_prevista' para o nome da coluna no seu DB)
        if (item.data_prevista) {
            const dataPrevista = new Date(item.data_prevista);
            if (dataPrevista < hoje) {
                return { status: 'Atrasadas', classeStatus: 'status-atrasada', classeIcone: 'icon-atrasada', icone: 'fa-triangle-exclamation', textoData: `Venceu em: ${item.data_prevista.split('T')[0]}` };
            } else {
                return { status: 'Futuras', classeStatus: 'status-futura', classeIcone: 'icon-futura', icone: 'fa-calendar-days', textoData: `Agendado para: ${item.data_prevista.split('T')[0]}` };
            }
        }

        return { status: 'Aplicadas', classeStatus: 'status-aplicada', classeIcone: 'icon-aplicada', icone: 'fa-check', textoData: 'Data indisponível' };
    };

    const renderizarLista = (filtro) => {
        listContainer.innerHTML = '';
        
        const dadosFiltrados = dadosVacinas.filter(item => filtro === 'Tudo' || item.infoStatus.status === filtro);

        if (dadosFiltrados.length === 0) {
            listContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top: 20px;">Nenhuma vacina encontrada nesta categoria.</p>`;
            return;
        }

        dadosFiltrados.forEach(item => {
            const cardHtml = `
                <div class="list-item">
                    <div class="item-icon ${item.infoStatus.classeIcone}"><i class="fa-solid fa-syringe"></i></div>
                    <div class="item-details">
                        <div class="title-row">
                            <h3>${escapeHTML(item.nome)}</h3>
                        </div>
                        <p style="color: var(--text-muted); margin-bottom: 5px;">${item.infoStatus.textoData}</p>
                        <span class="${item.infoStatus.classeStatus}"><i class="fa-solid ${item.infoStatus.icone}"></i> ${item.infoStatus.status.slice(0, -1)}</span>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    };

    const buscarVacinas = async () => {
        const token = localStorage.getItem('auth-token-petto'); 
        try {
            const response = await fetch(`/api/pets/${petId}/historico`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar dados.');
            
            const historicoGeral = await response.json();
            const apenasVacinas = historicoGeral.filter(i => i.categoria === 'Vacina');
            
            dadosVacinas = apenasVacinas.map(item => ({
                ...item,
                infoStatus: classificarStatus(item)
            }));

            renderizarLista('Tudo');
        } catch (error) {
            listContainer.innerHTML = '<p style="text-align:center; color: red;">Erro ao carregar dados do banco.</p>';
        }
    };

    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active-outline'));
            e.target.classList.add('active-outline');
            renderizarLista(e.target.getAttribute('data-filter'));
        });
    });

    buscarVacinas();
});