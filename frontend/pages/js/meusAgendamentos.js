import { PetModel } from '../../js/models/PetModel.js';

class AgendamentoController {
    constructor() {
        this.currentDate = new Date();
        this.model = new PetModel();
        
        // Captura o petId da URL (ex: meusAgendamentos.html?petId=50)
        const urlParams = new URLSearchParams(window.location.search);
        this.petId = urlParams.get('petId');
        
        this.init();
    }

    async init() {
        if (!this.petId) {
            console.error("Pet não identificado.");
            return;
        }

        try {
        const todosAgendamentos = await this.fetchAgendamentos();
        console.log("Dados que chegaram do servidor:", todosAgendamentos);
        console.log("Pet ID vindo da URL:", this.petId);
        
        this.agendamentos = todosAgendamentos.filter(a => a.id_pet == this.petId);
        console.log("Agendamentos filtrados para este pet:", this.agendamentos);
        
        this.renderCalendar();
    } catch (error) {
        console.error("Erro na inicialização:", error);
    }
}

    async fetchAgendamentos() {
        const token = localStorage.getItem('auth-token-petto');
        const response = await fetch('/api/agendamentos/usuario', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Falha ao buscar agendamentos");
        return await response.json(); 
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const mesesLabels = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        document.getElementById('month-display').textContent = `${mesesLabels[month]} ${year}`;

        const lastDay = new Date(year, month + 1, 0).getDate();
        const container = document.getElementById('days-container');
        container.innerHTML = '';

        for (let i = 1; i <= lastDay; i++) {
            const div = document.createElement('div');
            div.className = 'day';
            div.textContent = i;
            
            // Formata a data para comparar com o formato ISO vindo do banco (YYYY-MM-DD)
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            // Verifica se existe agendamento para este dia específico
            const agendamento = this.agendamentos.find(a => {
                const dataBanco = new Date(a.data_hora).toISOString().split('T')[0];
                return dataBanco === dateStr;
            });

            if (agendamento) {
                div.classList.add('has-appointment');
                // Aplica a cor baseada no status: agendado = verde, caso contrário = vermelho
                div.classList.add(agendamento.status === 'agendado' ? 'status-green' : 'status-red');
                div.onclick = () => this.showDetails(agendamento);
            }
            container.appendChild(div);
        }
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    showDetails(data) {
        const details = document.getElementById('appointment-details');
        const detInfo = document.getElementById('det-info');
        
        if (details && detInfo) {
            details.style.display = 'block';
            // Formata a exibição da data e hora
            const dataFormatada = new Date(data.data_hora).toLocaleString('pt-BR');
            detInfo.innerHTML = `
                <strong>Data/Hora:</strong> ${dataFormatada}<br>
                <strong>Status:</strong> ${data.status.toUpperCase()}
            `;
        }
    }
}

// Inicializa o controlador
new AgendamentoController();