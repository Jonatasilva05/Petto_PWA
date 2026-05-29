document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a listagem trazendo os dados reais do banco
    carregarPacientes();

    // ==========================================
    // 0. CONTROLE DO CABEÇALHO (Dropdown e Perfil)
    // ==========================================
    const rawName = localStorage.getItem('user-name') || 'Veterinário';
    let formattedName = rawName;
    if (!rawName.toLowerCase().startsWith('dr')) {
        const firstName = rawName.split(' ')[0].toLowerCase();
        const nomesFemininos = ['thais', 'beatriz', 'raquel', 'carol', 'aline', 'sabrina', 'stefani'];
        formattedName = (nomesFemininos.includes(firstName) || firstName.endsWith('a')) ? `Dra. ${rawName}` : `Dr. ${rawName}`;
    }

    const vetProfileName = document.getElementById('vet-profile-name');
    if (vetProfileName) vetProfileName.textContent = formattedName;

    const btnProfileMenu = document.getElementById('btn-profile-menu');
    const dropdownProfile = document.getElementById('dropdown-profile');
    const btnLogout = document.getElementById('btn-logout');

    if (btnProfileMenu && dropdownProfile) {
        btnProfileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownProfile.classList.toggle('hidden');
            dropdownProfile.classList.toggle('flex');
        });

        document.addEventListener('click', (e) => {
            if (!btnProfileMenu.contains(e.target) && !dropdownProfile.contains(e.target)) {
                dropdownProfile.classList.add('hidden');
                dropdownProfile.classList.remove('flex');
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('Deseja realmente sair da conta?')) {
                localStorage.removeItem('auth-token-petto');
                localStorage.removeItem('user-role');
                localStorage.removeItem('user-name');
                window.location.href = '../index.html';
            }
        });
    }

    // ==========================================
    // 1. BUSCA E RENDERIZAÇÃO DOS CARDS
    // ==========================================
    async function carregarPacientes() {
        const container = document.getElementById('lista-pets');
        const token = localStorage.getItem('auth-token-petto');

        if (!container) return;

        try {
            const response = await fetch('/api/vet/pacientes', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erro ao carregar dados do servidor.');

            const pacientes = await response.json();

            // Se não houver nenhum pet vinculado a este veterinário
            if (pacientes.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-16 border border-dashed border-dark-border rounded-3xl bg-dark-900/40 p-8">
                        <div class="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500 text-2xl">
                            <i class="ph ph-paw-print"></i>
                        </div>
                        <h4 class="text-lg font-bold text-white mb-1">Nenhum pet na sua base de dados</h4>
                        <p class="text-sm text-gray-400 max-w-md mx-auto mb-6">Você só verá os pets de tutores vinculados à sua conta. Use a busca por CPF para vincular um tutor existente.</p>
                    </div>
                `;
                return;
            }

            // Mapeia e renderiza cada pet dinamicamente
            container.innerHTML = pacientes.map(pet => {
                // Configura imagens de fallback caso o pet não possua foto cadastrada
                let fotoURL = pet.foto_url;
                if (!fotoURL) {
                    fotoURL = (pet.especie && pet.especie.toLowerCase() === 'gato')
                        ? 'https://placecats.com/500/300'
                        : 'https://placedog.net/500/300';
                }

                const racaExibir = pet.raca || 'Sem raça definida';
                const idadeExibir = pet.idade_valor ? `${pet.idade_valor} ${pet.idade_unidade}` : 'Idade não informada';
                const pesoExibir = pet.peso ? `${pet.peso}kg` : 'N/I';

                return `
                <div class="glass-panel rounded-3xl p-0 card-hover flex flex-col overflow-hidden border border-dark-border bg-dark-900">
                    <div class="pet-cover h-40 relative overflow-hidden">
                        <img src="${fotoURL}" class="w-full h-full object-cover" />
                        <div class="pet-overlay absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-900/40 to-transparent"></div>
                        <div class="absolute top-4 right-4 z-10">
                            <span class="badge badge-green">
                                <i class="ph-fill ph-check-circle"></i> Sincronizado
                            </span>
                        </div>
                    </div>
                    <div class="p-6 pt-0 flex-1 flex flex-col relative">
                        <div class="flex justify-between items-start">
                            <div class="w-20 h-20 rounded-2xl overflow-hidden border-4 border-dark-950 -mt-10 relative z-10 bg-dark-800">
                                <img src="${fotoURL}" class="w-full h-full object-cover" />
                            </div>
                            <div class="flex gap-2 mt-4">
                                <button onclick="editarPet(${pet.id_pet})" class="w-10 h-10 rounded-xl bg-dark-800 border border-dark-border text-gray-400 hover:text-primary transition-colors flex items-center justify-center">
                                    <i class="ph ph-pencil-simple"></i>
                                </button>
                            </div>
                        </div>

                        <div class="mt-4 mb-6">
                            <h3 class="text-2xl font-bold text-white tracking-tight">${pet.pet_nome}</h3>
                            <p class="text-sm text-gray-400 mt-1">${racaExibir} • ${idadeExibir}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-3 mb-6">
                            <div class="bg-dark-800 border border-dark-border rounded-xl p-3">
                                <p class="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Tutor(a)</p>
                                <p class="text-sm font-medium text-white truncate" title="${pet.tutor_nome}">${pet.tutor_nome}</p>
                            </div>
                            <div class="bg-dark-800 border border-dark-border rounded-xl p-3">
                                <p class="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Peso Corporal</p>
                                <p class="text-sm font-medium text-white">${pesoExibir}</p>
                            </div>
                        </div>

                        <div class="mt-auto pt-4 border-t border-dark-border flex items-center justify-between">
                            <span class="text-xs text-gray-500 flex items-center gap-1">
                                <i class="ph ph-shield-check text-primary"></i> Prontuário Ativo
                            </span>
                            <button class="text-primary text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
                                Prontuário <i class="ph-bold ph-arrow-right text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');

        } catch (error) {
            console.error(error);
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-red-400">
                    <i class="ph ph-warning text-2xl"></i>
                    <p class="mt-2">Erro ao conectar com a API do Petto Workspace.</p>
                </div>
            `;
        }
    }

    // ==========================================
    // 2. CONTROLE DO MODAL: CADASTRO DE NOVO PET
    // ==========================================
    const modalPet = document.getElementById('modalPet');
    const toggleModalPet = () => modalPet.classList.toggle('hidden');

    document.getElementById('btnNovoPet')?.addEventListener('click', toggleModalPet);
    document.getElementById('fecharModal')?.addEventListener('click', toggleModalPet);
    document.getElementById('cancelarModal')?.addEventListener('click', toggleModalPet);

    // Evita envio do formulário com a tecla Enter acidental em inputs/selects
    document.querySelectorAll('#formPet input, #formPet select').forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    });

    // ==========================================
    // 3. CONTROLE DO MODAL: BUSCA / VÍNCULO POR CPF OU EMAIL
    // ==========================================
    const modalBuscaCPF = document.getElementById('modalBuscaCPF');
    const panelBusca = modalBuscaCPF?.querySelector('.shadow-card');
    
    // Elementos da Etapa 1
    const formBuscaTutor = document.getElementById('formBuscaTutor');
    const radiosTipoBusca = document.querySelectorAll('input[name="tipoBusca"]');
    const inputBusca = document.getElementById('inputBusca');
    const btnBuscarTutor = document.getElementById('btnBuscarTutor');

    // Elementos da Etapa 2
    const formVincularPets = document.getElementById('formVincularPets');
    const resultadoTutorNome = document.getElementById('resultadoTutorNome');
    const resultadoTutorDetalhe = document.getElementById('resultadoTutorDetalhe');
    const listaPetsResultado = document.getElementById('listaPetsResultado');
    const btnVoltarBusca = document.getElementById('btnVoltarBusca');
    const tutorIdSelecionado = document.getElementById('tutorIdSelecionado');
    const btnConfirmarVinculo = document.getElementById('btnConfirmarVinculo');

    const resetarModalBusca = () => {
        formBuscaTutor.classList.remove('hidden');
        formVincularPets.classList.add('hidden');
        inputBusca.value = '';
        listaPetsResultado.innerHTML = '';
    };

    const abrirModalCPF = () => {
        resetarModalBusca();
        modalBuscaCPF?.classList.remove('hidden');
        setTimeout(() => {
            panelBusca?.classList.remove('opacity-0', 'scale-95');
            panelBusca?.classList.add('scale-100');
        }, 10);
    };

    const fecharModalCPF = () => {
        panelBusca?.classList.remove('scale-100');
        panelBusca?.classList.add('opacity-0', 'scale-95');
        setTimeout(() => modalBuscaCPF?.classList.add('hidden'), 300);
    };

    document.getElementById('btnBuscarCPF')?.addEventListener('click', abrirModalCPF);
    document.getElementById('fecharModalCPF')?.addEventListener('click', fecharModalCPF);

    // Controle da Máscara (CPF vs Email)
    radiosTipoBusca.forEach(radio => {
        radio.addEventListener('change', (e) => {
            inputBusca.value = '';
            if (e.target.value === 'cpf') {
                inputBusca.placeholder = 'Digite o CPF...';
                inputBusca.type = 'text';
            } else {
                inputBusca.placeholder = 'Digite o E-mail...';
                inputBusca.type = 'email';
            }
        });
    });

    inputBusca?.addEventListener('input', function(e) {
        const tipoSelecionado = document.querySelector('input[name="tipoBusca"]:checked').value;
        if (tipoSelecionado === 'cpf') {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        }
    });

    btnVoltarBusca?.addEventListener('click', resetarModalBusca);

    // Enviar Busca (Etapa 1)
    formBuscaTutor?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = document.querySelector('input[name="tipoBusca"]:checked').value;
        const termo = inputBusca.value;
        const token = localStorage.getItem('auth-token-petto');

        btnBuscarTutor.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Buscando...';
        btnBuscarTutor.disabled = true;

        try {
            const response = await fetch('/api/vet/buscar-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tipo, termo })
            });

            const data = await response.json();

            if (response.ok) {
                // Preenche os dados da Etapa 2
                tutorIdSelecionado.value = data.tutor.id;
                resultadoTutorNome.textContent = data.tutor.nome;
                resultadoTutorDetalhe.textContent = `${data.tutor.email} ${data.tutor.cpf ? '• CPF: ' + data.tutor.cpf : ''}`;

                if (data.pets.length === 0) {
                    listaPetsResultado.innerHTML = `<p class="text-sm text-gray-500 italic p-4 text-center">Este tutor não possui pets cadastrados.</p>`;
                    btnConfirmarVinculo.disabled = true;
                } else {
                    btnConfirmarVinculo.disabled = false;
                    listaPetsResultado.innerHTML = data.pets.map(pet => `
                        <label class="flex items-center gap-3 p-3 bg-dark-900 border border-dark-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                            <input type="checkbox" name="petSelecionado" value="${pet.id_pet}" class="w-5 h-5 accent-primary rounded bg-dark-800 border-dark-border">
                            <div>
                                <p class="text-white font-bold text-sm">${pet.nome}</p>
                                <p class="text-xs text-gray-400">${pet.especie} • ${pet.raca || 'Sem raça definida'}</p>
                            </div>
                        </label>
                    `).join('');
                }

                // Transição de tela
                formBuscaTutor.classList.add('hidden');
                formVincularPets.classList.remove('hidden');
            } else {
                if (typeof Swal !== 'undefined') Swal.fire('Ops', data.message, 'warning');
                else alert(data.message);
            }
        } catch (error) {
            console.error(error);
            if (typeof Swal !== 'undefined') Swal.fire('Erro', 'Ocorreu um erro na conexão.', 'error');
        } finally {
            btnBuscarTutor.innerHTML = '<i class="ph-bold ph-magnifying-glass"></i> Buscar Tutor';
            btnBuscarTutor.disabled = false;
        }
    });

    // Enviar Vínculo de Pets (Etapa 2)
    formVincularPets?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id_tutor = tutorIdSelecionado.value;
        const checkboxes = document.querySelectorAll('input[name="petSelecionado"]:checked');
        const pets_ids = Array.from(checkboxes).map(cb => cb.value);

        if (pets_ids.length === 0) {
            if (typeof Swal !== 'undefined') Swal.fire('Atenção', 'Selecione pelo menos um pet para vincular.', 'warning');
            return;
        }

        const token = localStorage.getItem('auth-token-petto');
        btnConfirmarVinculo.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Vinculando...';
        btnConfirmarVinculo.disabled = true;

        try {
            const response = await fetch('/api/vet/vincular-tutor-pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id_tutor, pets_ids })
            });

            const data = await response.json();

            if (response.ok) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Pronto!', text: data.message, timer: 2500, showConfirmButton: false });
                fecharModalCPF();
                carregarPacientes(); // Atualiza a grid com os novos pets instantaneamente
            } else {
                if (typeof Swal !== 'undefined') Swal.fire('Aviso', data.message, 'warning');
            }
        } catch (error) {
            console.error(error);
            if (typeof Swal !== 'undefined') Swal.fire('Erro', 'Falha ao processar o vínculo.', 'error');
        } finally {
            btnConfirmarVinculo.innerHTML = '<i class="ph-bold ph-link"></i> Vincular Selecionados';
            btnConfirmarVinculo.disabled = false;
        }
    });

    // ==========================================
    // 4. SUPER MODAL DO VETERINÁRIO (Cadastro de Pet + Clínico)
    // ==========================================
    const modalPet = document.getElementById('modalPet');
    const selectTutor = document.getElementById('selectTutorNovoPet');
    const tabsBtn = document.querySelectorAll('.tab-btn');
    const tabDados = document.getElementById('tab-dados-pet');
    const tabHistorico = document.getElementById('tab-historico-clinico');

    const toggleModalPet = async () => {
        modalPet.classList.toggle('hidden');
        
        // Se o modal estiver sendo aberto, carregamos os tutores atualizados
        if (!modalPet.classList.contains('hidden')) {
            carregarTutoresNoSelect();
        }
    };

    document.getElementById('btnNovoPet')?.addEventListener('click', toggleModalPet);
    document.getElementById('fecharModal')?.addEventListener('click', toggleModalPet);
    document.getElementById('cancelarModal')?.addEventListener('click', toggleModalPet);

    // Sistema de Abas (Tabs)
    tabsBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Reseta cores
            tabsBtn.forEach(b => {
                b.classList.remove('text-primary', 'border-primary');
                b.classList.add('text-gray-500', 'border-transparent');
            });
            // Ativa botão clicado
            btn.classList.add('text-primary', 'border-primary');
            btn.classList.remove('text-gray-500', 'border-transparent');

            // Troca o conteúdo visível
            if (btn.getAttribute('data-tab') === 'dados-pet') {
                tabDados.classList.remove('hidden');
                tabHistorico.classList.add('hidden');
            } else {
                tabDados.classList.add('hidden');
                tabHistorico.classList.remove('hidden');
            }
        });
    });

    // Função para buscar a rota que já existe e popular o select
    async function carregarTutoresNoSelect() {
        const token = localStorage.getItem('auth-token-petto');
        try {
            const response = await fetch('/api/vet/tutores', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error();
            const tutores = await response.json();

            if (tutores.length === 0) {
                selectTutor.innerHTML = '<option value="" disabled selected>Nenhum tutor vinculado à sua clínica.</option>';
            } else {
                selectTutor.innerHTML = '<option value="" disabled selected>Selecione um tutor...</option>';
                tutores.forEach(t => {
                    // Mostra o nome, e se o tutor já tem pets ou não
                    selectTutor.innerHTML += `<option value="${t.id}">${t.nome} (Pets: ${t.total_pets})</option>`;
                });
            }
        } catch (error) {
            selectTutor.innerHTML = '<option value="" disabled selected>Erro ao carregar tutores</option>';
        }
    }

    // Enviar Formulário do "God Mode"
    document.getElementById('formSuperPet')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSalvar = document.getElementById('btnSalvarSuperPet');
        const token = localStorage.getItem('auth-token-petto');
        
        // Coleta Aba 1
        const payload = {
            id_tutor: document.getElementById('selectTutorNovoPet').value,
            nome: document.getElementById('novoPetNome').value,
            especie: document.getElementById('novoPetEspecie').value,
            raca: document.getElementById('novoPetRaca').value,
            idadeValor: document.getElementById('novoPetIdadeNum').value,
            idadeUnidade: document.getElementById('novoPetIdadeUnidade').value,
            peso: document.getElementById('novoPetPeso').value,
            sexo: document.getElementById('novoPetSexo').value,
            
            // Coleta Aba 2 (Arrays para caso você queira escalar depois)
            vacinas: [],
            medicamentos: [],
            prontuario_motivo: document.getElementById('histMotivo').value,
            prontuario_diagnostico: document.getElementById('histDiagnostico').value
        };

        // Verifica se a vacina foi preenchida
        const nomeVacina = document.getElementById('histVacinaNome').value;
        const dataVacina = document.getElementById('histVacinaData').value;
        if (nomeVacina) {
            payload.vacinas.push({ nome: nomeVacina, data_aplicacao: dataVacina || null });
        }

        btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Salvando...';
        btnSalvar.disabled = true;

        try {
            const response = await fetch('/api/vet/cadastro-pet-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Paciente Adicionado!', text: result.message, timer: 3000, showConfirmButton: false });
                toggleModalPet(); // Fecha modal
                document.getElementById('formSuperPet').reset(); // Limpa o formulário
                carregarPacientes(); // Recarrega a grid principal
            } else {
                if (typeof Swal !== 'undefined') Swal.fire('Atenção', result.message, 'warning');
            }
        } catch (error) {
            if (typeof Swal !== 'undefined') Swal.fire('Erro', 'Ocorreu um erro no cadastro.', 'error');
        } finally {
            btnSalvar.innerHTML = '<i class="ph-bold ph-floppy-disk"></i> Salvar Paciente na Base';
            btnSalvar.disabled = false;
        }
    });

// Função global para escopo de clique externa (Placeholder para futura edição)
window.editarPet = function (idPet) {
    console.log('Iniciando edição do pet ID:', idPet);
    };
});