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
            formAgendamento.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btnSalvar = document.getElementById('btn-salvar-agendamento') ;
                const textoOriginal = btnSalvar.innerHTML;
                btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Agendando...';
                btnSalvar.disabled = true;

                let dataHoraInput = document.getElementById('agendamento-data').value;
                // Dentro do seu initBinds() no VetController.js, onde captura o submit do form-agendamento:

                const payload = {
                    id_pet: document.getElementById('agendamento-pet').value,
                    data_hora: dataHoraInput.replace('T', ' ') + ':00',
                    vincular_tutor: document.getElementById('vincular-tutor').checked // Captura o estado do checkbox
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