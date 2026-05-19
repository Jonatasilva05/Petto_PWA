document.addEventListener('DOMContentLoaded', () => {
    // AÇÃO DE VOLTAR
    const btnVoltar = document.getElementById('btn-voltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            if (petId) {
                // Volta direto para o perfil DO PET ESPECÍFICO
                window.location.href = `perfilPet.html?id=${petId}`;
            } else {
                // Fallback caso dê algum erro
                window.location.href = '../dashboard.html';
            }
        });
    }

    const listContainer = document.getElementById('historico-lista');
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    // Captura o ID do pet da URL (Ex: historicoPet.html?petId=103)
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('petId'); 
    let historicoData = [];

    // Função de sanitização para proteger a tela e o dispositivo
    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    }

    async function buscarHistorico() {
        if (!petId) {
            listContainer.innerHTML = '<p style="text-align:center; margin-top:20px;">ID do Pet não fornecido.</p>';
            return;
        }

        // CORREÇÃO 1: Usa a chave exata gerada no momento do seu login seguro
        const token = localStorage.getItem('auth-token-petto'); 
        
        if (!token) {
            alert("Acesso protegido. Faça login para visualizar o histórico.");
            // CORREÇÃO 2: Redireciona corretamente para a página inicial (Login) do app
            window.location.href = '../../index.html';
            return;
        }

        try {
            // CORREÇÃO 3: URL relativa (/api/...) garante o funcionamento no Celular (Wi-Fi) e no Notebook
            const response = await fetch(`/api/pets/${petId}/historico`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Falha ao autenticar ou buscar dados.');

            historicoData = await response.json();
            renderizarHistorico('Tudo');

        } catch (error) {
            console.error('Erro na conexão segura:', error);
            listContainer.innerHTML = '<p style="text-align:center; margin-top:20px; color: red;">Não foi possível carregar os dados.</p>';
        }
    }

    function renderizarHistorico(filtro) {
        listContainer.innerHTML = '';

        const dadosFiltrados = filtro === 'Tudo' 
            ? historicoData 
            : historicoData.filter(item => item.categoria === filtro);

        if (dadosFiltrados.length === 0) {
            listContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top: 20px;">Nenhum registro de ${filtro.toLowerCase()} encontrado.</p>`;
            return;
        }

        dadosFiltrados.forEach(item => {
            // Definição de design baseada na categoria do banco
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
            
            // Inserção segura no DOM
            listContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    // Configuração de abas (Filtros)
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active-outline'));
            e.target.classList.add('active-outline');
            renderizarHistorico(e.target.getAttribute('data-filter'));
        });
    });

    // Permite voltar para o perfil do pet clicando no título "Histórico"
    document.querySelector('.header-top h1').addEventListener('click', () => {
        window.history.back();
    });

    buscarHistorico();
});