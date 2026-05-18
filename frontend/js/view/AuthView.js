export class AuthView {
    constructor() {
        this.sections = {
            login: document.getElementById('login-view'),
            register: document.getElementById('register-view'),
            tutor: document.getElementById('tutor-dashboard'),
            vet: document.getElementById('vet-dashboard'),
            pacienteDetail: document.getElementById('paciente-detail-view')
        };
        
        this.vetCheckbox = document.getElementById('reg-is-vet');
        this.vetFields = document.getElementById('vet-fields');
        this.toastContainer = document.getElementById('toast-container');
        this.btnRegFinal = document.getElementById('btn-register-final');   
        this.pacientesList = document.getElementById('pacientes-list-container');
        this.prontuarioList = document.getElementById('prontuario-list');
        
        this.initBinds();
        this.setupInputMasks();
        this.setupPasswordToggle('toggle-login-pass', 'login-password');
        this.setupPasswordToggle('toggle-reg-pass', 'reg-password');
    }

    initBinds() {
        document.getElementById('link-go-login')?.addEventListener('click', (e) => { 
            e.preventDefault(); this.switchScreen('login'); 
        });

        this.vetCheckbox?.addEventListener('change', (e) => {
            this.vetFields?.classList.toggle('show', e.target.checked);
            if(this.btnRegFinal) this.btnRegFinal.innerText = e.target.checked ? "Registrar Veterinário" : "Registrar";
        });
    }

    setupInputMasks() {
        const masks = {
            'reg-experiencia': (v) => v.replace(/\D/g, '').substring(0, 2),
            'reg-crmv': (v) => v.toUpperCase().substring(0, 9),
            'reg-cep': (v) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9),
            'reg-cpf': (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14)
        };

        Object.entries(masks).forEach(([id, fn]) => {
            document.getElementById(id)?.addEventListener('input', (e) => e.target.value = fn(e.target.value));
        });
    }

    setupPasswordToggle(btnId, inputId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (btn && input) {
            btn.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                btn.innerText = type === 'password' ? '👁️' : '🙈';
            });
        }
    }

    updatePasswordStrength(rulesMet) {
        const reqs = { len: '6-55 chars', up: 'Maiúscula', low: 'Minúscula', num: 'Número', spc: 'Especial' };
        Object.keys(rulesMet).forEach(k => {
            const el = document.getElementById(`req-${k}`);
            if (el) el.innerHTML = `${rulesMet[k] ? '✅' : '❌'} ${reqs[k]}`;
        });

        const score = Object.values(rulesMet).filter(Boolean).length;
        [1, 2, 3].forEach(i => {
            const bar = document.getElementById(`bar-${i}`);
            if (bar) bar.style.backgroundColor = score >= (i * 1.6) ? '#28a745' : '#eee';
        });
    }

    renderPacientes(pacientes, onPacienteClick) {
        if (!this.pacientesList) return;
        this.pacientesList.innerHTML = '';
        document.getElementById('vet-empty-state')?.classList.toggle('hidden', pacientes.length > 0);

        pacientes.forEach(p => {
            const card = document.createElement('div');
            card.className = 'paciente-card';
            card.innerHTML = `
                <img src="${p.foto_url ? p.foto_url : './assets/image/cachorro.png'}" class="pet-thumb">
                <div class="card-info"><strong>${p.nome}</strong><span>Tutor: ${p.nome_tutor}</span></div>
                <span class="chevron">❯</span>
            `;
            card.onclick = () => onPacienteClick(p.id_pet);
            this.pacientesList.appendChild(card);
        });
    }

    renderProntuario(data) {
        document.getElementById('detail-pet-name').innerText = data.nome;
        this.prontuarioList.innerHTML = data.prontuario.length === 0 ? '<p>Sem consultas.</p>' : '';
        data.prontuario.forEach(c => {
            const card = document.createElement('div');
            card.className = 'consulta-card';
            card.innerHTML = `<div class="consulta-header">📅 ${new Date(c.data_consulta).toLocaleDateString()}</div>
                              <p><strong>Motivo:</strong> ${c.motivo}</p>`;
            this.prontuarioList.appendChild(card);
        });
    }

    switchScreen(screenName) {
        Object.values(this.sections).forEach(sec => {
            if (sec) {
                sec.classList.remove('active');
                sec.classList.add('hidden');
            }
        });
        
        if (this.sections[screenName]) {
            this.sections[screenName].classList.remove('hidden');
            this.sections[screenName].classList.add('active');
        }
    }

    showToast(msg, type = 'success') {
        Swal.fire({
            text: msg,
            icon: type, // 'success' ou 'error'
            toast: true,
            position: 'top-end', // Fica no canto superior direito
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    setLoading(id, isL, txt = 'Entrar') {
        const b = document.getElementById(id);
        if (b) { b.innerHTML = isL ? '<div class="spinner"></div>' : txt; b.disabled = isL; }
    }

    getLoginData() { return { email: document.getElementById('login-email').value, senha: document.getElementById('login-password').value }; }
    
    getRegisterData() {
        const isVet = this.vetCheckbox.checked;
        
        return {
            nome: document.getElementById('reg-nome').value,
            email: document.getElementById('reg-email').value,
            senha: document.getElementById('reg-password').value,
            pet_primario: document.getElementById('reg-pet-primario').value,
            cor_favorita: document.getElementById('reg-cor-favorita').value,
            
            // O Node espera "role" ('veterinario' ou 'tutor') em vez de "isVet" (booleano)
            role: isVet ? 'veterinario' : 'tutor', 
            
            // Campos de Veterinário com as chaves exatas do authRoutes.js
            cpf: document.getElementById('reg-cpf').value,
            crmv: document.getElementById('reg-crmv').value,
            nome_clinica: document.getElementById('reg-clinica').value,
            tempo_experiencia: document.getElementById('reg-experiencia')?.value || null,
            cep_clinica: document.getElementById('reg-cep').value, // Alterado de 'cep'
            endereco: document.getElementById('reg-endereco').value,
            bairro_clinica: document.getElementById('reg-bairro').value, // Alterado de 'bairro'
            numero_clinica: document.getElementById('reg-numero').value // Alterado de 'numero'
        };
    }

    updateEmailStatus(val, msg) {
        const hint = document.getElementById('email-hint');
        if (hint) { hint.innerText = msg; hint.style.color = val ? 'green' : 'red'; }
    }

    fillAddress(end, bai) {
        document.getElementById('reg-endereco').value = end;
        document.getElementById('reg-bairro').value = bai;
    }

    setupDashboard(role, name) {
        const id = role === 'veterinario' ? 'vet-name-display' : 'tutor-name-display';
        const el = document.getElementById(id);
        if (el) el.innerText = name;
        this.switchScreen(role === 'veterinario' ? 'vet' : 'tutor');
    }

    bindLoginEvent(h) { document.getElementById('btn-login')?.addEventListener('click', h); }
    bindRegisterFinal(h) { this.btnRegFinal?.addEventListener('click', h); }
    bindPasswordInput(h) { document.getElementById('reg-password')?.addEventListener('input', h); }
    bindEmailInput(h) { document.getElementById('reg-email')?.addEventListener('blur', h); }
    bindCepInput(h) { document.getElementById('reg-cep')?.addEventListener('input', h); }
    bindLogouts(h) { ['btn-logout-tutor', 'btn-logout-vet'].forEach(id => document.getElementById(id)?.addEventListener('click', h)); }
}