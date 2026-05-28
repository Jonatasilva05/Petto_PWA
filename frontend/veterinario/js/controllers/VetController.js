export class VetController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.initBinds();
    }

    async initDashboard() {
        // 1. CARREGA O PERFIL (FOTO E NOME DR/DRA)
        await this.carregarPerfil();

        // 2. CARREGA AS MÉTRICAS E CONSULTAS
        try {
            const [metrics, consultas, pacientes] = await Promise.all([
                this.model.getDashboardMetrics(),
                this.model.getConsultasHoje(),
                this.model.fetchPacientes()
            ]);

            this.view.renderMetrics(metrics);
            this.view.renderConsultasHoje(consultas);
            this.view.renderPacientesSelects(pacientes);
        } catch (error) {
            console.error('Erro ao inicializar painel do veterinário:', error.message);
        }
    }

    // Lógica inteligente de Perfil
    async carregarPerfil() {
        const rawName = localStorage.getItem('user-name') || 'Veterinário';
        let formattedName = rawName;

        // Define Dr. ou Dra. baseado na última letra do primeiro nome ou em exceções
        if (!rawName.toLowerCase().startsWith('dr')) {
            const firstName = rawName.split(' ')[0].toLowerCase();
            const nomesFemininos = ['thais', 'beatriz', 'raquel', 'carol', 'aline', 'maria', 'ana', 'sabrina'];
            const isDra = firstName.endsWith('a') || nomesFemininos.includes(firstName);
            formattedName = (isDra ? 'Dra. ' : 'Dr. ') + rawName;
        }

        // Injeta o nome
        const vetGreeting = document.getElementById('vet-greeting-name');
        const vetProfile = document.getElementById('vet-profile-name');
        if (vetGreeting) vetGreeting.textContent = formattedName;
        if (vetProfile) vetProfile.textContent = formattedName;

        // Tenta puxar a foto do banco
        try {
            const perfil = await this.model.getPerfilVet();
            if (perfil && perfil.avatar_url) {
                const profileBtn = document.getElementById('btn-profile-menu');
                const iconContainer = profileBtn.querySelector('.bg-dark-950');
                if (iconContainer) {
                    iconContainer.innerHTML = `<img src="../uploads/perfil/${perfil.avatar_url}" class="w-full h-full object-cover rounded-xl" alt="Perfil">`;
                }
            }
        } catch (e) {
            console.warn('Foto de perfil não encontrada, usando inicial.');
            const iconContainer = document.querySelector('#btn-profile-menu .bg-dark-950');
            if (iconContainer) iconContainer.textContent = rawName.charAt(0).toUpperCase();
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

        // ==========================================
        // EVENTO: SALVAR NOVO AGENDAMENTO
        // ==========================================
        const formAgendamento = document.getElementById('form-agendamento');
        if (formAgendamento) {
            formAgendamento.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btnSalvar = document.getElementById('btn-salvar-agendamento');
                const textoOriginal = btnSalvar.innerHTML;
                btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Agendando...';
                btnSalvar.disabled = true;

                // Captura a data/hora e ajusta o formato (T -> espaço) para o MySQL
                let dataHoraInput = document.getElementById('agendamento-data').value;
                const payload = {
                    id_pet: document.getElementById('agendamento-pet').value,
                    data_hora: dataHoraInput.replace('T', ' ') + ':00'
                };

                try {
                    await this.model.salvarAgendamento(payload);
                    if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Agendado!', text: 'Consulta marcada com sucesso.', timer: 2000, showConfirmButton: false });

                    this.view.closeModal(this.view.modalAgendamento);
                    formAgendamento.reset();

                    // Recarrega o painel para a consulta aparecer na hora na lista
                    this.initDashboard();
                } catch (error) {
                    if (typeof Swal !== 'undefined') Swal.fire('Erro', error.message, 'error');
                } finally {
                    btnSalvar.innerHTML = textoOriginal;
                    btnSalvar.disabled = false;
                }
            });
        }

        // ==========================================
        // EVENTO: SALVAR PRONTUÁRIO (Mantido intacto)
        // ==========================================
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

        // ==========================================
        // AÇÕES RÁPIDAS (Navegação) E LOGOUT
        // ==========================================
        const btnsAcoesRapidas = document.querySelectorAll('.grid.grid-cols-2.gap-4 button');
        if (btnsAcoesRapidas.length >= 2) {
            // Botão "Novo Cadastro" vai para Pets
            btnsAcoesRapidas[0].addEventListener('click', () => window.location.href = 'pets.html');
            // Botão "Emitir Receita" vai para Prontuários
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
            btnLogout.addEventListener('click', () => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Sair da conta?', text: "Você precisará fazer login novamente.", icon: 'warning',
                        showCancelButton: true, confirmButtonColor: '#ff4d4d', cancelButtonColor: '#26343C',
                        confirmButtonText: 'Sim, sair', cancelButtonText: 'Cancelar', background: '#151F25', color: '#fff'
                    }).then((result) => { if (result.isConfirmed) executarLogout(); });
                } else {
                    if (confirm('Deseja realmente sair da conta?')) executarLogout();
                }

                function executarLogout() {
                    localStorage.removeItem('auth-token-petto');
                    localStorage.removeItem('user-role');
                    localStorage.removeItem('user-name');
                    window.location.href = '../index.html';
                }
            });
        }
    }
}   