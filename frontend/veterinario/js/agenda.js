import { VetModel } from './models/VetModel.js';
import { VetView } from './view/VetView.js';
import { VetController } from './controllers/VetController.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZAÇÃO MVC
    const app = new VetController(new VetModel(), new VetView());
    app.initDashboard();

    // 2. SEGURANÇA E TOKEN
    const token = localStorage.getItem('auth-token-petto');
    if (!token) {
        window.location.href = '../index.html';
        return;
    }

    // 3. CALENDÁRIO DINÂMICO PREMIUM
    function gerarCalendarioSemana() {
        const seletorDias = document.getElementById('seletor-dias');
        const mesAtualEl = document.getElementById('mes-atual');

        if (!seletorDias || !mesAtualEl) return;

        const diasNomes = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
        const mesesNomes = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        const hoje = new Date();
        mesAtualEl.textContent = `${mesesNomes[hoje.getMonth()]} ${hoje.getFullYear()}`;
        seletorDias.innerHTML = '';

        for (let i = -3; i <= 3; i++) {
            const dataCalculada = new Date(hoje);
            dataCalculada.setDate(hoje.getDate() + i);

            const diaSemana = diasNomes[dataCalculada.getDay()];
            const diaNumero = String(dataCalculada.getDate()).padStart(2, '0');

            let classes = 'day-picker';
            if (i === 0) classes += ' active';
            if (dataCalculada.getDay() === 0 || dataCalculada.getDay() === 6) classes += ' weekend';

            const html = `
                <div class="${classes}">
                    <span>${diaSemana}</span>
                    <span>${diaNumero}</span>
                </div>
            `;
            seletorDias.insertAdjacentHTML('beforeend', html);
        }
    }

    // 4. RENDERIZAÇÃO DA AGENDA COM SEPARADORES TEMPORAIS
    const containerAgenda = document.getElementById('lista-agendamentos');

    async function carregarAgenda() {
        if (!containerAgenda) return;

        containerAgenda.innerHTML = `
            <div class="text-center text-gray-400 py-12 flex flex-col items-center">
                <i class="ph-bold ph-spinner animate-spin text-4xl text-primary mb-3"></i>
                <p>Buscando sua agenda dos próximos 15 dias...</p>
            </div>
        `;

        try {
            const response = await fetch('/api/vet/agenda', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Falha ao conectar com a API.');

            const agendamentos = await response.json();
            renderizarAgendaComGrupos(agendamentos);

        } catch (error) {
            console.error("Erro na busca da agenda:", error);
            containerAgenda.innerHTML = `
                <div class="glass-panel rounded-3xl p-8 text-center border border-red-500/20">
                    <i class="ph-fill ph-warning-circle text-red-400 text-4xl mb-2"></i>
                    <p class="text-red-400 font-medium">Erro de conexão.</p>
                </div>
            `;
        }
    }

    function renderizarAgendaComGrupos(agendamentos) {
        containerAgenda.innerHTML = '';

        if (agendamentos.length === 0) {
            containerAgenda.innerHTML = `
                <div class="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-gray-500 border border-dark-border border-dashed">
                    <div class="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
                        <i class="ph-fill ph-calendar-blank text-3xl"></i>
                    </div>
                    <p class="text-white font-bold text-lg mt-1 text-center">Nenhuma consulta nos próximos 15 dias.</p>
                </div>
            `;
            return;
        }

        // Variáveis para ajudar a calcular os "baldes" de tempo (Zerando as horas para comparar apenas os dias)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const amanha = new Date(hoje);
        amanha.setDate(hoje.getDate() + 1);

        const daqui7Dias = new Date(hoje);
        daqui7Dias.setDate(hoje.getDate() + 7);

        const daqui15Dias = new Date(hoje);
        daqui15Dias.setDate(hoje.getDate() + 15);

        let grupoAtual = null;

        agendamentos.forEach(ag => {
            if (!ag.data_hora) return;

            const dataObj = new Date(ag.data_hora);
            const horaStr = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const dataStr = dataObj.toLocaleDateString('pt-BR');

            // Cria uma cópia da data da consulta e zera as horas para descobrir em qual "grupo" ela cai
            const dataConsulta = new Date(dataObj);
            dataConsulta.setHours(0, 0, 0, 0);

            let nomeDoGrupo = '';
            let iconeDoGrupo = '';

            // Classificação dos grupos
            if (dataConsulta.getTime() === hoje.getTime()) {
                nomeDoGrupo = 'Consultas de Hoje';
                iconeDoGrupo = 'ph-calendar-star';
            } else if (dataConsulta.getTime() === amanha.getTime()) {
                nomeDoGrupo = 'Consultas de Amanhã';
                iconeDoGrupo = 'ph-calendar-plus';
            } else if (dataConsulta > amanha && dataConsulta <= daqui7Dias) {
                nomeDoGrupo = 'Próximos 7 Dias';
                iconeDoGrupo = 'ph-calendar-blank';
            } else if (dataConsulta > daqui7Dias && dataConsulta <= daqui15Dias) {
                nomeDoGrupo = 'Próximos 15 Dias';
                iconeDoGrupo = 'ph-calendar-check';
            } else {
                return; // Se por acaso vier algo além de 15 dias, ignoramos na interface
            }

            // Se o grupo mudou, desenha a linha separadora ANTES de desenhar o cartão
            if (grupoAtual !== nomeDoGrupo) {
                grupoAtual = nomeDoGrupo;
                const separadorHTML = `
                    <div class="flex items-center gap-4 mt-8 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-dark-800 border border-dark-border shadow-md flex items-center justify-center text-primary">
                            <i class="ph-bold ${iconeDoGrupo} text-lg"></i>
                        </div>
                        <h4 class="text-sm font-bold text-gray-300 uppercase tracking-widest">${nomeDoGrupo}</h4>
                        <div class="flex-1 h-px bg-dark-border"></div>
                    </div>
                `;
                containerAgenda.insertAdjacentHTML('beforeend', separadorHTML);
            }

            // Define as cores do cartão com base no status (como já funcionava)
            let borderClass = 'border-l-blue-500';
            let textClass = 'text-blue-500';
            let badgeClass = 'badge-blue';
            let iconBadge = 'ph-clock';

            if (ag.status && ag.status.toLowerCase() === 'confirmada') {
                borderClass = 'border-l-primary';
                textClass = 'text-primary';
                badgeClass = 'badge-green';
                iconBadge = 'ph-check-circle';
            } else if (ag.status && (ag.status.toLowerCase() === 'pendente' || ag.status.toLowerCase() === 'atrasada')) {
                borderClass = 'border-l-yellow-500';
                textClass = 'text-yellow-500';
                badgeClass = 'badge-yellow';
                iconBadge = 'ph-warning-circle';
            }

            const fotoPet = ag.foto_url ? `..${ag.foto_url}` : 'https://placehold.co/100x100/151F25/00D09E?text=Pet';

            // Desenha o cartão da consulta
            const cardHTML = `
                <div class="glass-panel rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover border-l-4 ${borderClass} ml-2">
                    <div class="flex items-center gap-6">
                        <div class="text-center min-w-[80px]">
                            <h2 class="text-3xl font-bold ${textClass}">${horaStr}</h2>
                            <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-semibold">${dataStr}</p>
                        </div>
                        <div class="w-px h-16 bg-dark-border hidden md:block"></div>
                        <div class="flex items-center gap-4">
                            <img src="${fotoPet}" class="w-14 h-14 rounded-2xl object-cover border border-dark-border" onerror="this.src='https://placehold.co/100x100/151F25/00D09E?text=Pet'" />
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <h3 class="text-xl font-bold text-white">${escapeHTML(ag.pet_nome)}</h3>
                                    <span class="bg-dark-800 text-gray-400 text-[10px] px-2 py-0.5 rounded-md border border-dark-border">${escapeHTML(ag.raca) || 'Sem Raça'}</span>
                                </div>
                                <p class="text-sm text-gray-400"><i class="ph ph-user text-gray-500 mr-1"></i> ${escapeHTML(ag.tutor_nome) || 'Não vinculado'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col md:items-end gap-3">
                        <span class="badge ${badgeClass} w-fit"><i class="ph-fill ${iconBadge}"></i> ${escapeHTML(ag.status)}</span>
                        <div class="flex gap-2">
                            <button class="btn-action bg-dark-800 border border-dark-border hover:text-primary h-10 px-4 text-xs"><i class="ph ph-stethoscope"></i> Atender</button>
                        </div>
                    </div>
                </div>
            `;
            containerAgenda.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // Proteção contra XSS
    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    // 5. GATILHOS INICIAIS
    gerarCalendarioSemana();
    carregarAgenda();
});