export class AuthController {
    constructor(model, view, petController) { // Recebe o petController
        this.model = model;
        this.view = view;
        this.petController = petController; // Guarda a referência

        this.view.bindLoginEvent(this.handleLogin.bind(this));  
        this.view.bindRegisterFinal(this.handleRegisterSubmit.bind(this));
        this.view.bindCepInput(this.handleCepCheck.bind(this));
        this.view.bindPasswordInput(this.handlePasswordCheck.bind(this));
        this.view.bindEmailInput(this.handleEmailCheck.bind(this));
        this.view.bindLogouts(this.handleLogout.bind(this));

        this.checkSession();
    }

    async checkSession() {
        if (this.model.isLoggedIn()) {
            const role = localStorage.getItem('user-role');
            
            // Verifica se o usuário já está dentro da pasta /pages/
            const isInsidePages = window.location.pathname.includes('/pages/');
            const dashPath = isInsidePages ? './dashboard.html' : './pages/dashboard.html';

            // O utilizador já está logado! Redireciona para o dashboard
            if (role === 'tutor' || role === 'veterinario') {
                if (!window.location.pathname.includes('dashboard.html')) {
                    window.location.href = dashPath; 
                }
            }
        } else {
            // NÃO ESTÁ LOGADO!
            // Só esconde tudo e tenta mostrar o login SE a tela de login existir neste HTML
            if (this.view.sections.login) {
                this.view.switchScreen('login');
            }
        }
    }
    

    handleLogout() {
        this.model.logout();
        this.view.switchScreen('login');
        this.view.showToast('Sessão encerrada.', 'success');
    }

    async handleLogin() {
        const { email, senha } = this.view.getLoginData();
        if (!email || !senha) return this.view.showToast('Campos obrigatórios!', 'error');

        this.view.setLoading('btn-login', true);
        try {
            const data = await this.model.login(email, senha);
            const userName = localStorage.getItem('user-name');
            
            // Mostra o aviso
            this.view.showToast(`Olá, ${userName}!`, 'success');
            
            // Segura o redirecionamento por 1 segundo (1000 milissegundos) para dar tempo de ver o Toast
            setTimeout(async () => {
                if (data.role === 'tutor') {
                    window.location.href = './pages/carregamento.html'; 
                } else if (data.role === 'veterinario') {
                    this.view.setupDashboard(data.role, userName);
                    await this.loadVetDashboard();
                }
            }, 1000);

        } catch (e) {
            this.view.showToast(e.message, 'error');
        } finally {
            this.view.setLoading('btn-login', false);
        }
    }
    
    async loadVetDashboard() {
        this.view.switchScreen('vet');
        try {
            const pacientes = await this.model.fetchPacientes();
            this.view.renderPacientes(pacientes, (id) => this.viewPacienteProntuario(id));
        } catch (e) { this.view.showToast('Erro ao carregar pacientes', 'error'); }
    }

    async viewPacienteProntuario(petId) {
        this.view.switchScreen('pacienteDetail');
        try {
            const data = await this.model.fetchPacienteDetail(petId);
            this.view.renderProntuario(data);
        } catch (e) { this.view.showToast('Erro no prontuário', 'error'); }
    }

    async handleEmailCheck(event) {
        const email = event.target.value.trim();
        if (!email || !email.includes('@')) return this.view.updateEmailStatus(false, 'E-mail inválido');
        try {
            await this.model.checkEmail(email);
            this.view.updateEmailStatus(true, 'Disponível');
        } catch (e) { this.view.updateEmailStatus(false, 'Já cadastrado'); }
    }

    handlePasswordCheck(event) {
        const p = event.target.value;
        const rules = {
            len: p.length >= 6 && p.length <= 55,
            up: /[A-Z]/.test(p),
            low: /[a-z]/.test(p),
            num: /\d/.test(p),
            spc: /[@$!%*?&#]/.test(p)
        };
        this.view.updatePasswordStrength(rules);
        return Object.values(rules).every(Boolean);
    }

    async handleCepCheck(event) {
        const cep = event.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const d = await this.model.buscarCep(cep);
                this.view.fillAddress(d.logradouro, d.bairro);
            } catch (e) { this.view.showToast('CEP inválido', 'error'); }
        }
    }

    async handleRegisterSubmit() {
        const data = this.view.getRegisterData();
        const btnId = 'btn-register-final';
        const txt = data.isVet ? 'Registrar Veterinário' : 'Registrar';

        this.view.setLoading(btnId, true);
        try {
            await this.model.cadastrar(data);
            this.view.showToast('Sucesso! Faça login.', 'success');
            this.view.switchScreen('login');
        } catch (e) {
            this.view.showToast(e.message, 'error');
        } finally {
            this.view.setLoading(btnId, false, txt);
        }
    }
}