export class VetController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.initBinds(); // O construtor só inicia os cliques fixos. NADA MAIS.
    }

    async initDashboard() {
        await this.carregarPerfil();

        try {
            // Trocamos fetchPacientes pela nova rota global
            const [metrics, consultas, pacientes] = await Promise.all([
                this.model.getDashboardMetrics(),
                this.model.getConsultasHoje(),
                this.model.fetchPacientesGlobais() // Nova função que você criará no Model
            ]);

            // Renderizações Iniciais
            this.view.renderMetrics(metrics);
            this.view.renderConsultasHoje(consultas);

            // Guardamos os dados brutos recebidos da API
            this.pacientesRawData = pacientes;

            // Extraímos uma lista limpa e única de tutores
            const mapeamentoTutores = {};
            if (pacientes && pacientes.length > 0) {
                pacientes.forEach(p => {
                    if (p.id_tutor) {
                        mapeamentoTutores[p.id_tutor] = { id: p.id_tutor, nome: p.tutor_nome };
                    }
                });
            }
            const listagemTutoresUnicos = Object.values(mapeamentoTutores);

            if (typeof this.view.renderTutoresSelects === 'function') {
                this.view.renderTutoresSelects(listagemTutoresUnicos);
            }

            // Ativa o ouvinte de cascata (Quando mudar Tutor -> Filtra os Pets)
            this.configurarFiltroCascata();

        } catch (error) {
            console.error('Erro ao inicializar painel do veterinário:', error);
        }

        // Adicione isso no seu VetController.js para bloquear datas passadas no seletor
        const hoje = new Date().toISOString().split('T')[0];
        const agoraCompleto = new Date().toISOString().slice(0, 16); // Formato para datetime-local

        const inputAgendamento = document.getElementById('agendamento-data');
        const inputProntuario = document.getElementById('prontuario-data');

        if (inputAgendamento) inputAgendamento.min = agoraCompleto;
        if (inputProntuario) inputProntuario.min = hoje;
    }

    async carregarPerfil() {
        const rawName = localStorage.getItem('user-name') || 'Veterinário';
        let formattedName = rawName;

        if (!rawName.toLowerCase().startsWith('dr')) {
            const firstName = rawName.split(' ')[0].toLowerCase();
            const nomesFemininos = ['thais', 'beatriz', 'raquel', 'carol', 'aline', 'sabrina', 'stefani'];

            if (nomesFemininos.includes(firstName) || firstName.endsWith('a')) {
                formattedName = `Dra. ${rawName}`;
            } else {
                formattedName = `Dr. ${rawName}`;
            }
        }

        const displayEl = document.getElementById('vet-name-display');
        const vetGreeting = document.getElementById('vet-greeting-name');
        const vetProfile = document.getElementById('vet-profile-name');

        if (displayEl) displayEl.textContent = formattedName;
        if (vetGreeting) vetGreeting.textContent = formattedName;
        if (vetProfile) vetProfile.textContent = formattedName;

        // Tenta puxar a foto do banco
        try {
            const perfil = await this.model.getPerfilVet();
            if (perfil && perfil.avatar_url) {
                const profileBtn = document.getElementById('btn-profile-menu');
                const iconContainer = profileBtn?.querySelector('.bg-dark-950');
                if (iconContainer) {
                    iconContainer.innerHTML = `<img src="../uploads/perfil/${perfil.avatar_url}" class="w-full h-full object-cover rounded-xl" alt="Perfil">`;
                }
            }
        } catch (e) {
            console.warn('Foto de perfil não encontrada, usando inicial.');
        }
    }

    initBinds() {
        // Modais de Abertura/Fechamento
        const btnOpenAgendamento = document.getElementById('btn-open-agendamento');
        const btnCloseAgendamento = document.getElementById('btn-close-agendamento');
        const btnOpenProntuario = document.getElementById('btn-open-prontuario');
        const btnCloseProntuario = document.getElementById('btn-close-prontuario');

        if (btnOpenAgendamento) btnOpenAgendamento.addEventListener('click', () => this.view.openModal(this.view.modalAgendamento));
        if (btnCloseAgendamento) btnCloseAgendamento.addEventListener('click', (e) => { e.preventDefault(); this.view.closeModal(this.view.modalAgendamento); });

        if (btnOpenProntuario) btnOpenProntuario.addEventListener('click', () => this.view.openModal(this.view.modalProntuario));
        if (btnCloseProntuario) btnCloseProntuario.addEventListener('click', (e) => { e.preventDefault(); this.view.closeModal(this.view.modalProntuario); });

        // EVENTO: SALVAR NOVO AGENDAMENTO
        const formAgendamento = document.getElementById('form-agendamento');
        if (formAgendamento) {
            // --- EVENTO: SALVAR NOVO AGENDAMENTO ---
formAgendamento.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // VALIDAÇÃO: Apenas do formulário de agendamento
    const dataAgendamento = document.getElementById('agendamento-data').value;
    if (!this.validarData(dataAgendamento, true)) {
        Swal.fire('Data Inválida', 'Não é possível agendar uma consulta para o passado.', 'warning');
        return; 
    }

    const dataHoraInput = document.getElementById('agendamento-data').value;
    const payload = {
        id_pet: document.getElementById('agendamento-pet').value,
        data_hora: dataHoraInput.replace('T', ' ') + ':00',
        vincular_tutor: document.getElementById('vincular-tutor') ? document.getElementById('vincular-tutor').checked : false
    };

                try {
                    await this.model.salvarAgendamento(payload);
                    if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Agendado!', text: 'Consulta marcada com sucesso.', timer: 2000, showConfirmButton: false });

                    this.view.closeModal(this.view.modalAgendamento);
                    formAgendamento.reset();
                    this.initDashboard();
                } catch (error) {
                    if (typeof Swal !== 'undefined') Swal.fire('Erro', error.message, 'error');
                } finally {
                    btnSalvar.innerHTML = textoOriginal;
                    btnSalvar.disabled = false;
                }
            });
        }

        // EVENTO: SALVAR PRONTUÁRIO
        const formProntuario = document.getElementById('form-prontuario');
        if (formProntuario) {
            formProntuario.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btnSalvar = document.getElementById('btn-salvar-prontuario');
                const textoOriginal = btnSalvar.innerHTML;
                btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Salvando...';
                btnSalvar.disabled = true;

                const payload = {
                    id_pet: document.getElementById('prontuario-pet').value,
                    data_consulta: document.getElementById('prontuario-data').value,
                    motivo: document.getElementById('prontuario-motivo').value,
                    diagnostico: document.getElementById('prontuario-diagnostico').value,
                    tratamento: document.getElementById('prontuario-tratamento').value
                };

                try {
                    await this.model.salvarProntuario(payload);
                    if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Prontuário Salvo!', timer: 2000, showConfirmButton: false });
                    this.view.closeModal(this.view.modalProntuario);
                    formProntuario.reset();
                } catch (error) {
                    if (typeof Swal !== 'undefined') Swal.fire('Erro', error.message, 'error');
                } finally {
                    btnSalvar.innerHTML = textoOriginal;
                    btnSalvar.disabled = false;
                }
            });
        }

        // Ações Rápidas (Navegação) E Logout
        const btnsAcoesRapidas = document.querySelectorAll('.grid.grid-cols-2.gap-4 button');
        if (btnsAcoesRapidas.length >= 2) {
            btnsAcoesRapidas[0].addEventListener('click', () => window.location.href = 'pets.html');
            btnsAcoesRapidas[1].addEventListener('click', () => window.location.href = 'prontuarios.html');
        }

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
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const executarLogout = () => {
                    localStorage.removeItem('auth-token-petto');
                    localStorage.removeItem('user-role');
                    localStorage.removeItem('user-name');
                    window.location.href = '../index.html';
                };

                if (typeof window.Swal !== 'undefined') {
                    window.Swal.fire({
                        title: 'Sair da conta?',
                        text: "Você precisará fazer login novamente.",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ff4d4d',
                        cancelButtonColor: '#26343C',
                        confirmButtonText: 'Sim, sair',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) executarLogout();
                    });
                } else {
                    if (confirm('Deseja realmente sair da conta?')) executarLogout();
                }
            });
        }

        // ==========================================
        // EVENTO: SALVAR SUPER PET (CADASTRO + CLÍNICO)
        // ==========================================
        const formSuperPet = document.getElementById('formSuperPet');
        if (formSuperPet) {
            formSuperPet.addEventListener('submit', async (e) => {
                e.preventDefault();

                const btnSalvar = document.getElementById('btnSalvarSuperPet');
                const textoOriginal = btnSalvar.innerHTML;

                // Feedback visual e proteção contra duplo clique
                btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Salvando...';
                btnSalvar.disabled = true;

                // Monta o payload respeitando a estrutura do seu vetRoutes.js
                const payload = {
                    id_tutor: document.getElementById('selectTutorNovoPet').value,
                    nome: document.getElementById('novoPetNome').value,
                    especie: document.getElementById('novoPetEspecie').value,
                    raca: document.getElementById('novoPetRaca').value,
                    idadeValor: document.getElementById('novoPetIdadeNum').value,
                    idadeUnidade: document.getElementById('novoPetIdadeUnidade').value,
                    peso: document.getElementById('novoPetPeso').value,
                    sexo: document.getElementById('novoPetSexo').value,
                    vacinas: [],
                    medicamentos: [], // Opcional, mantido vazio se não houver no modal
                    prontuario_motivo: document.getElementById('histMotivo').value,
                    prontuario_diagnostico: document.getElementById('histDiagnostico').value
                };

                // Puxa a vacina retroativa caso tenha sido preenchida
                const nomeVacina = document.getElementById('histVacinaNome').value;
                const dataVacina = document.getElementById('histVacinaData').value;
                if (nomeVacina && dataVacina) {
                    payload.vacinas.push({
                        nome: nomeVacina,
                        data_aplicacao: dataVacina
                    });
                }

                try {
                    // Chama o Model para fazer o envio seguro
                    await this.model.salvarSuperPet(payload);

                    if (typeof Swal !== 'undefined') {
                        Swal.fire({ icon: 'success', title: 'Paciente Adicionado!', text: 'O pet e o histórico foram salvos na base.', timer: 2000, showConfirmButton: false });
                    }

                    // Fecha o modal e limpa o formulário
                    const modalPet = document.getElementById('modalPet');
                    if (modalPet) modalPet.classList.add('hidden');
                    formSuperPet.reset();

                    // Atualiza a tela de dashboard/pets para exibir o novo animal
                    if (typeof this.initDashboard === 'function') {
                        await this.initDashboard();
                    } else if (typeof window.carregarPacientes === 'function') {
                        window.carregarPacientes();
                    }

                } catch (error) {
                    if (typeof Swal !== 'undefined') Swal.fire('Erro', error.message, 'warning');
                } finally {
                    // Restaura o botão
                    btnSalvar.innerHTML = textoOriginal;
                    btnSalvar.disabled = false;
                }
            });
        }

        // ==========================================
        // SISTEMA DE BUSCA GLOBAL (Tempo Real)
        // ==========================================
        if (this.view.inputBusca) {
            this.view.inputBusca.addEventListener('input', (e) => {
                const termo = e.target.value.toLowerCase().trim();

                // Só busca se tiver pelo menos 2 caracteres
                if (termo.length < 2) {
                    this.view.toggleDropdownBusca(false);
                    return;
                }

                // Garante que os dados já foram carregados
                if (!this.pacientesRawData) return;

                // Filtra a base local verificando o nome do pet ou do tutor
                const resultados = this.pacientesRawData.filter(p => {
                    const nomePet = (p.pet_nome || '').toLowerCase();
                    const nomeTutor = (p.tutor_nome || '').toLowerCase();
                    return nomePet.includes(termo) || nomeTutor.includes(termo);
                });

                // Limita a 5 resultados para não quebrar o layout
                const topResultados = resultados.slice(0, 5);

                this.view.renderResultadosBusca(topResultados);
                this.view.toggleDropdownBusca(true);
            });

            // Fecha o dropdown se clicar fora da área de busca
            document.addEventListener('click', (e) => {
                const searchContainer = document.getElementById('search-container');
                if (searchContainer && !searchContainer.contains(e.target)) {
                    this.view.toggleDropdownBusca(false);
                }
            });
        }

        // ==========================================
        // EVENTO: BUSCAR E VINCULAR TUTOR (CPF / E-MAIL)
        // ==========================================
        const modalBuscaCPF = document.getElementById('modalBuscaCPF');
        const btnBuscarCPF = document.getElementById('btnBuscarCPF');
        const fecharModalCPF = document.getElementById('fecharModalCPF');
        const btnVoltarBusca = document.getElementById('btnVoltarBusca');

        const formBuscaTutor = document.getElementById('formBuscaTutor');
        const formVincularPets = document.getElementById('formVincularPets');
        const inputBusca = document.getElementById('inputBusca');
        const radiosTipoBusca = document.querySelectorAll('input[name="tipoBusca"]');

        // Função para fechar o modal com animação
        const closeCPFModal = () => {
            if (!modalBuscaCPF) return;
            const panel = modalBuscaCPF.querySelector('.shadow-card');
            if (panel) {
                panel.classList.remove('scale-100');
                panel.classList.add('opacity-0', 'scale-95');
            }
            setTimeout(() => modalBuscaCPF.classList.add('hidden'), 300);
        };

        // Eventos de Abertura e Fechamento
        if (btnBuscarCPF && modalBuscaCPF) {
            btnBuscarCPF.addEventListener('click', () => {
                formBuscaTutor.classList.remove('hidden');
                formVincularPets.classList.add('hidden');
                if (inputBusca) inputBusca.value = '';

                modalBuscaCPF.classList.remove('hidden');
                const panel = modalBuscaCPF.querySelector('.shadow-card');
                if (panel) {
                    setTimeout(() => {
                        panel.classList.remove('opacity-0', 'scale-95');
                        panel.classList.add('scale-100');
                    }, 10);
                }
            });
        }
        if (fecharModalCPF) fecharModalCPF.addEventListener('click', closeCPFModal);

        if (btnVoltarBusca) {
            btnVoltarBusca.addEventListener('click', () => {
                formBuscaTutor.classList.remove('hidden');
                formVincularPets.classList.add('hidden');
            });
        }

        // Eventos de Input (Placeholder dinâmico e Máscara de CPF)
        if (radiosTipoBusca) {
            radiosTipoBusca.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    inputBusca.value = '';
                    inputBusca.placeholder = e.target.value === 'cpf' ? 'Digite o CPF...' : 'Digite o E-mail...';
                    inputBusca.type = e.target.value === 'cpf' ? 'text' : 'email';
                });
            });
        }

        if (inputBusca) {
            inputBusca.addEventListener('input', function (e) {
                const tipoBusca = document.querySelector('input[name="tipoBusca"]:checked');
                if (tipoBusca && tipoBusca.value === 'cpf') {
                    let v = e.target.value.replace(/\D/g, '').substring(0, 11);
                    v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    e.target.value = v;
                }
            });
        }

        // Submit: Buscar Tutor
        if (formBuscaTutor) {
            formBuscaTutor.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btnBuscar = document.getElementById('btnBuscarTutor');
                const textoOriginal = btnBuscar.innerHTML;

                btnBuscar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Buscando...';
                btnBuscar.disabled = true;

                const tipo = document.querySelector('input[name="tipoBusca"]:checked').value;
                const termo = inputBusca.value;

                try {
                    const data = await this.model.buscarTutor(tipo, termo);

                    // Preenche a UI com os dados recebidos
                    document.getElementById('tutorIdSelecionado').value = data.tutor.id;
                    document.getElementById('resultadoTutorNome').textContent = data.tutor.nome;
                    document.getElementById('resultadoTutorDetalhe').textContent = `${data.tutor.email} ${data.tutor.cpf ? '• CPF: ' + data.tutor.cpf : ''}`;

                    const lista = document.getElementById('listaPetsResultado');
                    const btnConfirmar = document.getElementById('btnConfirmarVinculo');

                    if (data.pets.length === 0) {
                        lista.innerHTML = `<p class="text-sm text-gray-500 italic p-4 text-center">Nenhum pet cadastrado.</p>`;
                        btnConfirmar.disabled = true;
                    } else {
                        btnConfirmar.disabled = false;
                        lista.innerHTML = data.pets.map(p => `
                            <label class="flex items-center gap-3 p-3 bg-dark-900 border border-dark-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                                <input type="checkbox" name="petSelecionado" value="${p.id_pet}" class="w-5 h-5 accent-primary">
                                <div>
                                    <p class="text-white font-bold text-sm">${p.nome}</p>
                                    <p class="text-xs text-gray-400">${p.especie || 'Sem espécie'}</p>
                                </div>
                            </label>`).join('');
                    }

                    formBuscaTutor.classList.add('hidden');
                    formVincularPets.classList.remove('hidden');

                } catch (error) {
                    if (typeof Swal !== 'undefined') Swal.fire('Ops', error.message, 'warning');
                } finally {
                    btnBuscar.innerHTML = textoOriginal;
                    btnBuscar.disabled = false;
                }
            });
        }

        // Submit: Vincular os Pets selecionados
        if (formVincularPets) {
            formVincularPets.addEventListener('submit', async (e) => {
                e.preventDefault();

                const cbPets = document.querySelectorAll('input[name="petSelecionado"]:checked');
                const pets_ids = Array.from(cbPets).map(cb => cb.value);
                const id_tutor = document.getElementById('tutorIdSelecionado').value;

                if (pets_ids.length === 0) {
                    if (typeof Swal !== 'undefined') Swal.fire('Atenção', 'Selecione ao menos um pet para vincular.', 'warning');
                    return;
                }

                const btnConfirmar = document.getElementById('btnConfirmarVinculo');
                const textoOriginal = btnConfirmar.innerHTML;
                btnConfirmar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Vinculando...';
                btnConfirmar.disabled = true;

                try {
                    await this.model.vincularTutorPets(id_tutor, pets_ids);
                    if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Pronto!', text: 'Pacientes vinculados à sua base.', timer: 2000, showConfirmButton: false });

                    closeCPFModal();

                    // Atualiza a lista na tela
                    if (typeof this.initDashboard === 'function') {
                        await this.initDashboard();
                    } else if (typeof window.carregarPacientes === 'function') {
                        window.carregarPacientes();
                    }
                } catch (error) {
                    if (typeof Swal !== 'undefined') Swal.fire('Erro', error.message, 'error');
                } finally {
                    btnConfirmar.innerHTML = textoOriginal;
                    btnConfirmar.disabled = false;
                }
            });
        }
    }

    configurarFiltroCascata() {
        const tutorAgendamento = document.getElementById('agendamento-tutor');
        const tutorProntuario = document.getElementById('prontuario-tutor');

        if (tutorAgendamento) {
            tutorAgendamento.addEventListener('change', (e) => {
                const idTutorSelecionado = parseInt(e.target.value);
                if (!this.pacientesRawData) return;
                const petsFiltrados = this.pacientesRawData
                    .filter(p => p.id_tutor === idTutorSelecionado && p.id_pet !== null)
                    .map(p => ({ id_pet: p.id_pet, nome: p.pet_nome, raca: p.raca }));

                if (typeof this.view.renderPetsPorTutor === 'function') {
                    this.view.renderPetsPorTutor(this.view.selectAgendamento, petsFiltrados);
                }
            });
        }

        if (tutorProntuario) {
            tutorProntuario.addEventListener('change', (e) => {
                const idTutorSelecionado = parseInt(e.target.value);
                if (!this.pacientesRawData) return;
                const petsFiltrados = this.pacientesRawData
                    .filter(p => p.id_tutor === idTutorSelecionado && p.id_pet !== null)
                    .map(p => ({ id_pet: p.id_pet, nome: p.pet_nome, raca: p.raca }));

                if (typeof this.view.renderPetsPorTutor === 'function') {
                    this.view.renderPetsPorTutor(this.view.selectProntuario, petsFiltrados);
                }
            });
        }
    }

    // Adicione este método dentro da classe VetController
    validarData(dataInput, ehConsulta = false) {
        const agora = new Date();
        const dataEscolhida = new Date(dataInput);

        // Se for data pura (prontuário), comparamos apenas o dia (zerando horas)
        if (!ehConsulta) {
            agora.setHours(0, 0, 0, 0);
            dataEscolhida.setHours(0, 0, 0, 0);
        }

        return dataEscolhida >= agora;
    }
}