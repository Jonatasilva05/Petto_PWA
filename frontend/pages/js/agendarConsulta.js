class AppointmentModel {
    constructor() {
        this.apiUrl = '/api';
    }

    async getPets() {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/pets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    }

    async getVeterinarios() {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/agendamentos/veterinarios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    }

    async salvarAgendamento(payload) {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch(`${this.apiUrl}/agendamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao processar agendamento.');
        return data;
    }
}

class AppointmentController {
    constructor(model) {
        this.model = model;
        this.currentDate = new Date();
        this.selectedDateStr = null;
        this.selectedTime = null;

        this.init();
    }

    async init() {
        // Inicializa elementos da UI
        document.getElementById('btn-back')?.addEventListener('click', () => window.history.back());
        document.getElementById('prev-month')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month')?.addEventListener('click', () => this.changeMonth(1));
        document.getElementById('btn-confirm-appointment')?.addEventListener('click', () => this.handleSubmit());

        this.setupTimeSlots();
        this.renderCalendar();
        
        // Alimenta os Selects do HTML puxando do banco
        await this.loadSelectData();
    }

    async loadSelectData() {
        try {
            const pets = await this.model.getPets();
            const petSelect = document.getElementById('select-pet');
            pets.forEach(pet => {
                const opt = document.createElement('option');
                opt.value = pet.id_pet;
                opt.textContent = pet.nome;
                petSelect.appendChild(opt);
            });

            const vets = await this.model.getVeterinarios();
            const vetSelect = document.getElementById('select-vet');
            vets.forEach(vet => {
                const opt = document.createElement('option');
                opt.value = vet.id_veterinario;
                opt.textContent = vet.nome_clinica ? `${vet.nome} (${vet.nome_clinica})` : vet.nome;
                vetSelect.appendChild(opt);
            });
        } catch (err) {
            console.error("Erro ao popular seletores:", err);
        }
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const mesesLabels = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        document.getElementById('month-display').textContent = `${mesesLabels[month]} ${year}`;

        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();

        const container = document.getElementById('days-container');
        container.innerHTML = '';

        // Dias do mês anterior (Muted)
        for (let x = firstDayIndex; x > 0; x--) {
            const div = document.createElement('div');
            div.className = 'day muted';
            div.textContent = prevLastDay - x + 1;
            container.appendChild(div);
        }

        // Dias do mês atual
        for (let i = 1; i <= lastDay; i++) {
            const div = document.createElement('div');
            div.className = 'day';
            div.textContent = i;

            // Formatação segura de data para o clique
            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            div.addEventListener('click', (e) => {
                document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                div.classList.add('selected');
                this.selectedDateStr = dayString;
            });

            container.appendChild(div);
        }
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    setupTimeSlots() {
        const slots = document.querySelectorAll('.time-slot');
        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                slots.forEach(s => s.classList.remove('active'));
                slot.classList.add('active');
                this.selectedTime = slot.getAttribute('data-time');
            });
        });
    }

    async handleSubmit() {
        const id_pet = document.getElementById('select-pet').value;
        const id_veterinario = document.getElementById('select-vet').value;

        if (!id_pet || !id_veterinario || !this.selectedDateStr || !this.selectedTime) {
            Swal.fire('Atenção', 'Por favor, preencha todos os campos, selecione o dia e o horário.', 'warning');
            return;
        }

        // Junta a data e o horário no formato padrão aceito pelo DATETIME do MySQL
        const data_hora = `${this.selectedDateStr} ${this.selectedTime}:00`;

        try {
            await this.model.salvarAgendamento({ id_pet, id_veterinario, data_hora });
            Swal.fire({
                title: 'Sucesso!',
                text: 'Sua consulta foi agendada com êxito!',
                icon: 'success',
                confirmButtonColor: '#4890F0'
            }).then(() => {
                window.location.href = '../dashboard.html'; // Retorna ao painel principal
            });
        } catch (error) {
            Swal.fire('Erro', error.message, 'error');
        }
    }
}

document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('auth-token-petto');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user-name');
    window.location.href = '../../index.html'; // Volta para a tela de login externa
});

// Inicializa a execução
const app = new AppointmentController(new AppointmentModel());