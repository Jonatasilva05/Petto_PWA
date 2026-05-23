document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('petId');
    const listContainer = document.getElementById('lista-medicamentos');
    const filterTabs = document.querySelectorAll('.filter-tab');

    let dadosGerados = [];
    let enciclopedia = [];
    let especieDoPet = 'cachorro'; // Fallback
    let opcoesDeMedicamentos = [];

    document.getElementById('btn-voltar').addEventListener('click', () => {
        window.location.href = `../pets/perfilPet.html?id=${petId}`;
    });

    // ==========================================
    // 1. CARREGAR DADOS DO PET E JSON MÉDICO
    // ==========================================
    const normalizarEspecie = (texto) => {
        if (!texto) return 'cachorro';
        let t = texto.toLowerCase().replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        if (t.includes('cachorro') || t.includes('cão') || t.includes('cao')) return 'cachorro';
        if (t.includes('gato')) return 'gato';
        if (t.includes('furão') || t.includes('furao')) return 'furao';
        if (t.includes('tartaruga')) return 'tartaruga';
        if (t.includes('coelho')) return 'coelho';
        if (t.includes('passaro') || t.includes('pássaro')) return 'passaro';
        if (t.includes('roedor')) return 'roedor';
        if (t.includes('reptil') || t.includes('réptil')) return 'reptil';
        if (t.includes('peixe')) return 'peixe';
        return 'cachorro';
    };

    const prepararOpcoesCadastro = async () => {
        const token = localStorage.getItem('auth-token-petto');
        try {
            const resPet = await fetch(`/api/pets/${petId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (resPet.ok) {
                const pet = await resPet.json();
                especieDoPet = normalizarEspecie(pet.especie);
            }

            // Puxa do databaseMedi.json igual no cadastro
            const resJson = await fetch('../data/databaseMedi.json');
            if (resJson.ok) {
                const bancoMedico = await resJson.json();
                const dadosEspecie = bancoMedico.find(item => item.species_value === especieDoPet);
                if (dadosEspecie && dadosEspecie.medications) {
                    opcoesDeMedicamentos = dadosEspecie.medications;
                }
            }
        } catch (e) {
            console.error("Erro ao carregar opções para o select:", e);
        }
    };

    // =========================================================
    // LÓGICA DE ADICIONAR MEDICAMENTO (COM SELECT DINÂMICO)
    // =========================================================
    const btnAdicionarMed = document.getElementById('btn-adicionar-med');
    
    if (btnAdicionarMed) {
        btnAdicionarMed.addEventListener('click', async () => {
            
            let selectHtml = `<option value="">Selecione um medicamento...</option>`;
            opcoesDeMedicamentos.forEach(m => {
                selectHtml += `<option value="${m.id}" data-nome="${m.name}">${m.name}</option>`;
            });
            selectHtml += `<option value="outro">Outro (Digitar manualmente)</option>`;

            const { value: formValues } = await Swal.fire({
                title: 'Novo Medicamento',
                html: `
                    <div style="text-align: left; font-size: 14px;">
                        <label style="color: var(--text-muted); font-weight: 600;">Selecione a Categoria</label>
                        <select id="swal-select-nome" style="width: 100%; margin: 5px 0 10px 0; padding: 12px; border-radius: 8px; border: 1px solid #ccc; background: var(--card-bg);">
                            ${selectHtml}
                        </select>
                        <input id="swal-custom-nome" class="swal2-input" placeholder="Digite o nome do remédio" style="display: none; width: 100%; margin: 5px 0 15px 0;">
                        
                        <label style="color: var(--text-muted); font-weight: 600;">Data da Administração</label>
                        <input id="swal-data" type="date" class="swal2-input" style="width: 100%; margin: 5px 0 15px 0;">
                        
                        <label style="color: var(--text-muted); font-weight: 600;">Próxima Dose (Opcional)</label>
                        <input id="swal-prevista" type="date" class="swal2-input" style="width: 100%; margin: 5px 0 0 0;">
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#e91e63', 
                cancelButtonColor: '#aaa',
                didOpen: () => {
                    const select = document.getElementById('swal-select-nome');
                    const customInput = document.getElementById('swal-custom-nome');
                    select.addEventListener('change', (e) => {
                        if(e.target.value === 'outro') {
                            customInput.style.display = 'block';
                            customInput.focus();
                        } else {
                            customInput.style.display = 'none';
                        }
                    });
                },
                preConfirm: () => {
                    const select = document.getElementById('swal-select-nome');
                    const custom = document.getElementById('swal-custom-nome');
                    let nome = '';
                    let id_dataset = null;

                    if (select.value === 'outro') {
                        nome = custom.value.trim();
                    } else if (select.value !== '') {
                        nome = select.options[select.selectedIndex].getAttribute('data-nome');
                        id_dataset = select.value;
                    }

                    const data = document.getElementById('swal-data').value;
                    const data_prevista = document.getElementById('swal-prevista').value;
                    
                    if (!nome || !data) {
                        Swal.showValidationMessage('Preencha o medicamento e a data!');
                        return false;
                    }
                    return { nome, id_dataset, data, data_prevista, categoria: 'Medicação' };
                }
            });

            if (formValues) {
                salvarNovoRegistro(formValues);
            }
        });
    }

    const salvarNovoRegistro = async (dados) => {
        const token = localStorage.getItem('auth-token-petto');
        try {
            Swal.fire({ title: 'Salvando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            const response = await fetch(`/api/pets/${petId}/historico`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            });

            if (!response.ok) throw new Error('Erro ao salvar no banco');

            await Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Medicamento registrado.', confirmButtonColor: '#e91e63' });
            buscarEProcessarDados(); 
        } catch (error) {
            Swal.fire('Erro', 'Não foi possível salvar o medicamento.', 'error');
        }
    };

    // =========================================================
    // O MOTOR INTELIGENTE EXISTENTE
    // =========================================================
    const carregarEnciclopedia = async () => {
        try {
            const res = await fetch('../data/encyclopediaMedi.json');
            enciclopedia = await res.json();
        } catch (e) { console.error(e); }
    };

    const buscarInfoEducacional = (idDataset, especie) => {
        if (!enciclopedia.length) return null;
        const dadosEspecie = enciclopedia.find(e => e.species_value === especie);
        if (!dadosEspecie) return null;
        return dadosEspecie.medications.find(m => m.id === idDataset);
    };

    const classificarStatus = (item) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataItem = new Date(item.data_calculada);

        if (item.tipo_registro === 'historico_real') {
            return { status: 'Aplicadas', classeStatus: 'status-aplicada', classeIcone: 'icon-aplicada', icone: 'fa-check', textoData: `Administrado em: ${item.data_calculada.split('T')[0]}` };
        } else if (dataItem < hoje) {
            return { status: 'Atrasadas', classeStatus: 'status-atrasada', classeIcone: 'icon-atrasada', icone: 'fa-triangle-exclamation', textoData: `Atrasado desde: ${item.data_calculada.split('T')[0]}` };
        } else {
            return { status: 'Futuras', classeStatus: 'status-futura', classeIcone: 'icon-futura', icone: 'fa-calendar-days', textoData: `Próxima dose: ${item.data_calculada.split('T')[0]}` };
        }
    };

    const renderizarLista = (filtro) => {
        listContainer.innerHTML = '';
        const dadosFiltrados = dadosGerados.filter(item => filtro === 'Tudo' || item.infoStatus.status === filtro);

        if (dadosFiltrados.length === 0) {
            listContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top: 20px;">Nenhum medicamento encontrado nesta categoria.</p>`;
            return;
        }

        dadosFiltrados.sort((a, b) => new Date(b.data_calculada) - new Date(a.data_calculada));

        dadosFiltrados.forEach((item, index) => {
            const memory = buscarInfoEducacional(item.id_dataset, especieDoPet); 
            
            let htmlMemoria = '';
            if (memory) {
                htmlMemoria = `
                    <button class="btn-saiba-mais" onclick="document.getElementById('med-mem-${index}').classList.toggle('active')">
                        <i class="fa-solid fa-graduation-cap"></i> Quando usar e por quê?
                    </button>
                    <div class="memory-box" id="med-mem-${index}">
                        <h4><i class="fa-solid fa-bug-slash"></i> O que trata/previne:</h4>
                        <ul>${memory.previne_trata.map(p => `<li>${p}</li>`).join('')}</ul>
                        <h4><i class="fa-solid fa-clock-rotate-left"></i> Regra de uso:</h4>
                        <p>${memory.regra.quando_usar}</p>
                        <p><strong>Observação:</strong> ${memory.regra.observacoes || ''}</p>
                    </div>
                `;
            }

            const cardHtml = `
                <div class="list-item" style="flex-direction: column; align-items: stretch;">
                    <div style="display: flex; align-items: center; width: 100%;">
                        <div class="item-icon ${item.infoStatus.classeIcone}"><i class="fa-solid fa-pills"></i></div>
                        <div class="item-details">
                            <div class="title-row">
                                <h3>${item.nome}</h3>
                            </div>
                            <p style="color: var(--text-muted); margin-bottom: 5px;">${item.infoStatus.textoData}</p>
                            <span class="${item.infoStatus.classeStatus}"><i class="fa-solid ${item.infoStatus.icone}"></i> ${item.infoStatus.status === 'Aplicadas' ? 'Aplicado' : item.infoStatus.status.slice(0,-1)}</span>
                        </div>
                    </div>
                    ${htmlMemoria}
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    };

    const buscarEProcessarDados = async () => {
        await carregarEnciclopedia();
        const token = localStorage.getItem('auth-token-petto'); 
        
        try {
            const response = await fetch(`/api/pets/${petId}/historico`, { headers: { 'Authorization': `Bearer ${token}` } });
            const historicoGeral = response.ok ? await response.json() : [];
            const medsReais = historicoGeral.filter(i => i.categoria === 'Medicação');

            dadosGerados = [];
            const ultimasAplicacoes = {};

            medsReais.forEach(m => {
                dadosGerados.push({
                    ...m,
                    data_calculada: m.data,
                    tipo_registro: 'historico_real',
                    infoStatus: classificarStatus({ data_calculada: m.data, tipo_registro: 'historico_real' })
                });

                if (m.id_dataset) {
                    if (!ultimasAplicacoes[m.id_dataset] || new Date(m.data) > new Date(ultimasAplicacoes[m.id_dataset].data)) {
                        ultimasAplicacoes[m.id_dataset] = m;
                    }
                }
            });

            // Projeta o futuro base (+90 dias)
            Object.values(ultimasAplicacoes).forEach(ultima => {
                const dataUltima = new Date(ultima.data);
                
                if (ultima.id_dataset && ultima.id_dataset.includes('antipulgas')) {
                    dataUltima.setDate(dataUltima.getDate() + 30);
                } else {
                    dataUltima.setDate(dataUltima.getDate() + 90);
                }
                
                const itemProjetado = {
                    id_dataset: ultima.id_dataset,
                    nome: `Próxima Dose: ${ultima.nome}`,
                    categoria: 'Medicação',
                    data_calculada: dataUltima.toISOString(),
                    tipo_registro: 'lembrete_gerado'
                };
                
                itemProjetado.infoStatus = classificarStatus(itemProjetado);
                dadosGerados.push(itemProjetado);
            });

            const abaAtiva = document.querySelector('.filter-tab.active-outline').getAttribute('data-filter');
            renderizarLista(abaAtiva);
        } catch (error) {
            listContainer.innerHTML = '<p style="text-align:center; color: red;">Erro ao processar dados.</p>';
        }
    };

    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active-outline'));
            e.target.classList.add('active-outline');
            renderizarLista(e.target.getAttribute('data-filter'));
        });
    });

    // START
    prepararOpcoesCadastro().then(() => {
        buscarEProcessarDados();
    });
});