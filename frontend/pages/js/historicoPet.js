document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('historico-lista');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const btnVoltar = document.getElementById('btn-voltar');

    // Captura o ID do pet da URL (Ex: historicoPet.html?petId=103)
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('petId'); 
    
    let historicoData = [];
    let enciclopediaMedica = [];

    // 1. AÇÃO DE VOLTAR: Redireciona corretamente para o perfil do pet
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            if (petId) {
                window.location.href = `perfilPet.html?id=${petId}`;
            } else {
                window.location.href = '../dashboard.html';
            }
        });
    }

    // 2. CARREGAR DICIONÁRIO MÉDICO
    async function carregarDicionario() {
        try {
            const res = await fetch('../data/dataBaseInfoMed2.json');
            const data = await res.json();
            
            data.forEach(item => {
                if (item.vaccines) enciclopediaMedica.push(...item.vaccines);
                if (item.medications) enciclopediaMedica.push(...item.medications);
            });
            console.log("IDs disponíveis para busca:", enciclopediaMedica.map(m => m.id));
        } catch (e) { 
            console.error("Erro ao carregar enciclopédia médica:", e); 
        }
    }

    // 3. FUNÇÃO DE SANITIZAÇÃO
    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    }

    // 4. BUSCAR HISTÓRICO DA API
    async function buscarHistorico() {
        if (!petId) {
            listContainer.innerHTML = '<p style="text-align:center; margin-top:20px;">ID do Pet não fornecido.</p>';
            return;
        }

        const token = localStorage.getItem('auth-token-petto'); 
        try {
            const response = await fetch(`/api/pets/${petId}/historico`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar histórico.');
            historicoData = await response.json();
            renderizarHistorico('Tudo');
        } catch (error) {
            console.error(error);
            listContainer.innerHTML = '<p style="text-align:center; color: red;">Erro ao carregar dados.</p>';
        }
    }

    // 5. RENDERIZAR CARDS (Visual Original)
    function renderizarHistorico(filtro) {
        listContainer.innerHTML = '';
        const dadosFiltrados = filtro === 'Tudo' ? historicoData : historicoData.filter(i => i.categoria === filtro);

        if (dadosFiltrados.length === 0) {
            listContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top: 20px;">Nenhum registro encontrado.</p>`;
            return;
        }

        dadosFiltrados.forEach(item => {
            let iconClass = 'bg-exame', iconTag = 'fa-flask';
            let tagBg = '#e9ecef', tagColor = '#6c757d';

            if (item.categoria === 'Vacina') {
                iconClass = 'bg-vacina'; iconTag = 'fa-check'; 
                tagBg = 'var(--tag-bg)'; tagColor = 'var(--tag-text)';
            } else if (item.categoria === 'Medicação') {
                iconClass = 'bg-med-red'; iconTag = 'fa-rotate-right'; 
                tagBg = '#e0f2f1'; tagColor = '#00897b';
            }

            const safeNome = escapeHTML(item.nome);
            const safeData = item.data ? escapeHTML(item.data.split('T')[0]) : 'Data não informada';
            const safeVeterinario = item.veterinario ? escapeHTML(item.veterinario) : null;

            // Mantém a estrutura original do seu card
            const cardHtml = `
                <div class="list-item" data-id="${item.id_dataset || ''}" style="cursor: pointer;">
                    <div class="item-icon ${iconClass}"><i class="fa-solid ${iconTag}"></i></div>
                    <div class="item-details">
                        <div class="title-row">
                            <h3>${safeNome}</h3>
                            <span class="category-tag" style="background:${tagBg}; color:${tagColor};">${item.categoria}</span>
                        </div>
                        <p>${safeData !== 'Data não informada' ? 'Data: ' + safeData : safeData}</p>
                        ${safeVeterinario ? `<p style="font-size: 12px; color: var(--text-muted);"><i class="fa-solid fa-user-doctor"></i> Aplicado por: ${safeVeterinario}</p>` : ''}
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

    // 6. CLIQUE NO CARD (Abre o Alerta)
listContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.list-item');
    if (!card) return;

    const idDataset = card.getAttribute('data-id');
    const info = enciclopediaMedica.find(m => m.id === idDataset);

    if (info) {
        Swal.fire({
            title: info.name,
            html: `
                <div style="text-align: left; font-size: 14px; line-height: 1.6;">
                    <p><strong>Categoria:</strong> ${info.category}</p>

                    ${info.purpose ? `
                        <p style="margin-top:10px;">
                            <strong>Para que serve:</strong><br>
                            ${info.purpose}
                        </p>
                    ` : ''}

                    ${info.schedule ? `
                        <p style="margin-top:10px;">
                            <strong>Protocolo:</strong><br>
                            ${info.schedule.first_dose_note || 'Consulte seu veterinário.'}
                        </p>
                    ` : ''}

                    ${info.schedule?.booster?.note ? `
                        <p style="margin-top:10px;">
                            <strong>Reforço:</strong><br>
                            ${info.schedule.booster.note}
                        </p>
                    ` : ''}
                </div>
            `,
            confirmButtonColor: '#4890F0',
            confirmButtonText: 'Entendido'
        });
    } else if (idDataset && idDataset !== 'null') {
        Swal.fire('Informação', 'Detalhes educativos indisponíveis para este item.', 'info');
    }
});

    // 7. Filtros
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active-outline'));
            e.target.classList.add('active-outline');
            renderizarHistorico(e.target.getAttribute('data-filter'));
        });
    });

    carregarDicionario();
    buscarHistorico();
});