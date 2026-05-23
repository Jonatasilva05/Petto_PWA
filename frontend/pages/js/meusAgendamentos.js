import { PetModel } from '../models/PetModel.js';

class AgendamentoController {
    constructor() {
        this.currentDate = new Date();
        this.model = new PetModel();
        // Captura o petId da URL
        const urlParams = new URLSearchParams(window.location.search);
        this.petId = urlParams.get('petId'); 
        this.init();
    }

    async init() {
        const todosAgendamentos = await this.fetchAgendamentos();
        // Filtra apenas para o pet selecionado
        this.agendamentos = todosAgendamentos.filter(a => a.id_pet == this.petId);
        this.renderCalendar();
    }

    async fetchAgendamentos() {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch('/api/agendamentos/usuario', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json(); 
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const container = document.getElementById('days-container');
        container.innerHTML = '';

        for (let i = 1; i <= lastDay; i++) {
            const div = document.createElement('div');
            div.className = 'day';
            div.textContent = i;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const agendamento = this.agendamentos.find(a => a.data_hora.startsWith(dateStr));

            if (agendamento) {
                div.classList.add('has-appointment');
                div.classList.add(agendamento.status === 'agendado' ? 'status-green' : 'status-red');
                div.onclick = () => this.showDetails(agendamento);
            }
            container.appendChild(div);
        }
    }

    showDetails(data) {
        const details = document.getElementById('appointment-details');
        details.style.display = 'block';
        document.getElementById('det-info').innerHTML = `
            <strong>Data:</strong> ${data.data_hora}<br>
            <strong>Status:</strong> ${data.status}
        `;
    }
}

new AgendamentoController();