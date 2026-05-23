document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('historico-lista');
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('petId'); 
    
    let historicoData = [];
    let enciclopediaMedica = [];

    // Carrega o dicionário médico (JSON)
    async function carregarDicionario() {
        try {
            const res = await fetch('../data/databaseInfoMed.json');
            const data = await res.json();
            data.forEach(item => {
                if (item.vaccines) enciclopediaMedica.push(...item.vaccines);
                if (item.medications) enciclopediaMedica.push(...item.medications);
            });
        } catch (e) { console.error("Erro ao carregar dicionário:", e); }
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    }

    async function buscarHistorico() {
        if (!petId) return;
        const token = localStorage.getItem('auth-token-petto'); 
        try {
            const response = await fetch(`/api/pets/${petId}/historico`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar histórico.');
            historicoData = await response.json();
            renderizarHistorico('Tudo');
        } catch (error) { console.error(error); }
    }

    function renderizarHistorico(filtro) {
        listContainer.innerHTML = '';
        const dadosFiltrados = filtro === 'Tudo' ? historicoData : historicoData.filter(i => i.categoria === filtro);

        dadosFiltrados.forEach(item => {
            let iconClass, iconTag, tagBg, tagColor;
            if (item.categoria === 'Vacina') {
                iconClass = 'bg-vacina'; iconTag = 'fa-check'; tagBg = 'var(--tag-bg)'; tagColor = 'var(--tag-text)';
            } else if (item.categoria === 'Medicação') {
                iconClass = 'bg-med-red'; iconTag = 'fa-rotate-right'; tagBg = '#e0f2f1'; tagColor = '#00897b';
            } else {
                iconClass = 'bg-exame'; iconTag = 'fa-flask'; tagBg = '#e9ecef'; tagColor = '#6c757d';
            }

            const safeNome = escapeHTML(item.nome);
            const safeData = item.data ? escapeHTML(item.data.split('T')[0]) : 'Data não informada';
            const safeVeterinario = item.veterinario ? escapeHTML(item.veterinario) : null;
            
            // Card original (sem ícones extras), mas com data-id
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
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    // Evento de clique unificado no container (mais eficiente e não falha nos cliques internos)
    listContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.list-item');
        if (!card) return; // Se não clicou num card, ignora

        const idDataset = card.getAttribute('data-id');
        
        if (!idDataset || idDataset === 'null' || idDataset === '') {
            Swal.fire('Informação', 'Não há detalhes adicionais disponíveis para este item.', 'info');
            return;
        }

        const info = enciclopediaMedica.find(m => m.id === idDataset);

        if (info) {
            Swal.fire({
                title: info.name,
                html: `
                    <div style="text-align: left; font-size: 14px;">
                        <p><strong>Categoria:</strong> ${info.category}</p>
                        ${info.schedule ? `<p><strong>Protocolo:</strong> ${info.schedule.first_dose_note || 'Consulte seu veterinário.'}</p>` : ''}
                    </div>
                `,
                confirmButtonColor: '#4890F0'
            });
        } else {
            Swal.fire('Aviso', 'Informações educativas não encontradas.', 'info');
        }
    });

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