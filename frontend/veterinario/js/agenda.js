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

    // --- VARIÁVEIS DE CONTROLE DO CALENDÁRIO ---
    let mesOffset = 0; // 0 = Mês atual, 1 = Próximo mês...
    const MAX_MESES_FUTUROS = 3;
    let dataSelecionada = new Date();
    dataSelecionada.setHours(0, 0, 0, 0);

    // --- 3. CALENDÁRIO DINÂMICO (MENSAL) ---
    function gerarCalendarioMes() {
        const seletorDias = document.getElementById('seletor-dias');
        const mesAtualEl = document.getElementById('mes-atual');

        if (!seletorDias || !mesAtualEl) return;

        const mesesNomes = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const diasNomes = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

        // Calcula a data base do mês atual navegável
        const dataBase = new Date();
        dataBase.setDate(1); // Evita bugs em meses que não possuem dia 31
        dataBase.setMonth(dataBase.getMonth() + mesOffset);

        const ano = dataBase.getFullYear();
        const mes = dataBase.getMonth();

        mesAtualEl.textContent = `${mesesNomes[mes]} ${ano}`;
        seletorDias.innerHTML = '';

        // Quantidade de dias no mês selecionado
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        for (let i = 1; i <= diasNoMes; i++) {
            const dataAtual = new Date(ano, mes, i);
            dataAtual.setHours(0, 0, 0, 0);

            const diaSemana = diasNomes[dataAtual.getDay()];
            const diaNumero = String(i).padStart(2, '0');

            const isPast = dataAtual < hoje;
            const isSelected = dataAtual.getTime() === dataSelecionada.getTime();

            // Estilização dinâmica baseada no estado do dia
            let baseClasses = 'min-w-[64px] flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all border shrink-0 snap-center';

            if (isSelected) {
                // Dia selecionado (clicado) - Destaque Principal
                baseClasses += ' bg-primary text-dark-950 font-bold border-primary shadow-lg shadow-primary/20';
            } else if (isPast) {
                // Dia no passado: Fica "apagado" mas permite clique para ver o histórico
                baseClasses += ' bg-dark-800/30 text-gray-500 border-transparent opacity-50 hover:opacity-100 hover:bg-dark-800';
            } else {
                // Dia no futuro ou hoje: Visual Normal
                baseClasses += ' bg-dark-800 text-gray-300 border-dark-border hover:border-primary/50';
            }

            const textSemana = isSelected ? 'text-dark-900' : (isPast ? 'text-gray-600' : 'text-gray-400 font-medium');

            const div = document.createElement('div');
            div.className = baseClasses;
            div.innerHTML = `
                <span class="text-[10px] uppercase tracking-widest ${textSemana}">${diaSemana}</span>
                <span class="text-xl mt-1">${diaNumero}</span>
            `;

            // Evento de clique para escolher o dia (passado ou futuro) corrigido
            div.addEventListener('click', () => {
                dataSelecionada = new Date(dataAtual);
                gerarCalendarioMes(); // Renderiza novamente para aplicar a cor do clique
                carregarAgendaDoDiaSelecionado(); // Dispara a busca no backend
            });

            seletorDias.appendChild(div);

            // Se for o dia selecionado, rola o container horizontal automaticamente até ele
            if (isSelected) {
                setTimeout(() => div.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), 50);
            }
        }
    }

    // --- CONTROLES DE NAVEGAÇÃO DOS MESES ---
    function configurarBotoesMes() {
        const botoes = document.querySelectorAll('.calendar-header button');
        const btnVoltar = botoes[0];
        const btnAvancar = botoes[1];

        if (btnVoltar) {
            btnVoltar.addEventListener('click', () => {
                // Permite voltar meses passados livremente para ver o histórico
                mesOffset--;
                gerarCalendarioMes();
                atualizarEstadoBotoes(btnAvancar);
            });
        }

        if (btnAvancar) {
            btnAvancar.addEventListener('click', () => {
                // Bloqueia se tentar avançar mais que 3 meses no futuro
                if (mesOffset < MAX_MESES_FUTUROS) {
                    mesOffset++;
                    gerarCalendarioMes();
                    atualizarEstadoBotoes(btnAvancar);
                }
            });
        }
    }

    function atualizarEstadoBotoes(btnAvancar) {
        if (mesOffset >= MAX_MESES_FUTUROS) {
            btnAvancar.classList.add('opacity-30', 'cursor-not-allowed');
            btnAvancar.disabled = true;
        } else {
            btnAvancar.classList.remove('opacity-30', 'cursor-not-allowed');
            btnAvancar.disabled = false;
        }
    }

    // --- 4. RENDERIZAÇÃO DA AGENDA DO DIA ESPECÍFICO ---
    const containerAgenda = document.getElementById('lista-agendamentos');

    async function carregarAgendaDoDiaSelecionado() {
        if (!containerAgenda) return;

        containerAgenda.innerHTML = `
            <div class="text-center text-gray-400 py-12 flex flex-col items-center">
                <i class="ph-bold ph-spinner animate-spin text-4xl text-primary mb-3"></i>
                <p>Buscando agenda da data selecionada...</p>
            </div>
        `;

        try {
            // Formata a data escolhida para o padrão YYYY-MM-DD
            const dataFormatada = dataSelecionada.toISOString().split('T')[0];

            const response = await fetch(`/api/vet/agenda?data=${dataFormatada}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Falha ao conectar com a API.');

            const agendamentos = await response.json();
            renderizarAgendaDoDia(agendamentos);

        } catch (error) {
            console.error("Erro na busca da agenda:", error);
            containerAgenda.innerHTML = `
                <div class="glass-panel rounded-3xl p-8 text-center border border-red-500/20">
                    <i class="ph-fill ph-warning-circle text-red-400 text-4xl mb-2"></i>
                    <p class="text-red-400 font-medium">Erro de conexão com o servidor.</p>
                </div>
            `;
        }
    }

    function renderizarAgendaDoDia(agendamentos) {
        containerAgenda.innerHTML = '';

        if (agendamentos.length === 0) {
            containerAgenda.innerHTML = `
                <div class="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-gray-500 border border-dark-border border-dashed">
                    <div class="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
                        <i class="ph-fill ph-calendar-blank text-3xl"></i>
                    </div>
                    <p class="text-white font-bold text-lg mt-1 text-center">Nenhuma consulta encontrada para esta data.</p>
                </div>
            `;
            return;
        }

        // Título dinâmico baseado se é passado, hoje ou futuro
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        let tituloLista = 'Consultas Agendadas';
        let iconeLista = 'ph-calendar-check';

        if (dataSelecionada.getTime() === hoje.getTime()) {
            tituloLista = 'Consultas de Hoje';
            iconeLista = 'ph-calendar-star';
        } else if (dataSelecionada < hoje) {
            tituloLista = 'Histórico de Consultas';
            iconeLista = 'ph-clock-counter-clockwise';
        }

        containerAgenda.innerHTML = `
            <div class="flex items-center gap-4 mt-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-dark-800 border border-dark-border shadow-md flex items-center justify-center text-primary">
                    <i class="ph-bold ${iconeLista} text-lg"></i>
                </div>
                <h4 class="text-sm font-bold text-gray-300 uppercase tracking-widest">${tituloLista}</h4>
                <div class="flex-1 h-px bg-dark-border"></div>
            </div>
        `;

        agendamentos.forEach(ag => {
            if (!ag.data_hora) return;

            const dataObj = new Date(ag.data_hora);
            const horaStr = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const dataStr = dataObj.toLocaleDateString('pt-BR');

            // Define as cores do cartão com base no status
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

            const cardHTML = `
                <div class="glass-panel rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover border-l-4 ${borderClass} ml-2 mb-4">
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

    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    // --- 5. GATILHOS INICIAIS ---
    configurarBotoesMes();
    gerarCalendarioMes();
    carregarAgendaDoDiaSelecionado();
}); 