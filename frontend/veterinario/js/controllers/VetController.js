export class VetController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.pacientesRawData = [];
        this.initBinds();
    }

    // ==========================================
    // MÉTODOS DE CLASSE (Dinâmicos)
    // ==========================================

    atualizarLimitesData() {
        const agora = new Date();
        const agoraFormatado = agora.toISOString().slice(0, 16);
        const hoje = agora.toISOString().split('T')[0];

        const inputAgendamento = document.getElementById('agendamento-data');
        const inputProntuario = document.getElementById('prontuario-data');

        if (inputAgendamento) inputAgendamento.min = agoraFormatado;
        if (inputProntuario) inputProntuario.min = hoje;
    }

    validarData(dataInput, ehConsulta = false) {
        if (!dataInput) return false;
        const agora = new Date();
        const dataEscolhida = new Date(dataInput);

        // Se for prontuário, compara apenas os dias (zera as horas)
        if (!ehConsulta) {
            agora.setHours(0, 0, 0, 0);
            dataEscolhida.setHours(0, 0, 0, 0);
        }

        return dataEscolhida >= agora;
    }

    // ==========================================
    // INICIALIZAÇÃO DA TELA (Com Proteção Anti-Falha)
    // ==========================================

    async initDashboard() {
        await this.carregarPerfil();

        // Fazemos as requisições separadas para que o erro de uma não quebre o dashboard inteiro
        let metrics = { totalPets: 0, totalTutores: 0, consultasHoje: 0, vacinasPendentes: 0 };
        let consultas = [];
        let pacientes = [];

        try { metrics = await this.model.getDashboardMetrics(); }
        catch (e) { console.error('Falha nas métricas:', e); }

        try { consultas = await this.model.getConsultasHoje(); }
        catch (e) { console.error('Falha nas consultas:', e); }

        try { pacientes = await this.model.fetchPacientesGlobais(); }
        catch (e) { console.error('Falha nos pacientes globais:', e); }

        // Renderiza o que conseguiu baixar do servidor (restaura os números do topo)
        if (typeof this.view.renderMetrics === 'function') this.view.renderMetrics(metrics);
        if (typeof this.view.renderConsultasHoje === 'function') this.view.renderConsultasHoje(consultas);

        this.pacientesRawData = pacientes;

        // Monta os selects de Tutores
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

        this.configurarFiltroCascata();
    }

    async initProntuariosPage() {
        await this.carregarPerfil();

        try {
            // Busca os prontuários e renderiza
            const prontuarios = await this.model.getProntuariosList();
            if (typeof this.view.renderListaProntuarios === 'function') {
                this.view.renderListaProntuarios(prontuarios);
            }

            // Carrega tutores para o select do Modal
            const pacientes = await this.model.fetchPacientesGlobais();
            this.pacientesRawData = pacientes;

            const mapeamentoTutores = {};
            pacientes.forEach(p => {
                if (p.id_tutor) mapeamentoTutores[p.id_tutor] = { id: p.id_tutor, nome: p.tutor_nome };
            });

            if (typeof this.view.renderTutoresSelects === 'function') {
                this.view.renderTutoresSelects(Object.values(mapeamentoTutores));
            }

            this.configurarFiltroCascata();
        } catch (e) {
            console.error('Falha ao inicializar prontuários:', e);
        }
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

    // ==========================================
    // LISTENERS E EVENTOS DO DOM
    // ==========================================

    initBinds() {
        // --- CONTROLES DE MODAL ---
        const btnOpenAgendamento = document.getElementById('btn-open-agendamento');
        const btnCloseAgendamento = document.getElementById('btn-close-agendamento');
        const btnOpenProntuario = document.getElementById('btn-open-prontuario');
        const btnCloseProntuario = document.getElementById('btn-close-prontuario');

        if (btnOpenAgendamento) btnOpenAgendamento.addEventListener('click', () => {
            this.atualizarLimitesData();
            this.view.openModal(this.view.modalAgendamento);
        });
        if (btnCloseAgendamento) btnCloseAgendamento.addEventListener('click', (e) => { e.preventDefault(); this.view.closeModal(this.view.modalAgendamento); });

        if (btnOpenProntuario) btnOpenProntuario.addEventListener('click', () => {
            this.atualizarLimitesData();
            this.view.openModal(this.view.modalProntuario);
        });
        if (btnCloseProntuario) btnCloseProntuario.addEventListener('click', (e) => { e.preventDefault(); this.view.closeModal(this.view.modalProntuario); });

        // Dentro do seu VetController.js (no initBinds ou constructor)
        document.addEventListener("diagnostico-assistido-concluido", (e) => {
            // 1. Pega os elementos do DOM
            const inputDiagnostico = document.getElementById("prontuario-diagnostico");
            const inputMotivo = document.getElementById("prontuario-motivo");

            // 2. Preenche os campos
            if (inputDiagnostico) {
                inputDiagnostico.value = e.detail.diagnostico;
            }
            if (inputMotivo) {
                inputMotivo.value = e.detail.sintomas.join(", ");
            }

            console.log("Integração concluída com sucesso:", e.detail);
        });

        // --- SUBMIT: NOVO AGENDAMENTO ---
        const formAgendamento = document.getElementById('form-agendamento');
        if (formAgendamento) {
            formAgendamento.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Variáveis definidas corretamente dentro do escopo
                const btnSalvar = e.target.querySelector('button[type="submit"]');
                const textoOriginal = btnSalvar.innerHTML;

                const dataAgendamento = document.getElementById('agendamento-data').value;
                if (!this.validarData(dataAgendamento, true)) {
                    if (typeof Swal !== 'undefined') Swal.fire('Data Inválida', 'Não é possível agendar uma consulta para o passado.', 'warning');
                    return;
                }

                btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Agendando...';
                btnSalvar.disabled = true;

                const payload = {
                    id_pet: document.getElementById('agendamento-pet').value,
                    data_hora: dataAgendamento.replace('T', ' ') + ':00',
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

        // --- SUBMIT: PRONTUÁRIO ---
        const formProntuario = document.getElementById('form-prontuario');
        if (formProntuario) {
            formProntuario.addEventListener('submit', async (e) => {
                e.preventDefault();

                const btnSalvar = e.target.querySelector('button[type="submit"]');
                const textoOriginal = btnSalvar.innerHTML;

                const dataProntuario = document.getElementById('prontuario-data').value;
                if (!this.validarData(dataProntuario, false)) {
                    if (typeof window.Swal !== 'undefined') Swal.fire('Data Inválida', 'A data do prontuário não pode ser anterior a hoje.', 'warning');
                    return;
                }

                btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Salvando...';
                btnSalvar.disabled = true;

                const payload = {
                    id_pet: document.getElementById('prontuario-pet').value,
                    data_consulta: dataProntuario,
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

        // --- NAVEGAÇÃO E LOGOUT ---
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

        // --- SISTEMA DE BUSCA GLOBAL (Tempo Real) ---
        if (this.view.inputBusca) {
            this.view.inputBusca.addEventListener('input', (e) => {
                const termo = e.target.value.toLowerCase().trim();

                if (termo.length < 2) {
                    this.view.toggleDropdownBusca(false);
                    return;
                }

                if (!this.pacientesRawData) return;

                const resultados = this.pacientesRawData.filter(p => {
                    const nomePet = (p.pet_nome || '').toLowerCase();
                    const nomeTutor = (p.tutor_nome || '').toLowerCase();
                    return nomePet.includes(termo) || nomeTutor.includes(termo);
                });

                const topResultados = resultados.slice(0, 5);
                this.view.renderResultadosBusca(topResultados);
                this.view.toggleDropdownBusca(true);
            });

            document.addEventListener('click', (e) => {
                const searchContainer = document.getElementById('search-container');
                if (searchContainer && !searchContainer.contains(e.target)) {
                    this.view.toggleDropdownBusca(false);
                }
            });
        }

        // --- EVENTO: SALVAR SUPER PET (Se o modal existir nesta tela) ---
        const formSuperPet = document.getElementById('formSuperPet');
        if (formSuperPet) {
            formSuperPet.addEventListener('submit', async (e) => {
                e.preventDefault();

                const btnSalvar = document.getElementById('btnSalvarSuperPet');
                const textoOriginal = btnSalvar.innerHTML;

                btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Salvando...';
                btnSalvar.disabled = true;

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
                    medicamentos: [],
                    prontuario_motivo: document.getElementById('histMotivo').value,
                    prontuario_diagnostico: document.getElementById('histDiagnostico').value
                };

                const nomeVacina = document.getElementById('histVacinaNome').value;
                const dataVacina = document.getElementById('histVacinaData').value;
                if (nomeVacina && dataVacina) {
                    payload.vacinas.push({ nome: nomeVacina, data_aplicacao: dataVacina });
                }

                try {
                    await this.model.salvarSuperPet(payload);
                    if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Paciente Adicionado!', timer: 2000, showConfirmButton: false });

                    const modalPet = document.getElementById('modalPet');
                    if (modalPet) modalPet.classList.add('hidden');
                    formSuperPet.reset();

                    if (typeof this.initDashboard === 'function') await this.initDashboard();
                } catch (error) {
                    if (typeof Swal !== 'undefined') Swal.fire('Erro', error.message, 'warning');
                } finally {
                    btnSalvar.innerHTML = textoOriginal;
                    btnSalvar.disabled = false;
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
}