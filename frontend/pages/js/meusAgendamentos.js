import { PetModel } from '../../js/models/PetModel.js';

class AgendamentoController {
    constructor() {
        this.currentDate = new Date();
        this.model = new PetModel();
        
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
            
            // Filtra e também ordena os agendamentos por data (mais antigos primeiro)
            this.agendamentos = todosAgendamentos
                .filter(a => a.id_pet == this.petId)
                .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
            
            this.renderCalendar();
            this.renderList(); // Renderiza a lista completa ao inicializar
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
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            const agendamento = this.agendamentos.find(a => {
                const dataBanco = new Date(a.data_hora).toISOString().split('T')[0];
                return dataBanco === dateStr;
            });

            if (agendamento) {
                div.classList.add('has-appointment');
                div.classList.add(agendamento.status === 'agendado' ? 'status-green' : 'status-red');
                
                // Passa o elemento clicado e a data para a função de destaque
                div.onclick = (e) => this.highlightAppointment(dateStr, e.currentTarget);
            }
            container.appendChild(div);
        }
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    // NOVO: Renderiza a lista com todos os agendamentos do pet
    renderList() {
        const listContainer = document.getElementById('appointments-list');
        listContainer.innerHTML = '';

        if (this.agendamentos.length === 0) {
            listContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; text-align: center;">Nenhuma consulta agendada para este pet.</p>';
            return;
        }

        this.agendamentos.forEach(agendamento => {
            const dataBanco = new Date(agendamento.data_hora);
            const dateStr = dataBanco.toISOString().split('T')[0];
            const dataFormatada = dataBanco.toLocaleString('pt-BR');
            
            const statusClass = agendamento.status === 'agendado' ? 'status-green-item' : 'status-red-item';
            
            const itemDiv = document.createElement('div');
            itemDiv.className = `appointment-item ${statusClass}`;
            // Adicionamos um atributo "data-date" para acharmos esse item depois
            itemDiv.setAttribute('data-date', dateStr); 
            
            itemDiv.innerHTML = `
                <div class="appointment-date">${dataFormatada}</div>
                <div class="appointment-status">Status: <strong>${agendamento.status.toUpperCase()}</strong></div>
            `;
            
            listContainer.appendChild(itemDiv);
        });
    }

    // MODIFICADO: Substitui o showDetails para destacar o item na lista
    highlightAppointment(dateStr, dayElement) {
        // 1. Limpa destaques anteriores da lista e do calendário
        document.querySelectorAll('.appointment-item').forEach(item => {
            item.classList.remove('highlighted');
        });
        document.querySelectorAll('.day').forEach(day => {
            day.classList.remove('selected-day');
        });

        // 2. Destaca o dia clicado no calendário
        if (dayElement) {
            dayElement.classList.add('selected-day');
        }

        // 3. Busca todos os itens da lista que têm essa exata data
        const itemsToHighlight = document.querySelectorAll(`.appointment-item[data-date="${dateStr}"]`);
        
        // 4. Aplica o efeito e rola a tela até a consulta
        if (itemsToHighlight.length > 0) {
            itemsToHighlight.forEach(item => item.classList.add('highlighted'));
            
            // Rola suavemente até o primeiro agendamento daquele dia na lista
            itemsToHighlight[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

new AgendamentoController();

// Como você está usando ES modules para importação do PetModel, exponha a troca de meses no escopo global para o HTML
window.AgendamentoControllerRef = new AgendamentoController();
document.getElementById('prev-month').onclick = () => window.AgendamentoControllerRef.changeMonth(-1);
document.getElementById('next-month').onclick = () => window.AgendamentoControllerRef.changeMonth(1);