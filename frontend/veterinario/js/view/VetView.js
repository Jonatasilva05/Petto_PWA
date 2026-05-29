export class VetView {
    constructor() {
        this.selectAgendamentoTutor = document.getElementById('agendamento-tutor');
        this.selectProntuarioTutor = document.getElementById('prontuario-tutor');
        this.metricPets = document.getElementById('metric-total-pets');
        this.metricTutores = document.getElementById('metric-total-tutores');
        this.metricConsultas = document.getElementById('metric-consultas-hoje');
        this.metricVacinas = document.getElementById('metric-vacinas-pendentes');
        this.consultasContainer = document.getElementById('consultas-hoje-container');

        // Referências dos Modais
        this.modalAgendamento = document.getElementById('modal-agendamento');
        this.modalProntuario = document.getElementById('modal-prontuario');

        this.selectAgendamento = document.getElementById('agendamento-pet');
        this.selectProntuario = document.getElementById('prontuario-pet');
    }

    // Atualiza os quatro cards de contadores no topo
    renderMetrics(metrics) {
        if (this.metricPets) this.metricPets.textContent = metrics.totalPets || 0;
        if (this.metricTutores) this.metricTutores.textContent = metrics.totalTutores || 0;
        if (this.metricConsultas) this.metricConsultas.textContent = metrics.consultasHoje || 0;
        if (this.metricVacinas) this.metricVacinas.textContent = metrics.vacinasPendentes || 0;
    }

    // Renderiza a lista de consultas do dia usando o layout Tailwind existente
    renderConsultasHoje(consultas) {
        if (!this.consultasContainer) return;
        this.consultasContainer.innerHTML = '';

        if (consultas.length === 0) {
            this.consultasContainer.innerHTML = `
                <div class="flex items-center justify-center h-full text-gray-500 text-sm">
                    Nenhuma consulta agendada para hoje.
                </div>
            `;
            return;
        }

        consultas.forEach(consulta => {
            const statusClass = consulta.status === 'Confirmada'
                ? 'bg-[#064e3b]/40 text-brand border border-[#064e3b]'
                : 'bg-[#1e3a8a]/40 text-blue-400 border border-[#1e3a8a]';

            const card = document.createElement('div');
            card.className = 'bg-dark-700 rounded-lg p-4 flex items-center justify-between';
            card.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-brand shrink-0">
                        <i class="ph ph-paw-print text-xl"></i>
                    </div>
                    <div>
                        <h4 class="text-white font-medium text-sm">${this.escapeHTML(consulta.pet_nome)}</h4>
                        <p class="text-gray-400 text-xs mt-0.5">${this.escapeHTML(consulta.tutor_nome)} • ${this.escapeHTML(consulta.veterinario_nome)}</p>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-1.5">
                    <span class="text-white font-medium text-sm">${consulta.hora}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-medium ${statusClass}">${this.escapeHTML(consulta.status)}</span>
                </div>
            `;
            this.consultasContainer.appendChild(card);
        });
    }

    // ==========================================
    // LÓGICA DOS MODAIS (ANIMAÇÃO)
    // ==========================================
    openModal(modalElement) {
        if (!modalElement) return;
        const panel = modalElement.querySelector('.glass-panel');

        // 1. Remove o display: none
        modalElement.classList.remove('hidden');

        // 2. Pequeno delay para o navegador registrar a mudança antes de animar
        setTimeout(() => {
            modalElement.classList.remove('opacity-0');
            panel.classList.remove('scale-95');
            panel.classList.add('scale-100');
        }, 10);
    }

    closeModal(modalElement) {
        if (!modalElement) return;
        const panel = modalElement.querySelector('.glass-panel');

        // 1. Inicia a animação de saída
        modalElement.classList.add('opacity-0');
        panel.classList.remove('scale-100');
        panel.classList.add('scale-95');

        // 2. Aguarda a transição do Tailwind (300ms) para dar display: none
        setTimeout(() => {
            modalElement.classList.add('hidden');
        }, 300);
    }

    // Renderiza a lista de Tutores únicos nos dropdowns principais
    renderTutoresSelects(tutores) {
        const defaultOption = '<option value="" disabled selected>Selecione o tutor...</option>';
        let optionsHtml = defaultOption;

        tutores.forEach(t => {
            optionsHtml += `<option value="${t.id}">${this.escapeHTML(t.nome)}</option>`;
        });

        if (this.selectAgendamentoTutor) this.selectAgendamentoTutor.innerHTML = optionsHtml;
        if (this.selectProntuarioTutor) this.selectProntuarioTutor.innerHTML = optionsHtml;
    }

    // Atualiza dinamicamente a lista de pets com base no tutor que foi escolhido
    renderPetsPorTutor(selectPetElement, pets) {
        let optionsHtml = '';

        if (pets.length === 0) {
            optionsHtml = '<option value="" disabled selected>Este tutor não tem pets cadastrados.</option>';
            selectPetElement.setAttribute('disabled', 'true');
        } else {
            optionsHtml = '<option value="" disabled selected>Selecione o paciente...</option>';
            pets.forEach(p => {
                optionsHtml += `<option value="${p.id_pet}">${this.escapeHTML(p.nome)} (${this.escapeHTML(p.raca)})</option>`;
            });
            selectPetElement.removeAttribute('disabled');
        }

        if (selectPetElement) selectPetElement.innerHTML = optionsHtml;
    }

    escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    }
}