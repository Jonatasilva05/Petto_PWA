// Variáveis Globais de Dados
let SINTOMAS = [];
let DOENCAS = [];

// Função para inicializar o módulo carregando o JSON
async function initDiagnosticoModule() {
    try {
        // Ajuste o caminho se necessário (ex: './data/databaseSintomas.json')
        const response = await fetch('../data/databaseSintomas.json'); 
        const data = await response.json();
        SINTOMAS = data.sintomas;
        DOENCAS = data.doencas;
        console.log("Banco de sintomas carregado com sucesso.");
    } catch (err) {
        console.error("Erro ao carregar banco de sintomas:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await initDiagnosticoModule();

    const ESPECIES = [
        { value: "cachorro", label: "Cachorro", icon: "🐶" },
        { value: "gato", label: "Gato", icon: "🐱" },
        { value: "coelho", label: "Coelho", icon: "🐰" },
        { value: "passaro", label: "Pássaro", icon: "🦜" },
        { value: "roedor", label: "Roedor", icon: "🐹" },
        { value: "reptil", label: "Réptil", icon: "🦎" },
        { value: "tartaruga", label: "Tartaruga", icon: "🐢" },
        { value: "furao", label: "Furão", icon: "🦦" },
    ];

    let state = { step: 1, especie: null, sintomasSelecionados: new Set(), doencaSelecionada: null, diagnosticoTexto: "" };

    // Funções internas (agora dentro do escopo correto)
    function getSintomasByEspecie(especie) { 
        return SINTOMAS.filter(s => s.especies.includes(especie)); 
    }

    function calcularDoencasSugeridas(especie, sintomaIds) {
        const mapa = {};
        const selecionados = SINTOMAS.filter(s => sintomaIds.has(s.id));
        selecionados.forEach(sint => {
            sint.doencas_associadas.forEach(d => {
                if (!mapa[d]) mapa[d] = { nome: d, count: 0, sintomas_match: [] };
                mapa[d].count++;
                mapa[d].sintomas_match.push(sint.label);
            });
        });
        return Object.values(mapa).sort((a, b) => b.count - a.count).slice(0, 12);
    }

    function updateStepIndicator(currentStep) {
        for (let i = 1; i <= 4; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (!dot) continue;
            dot.className = "step-dot";
            if (i < currentStep) dot.classList.add("done");
            else if (i === currentStep) dot.classList.add("active");
        }
        for (let i = 1; i <= 3; i++) {
            const line = document.getElementById(`line-${i}-${i+1}`);
            if (!line) continue;
            line.className = "step-line";
            if (i < currentStep) line.classList.add("done");
        }
    }

    function goToStep(n) {
        for (let i = 1; i <= 4; i++) {
            const el = document.getElementById(`step-${i}`);
            if (el) el.classList.add("hidden");
        }
        const stepEl = document.getElementById(`step-${n}`);
        if (stepEl) {
            stepEl.classList.remove("hidden");
            stepEl.classList.add("fade-in");
        }
        updateStepIndicator(n);
        state.step = n;
    }

    function renderStep1() {
        const grid = document.getElementById("especies-grid");
        if (!grid) return;
        grid.innerHTML = ESPECIES.map(e => `
            <button class="species-btn ${state.especie === e.value ? 'selected' : ''}" data-especie="${e.value}">
                <span class="species-icon">${e.icon}</span><span>${e.label}</span>
            </button>`).join("");

        grid.querySelectorAll(".species-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                state.especie = btn.dataset.especie;
                state.sintomasSelecionados.clear();
                state.doencaSelecionada = null;
                grid.querySelectorAll(".species-btn").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                const btnNext = document.getElementById("btn-step1-next");
                if (btnNext) btnNext.disabled = false;
            });
        });
    }

    function renderStep2(filterText = "") {
        const sintomas = getSintomasByEspecie(state.especie);
        const texto = filterText.toLowerCase().trim();
        const filtrados = texto ? sintomas.filter(s => s.label.toLowerCase().includes(texto) || s.categoria.toLowerCase().includes(texto)) : sintomas;
        const categorias = {};
        filtrados.forEach(s => { if (!categorias[s.categoria]) categorias[s.categoria] = []; categorias[s.categoria].push(s); });

        const lista = document.getElementById("sintomas-lista");
        if (!lista) return;

        lista.innerHTML = Object.entries(categorias).map(([cat, items]) => `
            <div>
                <div class="categoria-header">${cat}</div>
                ${items.map(s => `
                    <label class="sintoma-check ${state.sintomasSelecionados.has(s.id) ? 'checked' : ''}" data-id="${s.id}">
                        <input type="checkbox" ${state.sintomasSelecionados.has(s.id) ? 'checked' : ''} />
                        <span class="check-box"><span class="check-icon">✓</span></span>
                        <span class="sintoma-label">${s.label}</span>
                    </label>`).join("")}
            </div>`).join("");

        lista.querySelectorAll(".sintoma-check").forEach(el => {
            el.addEventListener("click", () => {
                const id = el.dataset.id;
                state.sintomasSelecionados.has(id) ? state.sintomasSelecionados.delete(id) : state.sintomasSelecionados.add(id);
                el.classList.toggle("checked");
                updateCountAndTags();
            });
        });
        updateCountAndTags();
    }

    function updateCountAndTags() {
        const count = state.sintomasSelecionados.size;
        const countEl = document.getElementById("count-sintomas");
        if (countEl) countEl.textContent = `${count} selecionado${count !== 1 ? 's' : ''}`;
        
        const btnNext = document.getElementById("btn-step2-next");
        if (btnNext) btnNext.disabled = count === 0;

        const tagsContainer = document.getElementById("tags-container");
        if (!tagsContainer) return;

        if (count > 0) {
            tagsContainer.classList.remove("hidden");
            tagsContainer.innerHTML = [...state.sintomasSelecionados].map(id => {
                const s = SINTOMAS.find(x => x.id === id);
                return s ? `<span class="tag-sintoma">${s.label.substring(0, 30)}${s.label.length > 30 ? '…' : ''} <button class="btn-remove-sintoma" data-id="${id}">×</button></span>` : '';
            }).join("");
            tagsContainer.querySelectorAll('.btn-remove-sintoma').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    state.sintomasSelecionados.delete(e.target.dataset.id);
                    renderStep2(document.getElementById("search-sintomas")?.value || "");
                });
            });
        } else {
            tagsContainer.classList.add("hidden");
        }
    }

    function renderStep3() {
        const sugestoes = calcularDoencasSugeridas(state.especie, state.sintomasSelecionados);
        const maxCount = sugestoes[0]?.count || 1;
        const container = document.getElementById("doencas-sugeridas");
        if (!container) return;

        container.innerHTML = sugestoes.map((d, i) => {
            const pct = Math.round((d.count / maxCount) * 100);
            return `
            <div class="doenca-card ${state.doencaSelecionada === d.nome ? 'selected' : ''}" data-doenca="${d.nome}">
                <div class="w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 mt-0.5">${i+1}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-1">
                        <span class="text-sm font-semibold text-white leading-tight">${d.nome}</span>
                        <span class="text-xs text-primary font-bold flex-shrink-0">${pct}%</span>
                    </div>
                    <div class="match-bar-bg mb-2"><div class="match-bar-fill" style="width:${pct}%"></div></div>
                </div>
            </div>`;
        }).join("");

        container.querySelectorAll(".doenca-card").forEach(el => {
            el.addEventListener("click", () => {
                const nome = el.dataset.doenca;
                if (state.doencaSelecionada === nome) {
                    state.doencaSelecionada = null; el.classList.remove("selected");
                } else {
                    state.doencaSelecionada = nome;
                    container.querySelectorAll(".doenca-card").forEach(c => c.classList.remove("selected"));
                    el.classList.add("selected");
                }
            });
        });
    }

    function renderStep4() {
        const resumo = document.getElementById("resumo-sintomas");
        if(resumo) {
            resumo.innerHTML = [...state.sintomasSelecionados].map(id => {
                const s = SINTOMAS.find(x => x.id === id);
                return s ? `<span class="tag-sintoma">${s.label}</span>` : '';
            }).join("") || '<span class="text-gray-600 text-xs">Nenhum sintoma selecionado</span>';
        }

        const campo = document.getElementById("campo-diagnostico");
        if (campo) {
            if (state.doencaSelecionada) {
                campo.value = state.doencaSelecionada;
            } else {
                campo.value = state.diagnosticoTexto || "";
            }
        }
    }

    // Bindings de Eventos
    document.getElementById("btn-abrir-diagnostico")?.addEventListener("click", () => {
        document.getElementById("modal-diagnostico")?.classList.add("open");
        renderStep1(); goToStep(1);
    });

    document.getElementById("btn-close-modal-diag")?.addEventListener("click", () => {
        document.getElementById("modal-diagnostico")?.classList.remove("open");
    });

    document.getElementById("btn-step1-next")?.addEventListener("click", () => { renderStep2(); goToStep(2); });
    document.getElementById("btn-step2-back")?.addEventListener("click", () => { renderStep1(); goToStep(1); });
    document.getElementById("btn-step2-next")?.addEventListener("click", () => { renderStep3(); goToStep(3); });
    document.getElementById("btn-step3-back")?.addEventListener("click", () => { renderStep2(); goToStep(2); });
    document.getElementById("btn-step3-next")?.addEventListener("click", () => { renderStep4(); goToStep(4); });
    document.getElementById("btn-step4-back")?.addEventListener("click", () => { renderStep3(); goToStep(3); });

    document.getElementById("search-sintomas")?.addEventListener("input", (e) => renderStep2(e.target.value));
    
    document.getElementById("campo-diagnostico")?.addEventListener("input", (e) => {
        state.diagnosticoTexto = e.target.value;
    });

    document.getElementById("btn-finalizar-diag")?.addEventListener("click", () => {
        const diag = document.getElementById("campo-diagnostico")?.value || "";
        const sintomasNomes = [...state.sintomasSelecionados].map(id => SINTOMAS.find(x => x.id === id)?.label).filter(Boolean);
        
        const evento = new CustomEvent("diagnostico-assistido-concluido", {
            detail: { diagnostico: diag, sintomas: sintomasNomes }
        });
        document.dispatchEvent(evento);
        document.getElementById("modal-diagnostico")?.classList.remove("open");
    });
});

const ESPECIES = [
    { value: "cachorro", label: "Cachorro", icon: "🐶" },
    { value: "gato", label: "Gato", icon: "🐱" },
    { value: "coelho", label: "Coelho", icon: "🐰" },
    { value: "passaro", label: "Pássaro", icon: "🦜" },
    { value: "roedor", label: "Roedor", icon: "🐹" },
    { value: "reptil", label: "Réptil", icon: "🦎" },
    { value: "tartaruga", label: "Tartaruga", icon: "🐢" },
    { value: "furao", label: "Furão", icon: "🦦" },
];

// Sintomas embutidos (versão compacta — o arquivo databaseSintomas.json
// deve ser carregado via fetch em produção)
const SINTOMAS = [
    { id: "sint_febre", label: "Febre (hipertermia)", categoria: "Sistêmico", especies: ["cachorro", "gato", "coelho", "roedor", "furao", "reptil", "tartaruga"], doencas_associadas: ["Cinomose", "Parvovirose", "Leptospirose", "Erliquiose", "Babesiose", "Panleukopenia Felina", "PIF", "Calicivirose Felina", "Rinotraqueíte Felina", "Infecção Bacteriana", "Toxoplasmose", "Sepse"] },
    { id: "sint_hipotermia", label: "Hipotermia (temperatura baixa)", categoria: "Sistêmico", especies: ["cachorro", "gato", "coelho", "roedor", "furao", "reptil", "tartaruga", "passaro"], doencas_associadas: ["Choque", "Sepse", "Hipoglicemia", "Insuficiência Cardíaca", "Intoxicação"] },
    { id: "sint_apatia", label: "Apatia / Letargia / Prostração", categoria: "Sistêmico", especies: ["cachorro", "gato", "coelho", "roedor", "furao", "reptil", "tartaruga", "passaro"], doencas_associadas: ["Anemia", "Parvovirose", "Cinomose", "Leptospirose", "Erliquiose", "Panleukopenia Felina", "PIF", "Doença Renal Crônica", "Insuficiência Hepática", "Hipoglicemia", "Dor Crônica", "Doença Cardíaca", "Intoxicação"] },
    { id: "sint_anorexia", label: "Anorexia / Recusa alimentar", categoria: "Sistêmico", especies: ["cachorro", "gato", "coelho", "roedor", "furao", "reptil", "tartaruga", "passaro"], doencas_associadas: ["Gastroenterite", "Parvovirose", "Panleukopenia Felina", "Lipidose Hepática Felina", "Doença Renal Crônica", "Doença Dentária", "Obstrução Intestinal", "Dor Aguda", "Estresse", "Neoplasia", "Estase Gastrointestinal (coelho)"] },
    { id: "sint_perda_peso", label: "Perda de peso progressiva", categoria: "Sistêmico", especies: ["cachorro", "gato", "coelho", "roedor", "furao", "reptil", "tartaruga", "passaro"], doencas_associadas: ["Diabetes Mellitus", "Hipertireoidismo Felino", "Insuficiência Pancreática Exócrina", "DII", "Neoplasia", "Doença Renal Crônica", "Parasitismo Intestinal", "PIF", "Leishmaniose"] },
    { id: "sint_poliuria_polidipsia", label: "Beber muita água / Urinar muito (PU/PD)", categoria: "Sistêmico", especies: ["cachorro", "gato", "furao"], doencas_associadas: ["Diabetes Mellitus", "Doença Renal Crônica", "Hiperadrenocorticismo (Cushing)", "Insuficiência Hepática", "Piometra"] },
    { id: "sint_polifagia", label: "Fome excessiva / Polifagia", categoria: "Sistêmico", especies: ["cachorro", "gato", "furao"], doencas_associadas: ["Diabetes Mellitus", "Hiperadrenocorticismo (Cushing)", "Hipertireoidismo Felino", "Insuficiência Pancreática Exócrina"] },
    { id: "sint_palidez_mucosas", label: "Mucosas pálidas / Palidez", categoria: "Sistêmico", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Anemia Hemolítica", "Babesiose", "Erliquiose", "Hemorragia Interna", "Choque", "Insuficiência Cardíaca", "Intoxicação por Cebola/Alho"] },
    { id: "sint_ictericia", label: "Icterícia (mucosas amarelas)", categoria: "Sistêmico", especies: ["cachorro", "gato", "furao", "coelho"], doencas_associadas: ["Leptospirose", "Hepatite Infecciosa Canina", "Insuficiência Hepática", "Lipidose Hepática Felina", "Babesiose", "Toxicidade Hepática", "PIF"] },
    { id: "sint_linfonodo_aumentado", label: "Linfonodos aumentados / Caroços no pescoço/virilha", categoria: "Sistêmico", especies: ["cachorro", "gato", "furao"], doencas_associadas: ["Linfoma", "Leishmaniose", "Erliquiose", "Abscesso Linfonodal"] },
    { id: "sint_defeitos_coagulacao", label: "Sangramento espontâneo / Hematomas", categoria: "Sistêmico", especies: ["cachorro", "gato", "furao"], doencas_associadas: ["Intoxicação por Raticida", "Erliquiose", "Doença de Von Willebrand", "Trombocitopenia Imunomediada", "CIVD"] },
    { id: "sint_vomito", label: "Vômito", categoria: "Digestivo", especies: ["cachorro", "gato", "furao"], doencas_associadas: ["Gastrite", "Gastroenterite", "Parvovirose", "Pancreatite", "Obstrução por Corpo Estranho", "Insuficiência Renal", "Peritonite", "DII", "Intoxicação", "Torção Gástrica (GDV)"] },
    { id: "sint_regurgitacao", label: "Regurgitação (sem náusea, passivo)", categoria: "Digestivo", especies: ["cachorro", "gato", "furao"], doencas_associadas: ["Megaesôfago", "Obstrução Esofágica", "Hérnia de Hiato", "Corpo Estranho Esofágico"] },
    { id: "sint_diarreia_liquida", label: "Diarreia líquida / aquosa", categoria: "Digestivo", especies: ["cachorro", "gato", "coelho", "roedor", "furao"], doencas_associadas: ["Parvovirose", "Panleukopenia Felina", "Gastroenterite Viral", "Coccidiose", "Giardíase", "Enterite Hemorrágica", "Estase GI Infecciosa (coelho)"] },
    { id: "sint_diarreia_com_sangue", label: "Diarreia com sangue (hematoquezia/melena)", categoria: "Digestivo", especies: ["cachorro", "gato", "furao", "coelho"], doencas_associadas: ["Parvovirose", "Enterite Hemorrágica", "Intussuscepção", "Úlcera Gástrica", "Parasitismo Intestinal", "Infecção por Clostridium"] },
    { id: "sint_constipacao", label: "Constipação / Obstipação", categoria: "Digestivo", especies: ["cachorro", "gato", "coelho", "roedor", "furao", "reptil", "tartaruga"], doencas_associadas: ["Megacólon", "Obstrução Intestinal", "Desidratação", "Corpo Estranho Intestinal", "Hiperplasia Prostática", "Estase GI (coelho)"] },
    { id: "sint_distensao_abdominal", label: "Abdômen distendido / Barriga inchada", categoria: "Digestivo", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Torção Gástrica (GDV)", "Ascite", "PIF Efusiva", "Insuficiência Cardíaca", "Neoplasia Abdominal", "Piometra", "Estase GI (coelho)"] },
    { id: "sint_ptialismo", label: "Salivação excessiva / Sialorreia", categoria: "Digestivo", especies: ["cachorro", "gato", "furao", "coelho"], doencas_associadas: ["Náusea", "Doença Oral/Dentária", "Corpo Estranho Esofágico", "Intoxicação", "Raiva", "Doença Renal (uremia)", "Calicivirose (úlceras orais)"] },
    { id: "sint_halitose", label: "Mau hálito (Halitose)", categoria: "Digestivo", especies: ["cachorro", "gato", "furao", "coelho"], doencas_associadas: ["Doença Periodontal", "Insuficiência Renal", "Insuficiência Hepática", "Diabetes (odor acetona)", "Megaesôfago"] },
    { id: "sint_estase_gi", label: "Parou de comer/evacuar / Barriga dura (coelho/roedor)", categoria: "Digestivo", especies: ["coelho", "roedor"], doencas_associadas: ["Estase Gastrointestinal (EMERGÊNCIA - coelho)", "Tricobezoar", "Intussuscepção", "Enterite Hemorrágica"] },
    { id: "sint_diarreia_cecal_coelho", label: "Fezes moles / Diarreia cecal (coelho)", categoria: "Digestivo", especies: ["coelho"], doencas_associadas: ["Disbiose por Dieta Rica em Carboidratos", "Coccidiose", "Clostridiose", "Dieta Inadequada"] },
    { id: "sint_dentes_longos", label: "Dentes longos / Dificuldade de mastigar", categoria: "Digestivo", especies: ["coelho", "roedor"], doencas_associadas: ["Maloclusão Dentária (Sobrecrescimento dental)", "Abscesso Dentário", "Spur Dentário", "Deficiência de Vitamina C (cobaia)"] },
    { id: "sint_tosse", label: "Tosse (seca, produtiva, persistente)", categoria: "Respiratório", especies: ["cachorro", "gato", "furao", "passaro", "coelho"], doencas_associadas: ["Traqueobronquite Infecciosa (Tosse dos Canis)", "Pneumonia", "Bronquite Crônica", "Asma Felina", "Dirofilariose", "Insuficiência Cardíaca Esquerda", "Colapso de Traqueia", "Micoplasmose (passaro)"] },
    { id: "sint_tosse_cardiaca", label: "Tosse noturna / Intolerância ao exercício", categoria: "Respiratório", especies: ["cachorro", "gato"], doencas_associadas: ["Insuficiência Cardíaca Congestiva", "Cardiomiopatia Dilatada", "Cardiomiopatia Hipertrófica", "Endocardiose Mitral", "Dirofilariose"] },
    { id: "sint_dispneia", label: "Dificuldade respiratória / Dispneia", categoria: "Respiratório", especies: ["cachorro", "gato", "coelho", "furao", "passaro", "roedor"], doencas_associadas: ["Pneumonia", "Edema Pulmonar", "Derrame Pleural", "Insuficiência Cardíaca", "Asma Felina", "Anemia Grave", "Pneumotórax", "PIF Efusiva", "Pasteurellose (coelho)"] },
    { id: "sint_espirros", label: "Espirros frequentes / Descarga nasal", categoria: "Respiratório", especies: ["cachorro", "gato", "coelho", "furao", "roedor"], doencas_associadas: ["Rinotraqueíte Felina", "Calicivirose Felina", "Gripe Canina", "Corpo Estranho Nasal", "Rinite Alérgica", "Sinusite", "Pasteurellose (coelho)"] },
    { id: "sint_epistaxe", label: "Sangramento nasal (Epistaxe)", categoria: "Respiratório", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Erliquiose", "Trombocitopenia", "Coagulopatia", "Leishmaniose", "Neoplasia Nasal", "Hipertensão Arterial"] },
    { id: "sint_boca_aberta_reptil", label: "Respiração de boca aberta (réptil/tartaruga)", categoria: "Respiratório", especies: ["reptil", "tartaruga"], doencas_associadas: ["Pneumonia", "Infecção Respiratória Bacteriana", "Temperatura Inadequada"] },
    { id: "sint_convulsoes", label: "Convulsões / Crises epilépticas", categoria: "Neurológico", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Epilepsia Idiopática", "Cinomose (fase neurológica)", "Encefalite", "Toxoplasmose", "PIF", "Encefalitozoonose (coelho)", "Hipoglicemia", "Intoxicação", "Neoplasia Cerebral"] },
    { id: "sint_ataxia", label: "Ataxia / Desequilíbrio / Andar cambaleante", categoria: "Neurológico", especies: ["cachorro", "gato", "coelho", "furao", "passaro"], doencas_associadas: ["Cinomose (fase neurológica)", "Vestibulite", "Meningoencefalite", "Encefalitozoonose (coelho)", "Toxoplasmose", "AVC", "Hérnia de Disco", "Otite Média/Interna", "Intoxicação"] },
    { id: "sint_paralisia", label: "Paralisia / Paresia de membros", categoria: "Neurológico", especies: ["cachorro", "gato", "coelho"], doencas_associadas: ["Hérnia de Disco (DDIV)", "Traumatismo Medular", "Mielopatia Degenerativa", "Neoplasia Medular", "Encefalitozoonose (coelho)"] },
    { id: "sint_head_tilt", label: "Head tilt / Inclinação de cabeça", categoria: "Neurológico", especies: ["cachorro", "gato", "coelho", "furao", "passaro", "roedor"], doencas_associadas: ["Otite Média/Interna", "Síndrome Vestibular Idiopática", "Encefalitozoonose (coelho)", "AVC", "Neoplasia", "Toxoplasmose"] },
    { id: "sint_tremores", label: "Tremores musculares", categoria: "Neurológico", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Hipoglicemia", "Hipocalcemia (Eclâmpsia)", "Intoxicação", "Cinomose", "Hipotermia", "Dor Intensa"] },
    { id: "sint_andar_circular", label: "Andar em círculos / Comportamento compulsivo", categoria: "Neurológico", especies: ["cachorro", "gato", "coelho", "furao", "roedor"], doencas_associadas: ["Síndrome Vestibular", "Meningoencefalite", "Encefalitozoonose", "Neoplasia Cerebral"] },
    { id: "sint_coceira", label: "Coceira intensa / Prurido", categoria: "Dermatológico", especies: ["cachorro", "gato", "coelho", "furao", "roedor"], doencas_associadas: ["Dermatite Alérgica", "Dermatite Atópica", "Sarna (Sarcóptica ou Notoédrica)", "Dermatofitose", "Alergia Alimentar", "DAPP", "Demodicose"] },
    { id: "sint_alopecia", label: "Queda de pelo / Alopecia", categoria: "Dermatológico", especies: ["cachorro", "gato", "coelho", "furao", "roedor"], doencas_associadas: ["Dermatofitose (Ringworm)", "Demodicose", "Sarna Sarcóptica", "Hiperadrenocorticismo (Cushing)", "Hipotireoidismo", "Doença Adrenal (furão)", "Alergia"] },
    { id: "sint_lesoes_pele", label: "Lesões de pele (crostas, pústulas, eritema)", categoria: "Dermatológico", especies: ["cachorro", "gato", "coelho", "furao", "roedor", "reptil", "tartaruga"], doencas_associadas: ["Piodermite", "Dermatofitose", "Demodicose", "Leishmaniose", "Pênfigo", "Neoplasia Cutânea", "Abscesso"] },
    { id: "sint_massas_subcutaneas", label: "Caroços / Nódulos / Massas palpáveis", categoria: "Dermatológico", especies: ["cachorro", "gato", "coelho", "furao", "roedor"], doencas_associadas: ["Tumor de Mastócito", "Lipoma", "Fibrossarcoma", "Tumor Mamário", "Abscesso", "Linfoma", "Insulinoma (furão)"] },
    { id: "sint_pelagem_opaca", label: "Pelagem opaca / Pelos arrepiados / Penas eriçadas", categoria: "Dermatológico", especies: ["cachorro", "gato", "coelho", "furao", "roedor", "passaro"], doencas_associadas: ["Desnutrição", "Parasitismo", "Doença Crônica", "Hipotireoidismo", "PBFD (passaro)"] },
    { id: "sint_bico_deformado", label: "Bico deformado / Crescimento anormal do bico", categoria: "Dermatológico", especies: ["passaro"], doencas_associadas: ["Sarna do Bico (Knemidokoptes)", "PBFD", "Deficiência Nutricional", "Trauma"] },
    { id: "sint_penas_quebradas", label: "Quebrar/arrancar penas / Penas destruídas", categoria: "Dermatológico", especies: ["passaro"], doencas_associadas: ["PBFD", "Picacismo por Estresse / Tédio", "Parasitismo (piolhos)", "Deficiência Nutricional"] },
    { id: "sint_descamacao_reptil", label: "Dificuldade de muda / Ecdise incompleta (réptil)", categoria: "Dermatológico", especies: ["reptil"], doencas_associadas: ["Disecdise por Baixa Umidade", "Desnutrição", "Parasitismo Externo", "Infecção Cutânea"] },
    { id: "sint_claudicacao", label: "Claudicação / Mancar / Dificuldade de locomoção", categoria: "Musculoesquelético", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Displasia Coxofemoral", "Ruptura de Ligamento Cruzado (CCL)", "Artrite/Osteoartrite", "Panosteíte", "Osteossarcoma", "Luxação de Patela", "Traumatismo", "Erliquiose (artrite)"] },
    { id: "sint_fraqueza_membros", label: "Fraqueza / Cansaço fácil nos membros", categoria: "Musculoesquelético", especies: ["cachorro", "gato", "coelho", "furao", "reptil", "tartaruga"], doencas_associadas: ["Doença Metabólica Óssea (MBD)", "Hipocalcemia", "Anemia", "Doença Cardíaca", "Miastenia Gravis", "Hipotireoidismo"] },
    { id: "sint_vocaliza_dor", label: "Vocalização de dor / Choro ao tocar", categoria: "Musculoesquelético", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Hérnia de Disco", "Trauma", "Artrite Aguda", "Peritonite", "Otite Aguda", "Urolitíase", "Distensão Gástrica", "Fratura"] },
    { id: "sint_casco_amolecido", label: "Casco amolecido / Deformado (tartaruga)", categoria: "Musculoesquelético", especies: ["tartaruga"], doencas_associadas: ["Doença Metabólica Óssea (MBD)", "Deficiência de Cálcio/UVB", "Raquitismo"] },
    { id: "sint_disuria", label: "Dificuldade para urinar / Disúria", categoria: "Urinário", especies: ["cachorro", "gato", "furao"], doencas_associadas: ["Cistite", "Urolitíase (Cálculo Urinário)", "Obstrução Uretral (FLUTD)", "Hiperplasia Prostática", "Neoplasia da Bexiga", "Estenose Uretral"] },
    { id: "sint_hematuria", label: "Sangue na urina (Hematúria)", categoria: "Urinário", especies: ["cachorro", "gato", "furao", "coelho"], doencas_associadas: ["Cistite Hemorrágica", "Urolitíase", "Pielonefrite", "Trauma", "Neoplasia da Bexiga/Rim", "Leptospirose", "Erliquiose"] },
    { id: "sint_secrecao_vaginal", label: "Secreção vaginal / Descarga vulvar", categoria: "Reprodutivo", especies: ["cachorro", "gato", "furao", "coelho"], doencas_associadas: ["Piometra (URGÊNCIA)", "Metrite", "Vaginite", "Endometrite", "Neoplasia Uterina"] },
    { id: "sint_cio_prolongado", label: "Cio prolongado / Estro persistente (furão fêmea)", categoria: "Reprodutivo", especies: ["furao"], doencas_associadas: ["Aplasia Medular por Hiperestrogenismo (FATAL)", "Tumor Ovariano", "Quisto Ovariano"] },
    { id: "sint_distensao_vulvar_furao", label: "Vulva inchada fora de época (furão fêmea)", categoria: "Reprodutivo", especies: ["furao"], doencas_associadas: ["Doença Adrenal (cio persistente)", "Tumor Ovariano", "Hiperestrogenismo (risco fatal)"] },
    { id: "sint_secrecao_ocular", label: "Secreção ocular / Olho vermelho / Epífora", categoria: "Ocular", especies: ["cachorro", "gato", "coelho", "furao", "roedor", "passaro"], doencas_associadas: ["Conjuntivite Bacteriana", "Conjuntivite Viral (Herpesvírus Felino)", "Calicivirose", "Úlcera de Córnea", "Glaucoma", "Clamidiose Felina", "Encefalitozoonose (coelho)"] },
    { id: "sint_opacidade_ocular", label: "Opacidade ocular / Catarata / Olho branco", categoria: "Ocular", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Catarata", "Uveíte", "Glaucoma", "Encefalitozoonose (coelho)", "Leishmaniose", "Diabetes Mellitus", "Toxoplasmose"] },
    { id: "sint_pio_olho", label: "Pus no olho / Úlcera de córnea", categoria: "Ocular", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Conjuntivite Bacteriana", "Úlcera de Córnea", "Panoftalmite", "Herpesvírus Felino", "Trauma Ocular"] },
    { id: "sint_otite", label: "Coceira na orelha / Sacudir cabeça / Secreção auricular", categoria: "Auricular", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Otite Externa Bacteriana", "Otite por Malassezia", "Otodectes (Ácaros)", "Otite Média", "Corpo Estranho Auricular", "Alergia Alimentar/Ambiental"] },
    { id: "sint_mucosas_cianosadas", label: "Mucosas azuladas / Cianose", categoria: "Cardiovascular", especies: ["cachorro", "gato", "coelho", "furao", "passaro"], doencas_associadas: ["Insuficiência Cardíaca Grave", "Pneumonia Grave", "Edema Pulmonar", "Pneumotórax", "Cardiopatia Congênita"] },
    { id: "sint_ascite", label: "Ascite / Líquido na barriga", categoria: "Cardiovascular", especies: ["cachorro", "gato", "furao"], doencas_associadas: ["Insuficiência Cardíaca Direita", "Hipertensão Portal", "PIF Efusiva", "Cirrose Hepática", "Neoplasia", "Hipoalbuminemia"] },
    { id: "sint_edema_membros", label: "Edema / Inchaço em membros", categoria: "Cardiovascular", especies: ["cachorro", "gato", "furao"], doencas_associadas: ["Insuficiência Cardíaca", "Hipoproteinemia", "Obstrução Linfática", "Vasculite", "Trombose"] },
    { id: "sint_hipersalivacao_furao", label: "Hipersalivação / Fraqueza episódica (furão)", categoria: "Sistêmico", especies: ["furao"], doencas_associadas: ["Insulinoma (Tumor de Pâncreas — muito comum em furões)", "Hipoglicemia"] },
    { id: "sint_agressividade_repentina", label: "Agressividade / Mudança de comportamento súbita", categoria: "Comportamental", especies: ["cachorro", "gato", "coelho", "furao"], doencas_associadas: ["Raiva (EMERGÊNCIA - Zoonose)", "Dor Aguda", "Encefalite", "Neoplasia Cerebral", "Encefalitozoonose"] },
    { id: "sint_fezes_escuras_passaro", label: "Fezes escuras / Verdes / Uratos alterados (pássaro)", categoria: "Digestivo", especies: ["passaro"], doencas_associadas: ["Psitacose/Clamidiose", "Aspergilose", "Doença Hepática", "Giardíase Aviária", "Macrorhabdus (AGY)"] },
];

// Doenças com metadados de urgência/zoonose
const DOENCAS_META = {
    "Parvovirose": { urgencia: true, zoonose: false, gravidade: "alta" },
    "Leptospirose": { urgencia: true, zoonose: true, gravidade: "alta" },
    "Babesiose": { urgencia: true, zoonose: false, gravidade: "alta" },
    "Torção Gástrica (GDV)": { urgencia: true, zoonose: false, gravidade: "alta" },
    "Piometra (URGÊNCIA)": { urgencia: true, zoonose: false, gravidade: "alta" },
    "Raiva (EMERGÊNCIA - Zoonose)": { urgencia: true, zoonose: true, gravidade: "alta" },
    "Obstrução Uretral (FLUTD)": { urgencia: true, zoonose: false, gravidade: "alta" },
    "Panleukopenia Felina": { urgencia: true, zoonose: false, gravidade: "alta" },
    "Estase Gastrointestinal (EMERGÊNCIA - coelho)": { urgencia: true, zoonose: false, gravidade: "alta" },
    "Aplasia Medular por Hiperestrogenismo (FATAL)": { urgencia: true, zoonose: false, gravidade: "alta" },
    "Hérnia de Disco (DDIV)": { urgencia: true, zoonose: false, gravidade: "alta" },
    "Leishmaniose": { urgencia: false, zoonose: true, gravidade: "alta" },
    "Toxoplasmose": { urgencia: false, zoonose: true, gravidade: "moderada" },
    "Erliquiose": { urgencia: false, zoonose: false, gravidade: "alta" },
    "Cinomose": { urgencia: false, zoonose: false, gravidade: "alta" },
    "PIF": { urgencia: false, zoonose: false, gravidade: "alta" },
    "Cinomose (fase neurológica)": { urgencia: true, zoonose: false, gravidade: "alta" },
};

// ─── STATE ─────────────────────────────────────────────────────────────────────
let state = {
    step: 1,
    especie: null,
    sintomasSelecionados: new Set(),
    doencaSelecionada: null,
    diagnosticoTexto: ""
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function getSintomasByEspecie(especie) {
    return SINTOMAS.filter(s => s.especies.includes(especie));
}

function calcularDoencasSugeridas(especie, sintomaIds) {
    const mapa = {};
    const selecionados = SINTOMAS.filter(s => sintomaIds.has(s.id));
    selecionados.forEach(sint => {
        sint.doencas_associadas.forEach(d => {
            if (!mapa[d]) mapa[d] = { nome: d, count: 0, sintomas_match: [] };
            mapa[d].count++;
            mapa[d].sintomas_match.push(sint.label);
        });
    });
    return Object.values(mapa)
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
}

// ─── RENDER STEPS ──────────────────────────────────────────────────────────────
function updateStepIndicator(currentStep) {
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(`dot-${i}`);
        dot.className = "step-dot";
        if (i < currentStep) dot.classList.add("done");
        else if (i === currentStep) dot.classList.add("active");
    }
    for (let i = 1; i <= 3; i++) {
        const line = document.getElementById(`line-${i}-${i + 1}`);
        line.className = "step-line";
        if (i < currentStep) line.classList.add("done");
    }
}

function goToStep(n) {
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`step-${i}`).classList.add("hidden");
    }
    document.getElementById(`step-${n}`).classList.remove("hidden");
    document.getElementById(`step-${n}`).classList.add("fade-in");
    updateStepIndicator(n);
    state.step = n;
}

// ─── STEP 1 ────────────────────────────────────────────────────────────────────
function renderStep1() {
    const grid = document.getElementById("especies-grid");
    grid.innerHTML = ESPECIES.map(e => `
    <button class="species-btn ${state.especie === e.value ? 'selected' : ''}"
      data-especie="${e.value}">
      <span class="species-icon">${e.icon}</span>
      <span>${e.label}</span>
    </button>
  `).join("");

    grid.querySelectorAll(".species-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            state.especie = btn.dataset.especie;
            state.sintomasSelecionados.clear();
            state.doencaSelecionada = null;
            grid.querySelectorAll(".species-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            document.getElementById("btn-step1-next").disabled = false;
        });
    });
}

// ─── STEP 2 ────────────────────────────────────────────────────────────────────
function renderStep2(filterText = "") {
    const sintomas = getSintomasByEspecie(state.especie);
    const texto = filterText.toLowerCase().trim();
    const filtrados = texto ? sintomas.filter(s => s.label.toLowerCase().includes(texto) || s.categoria.toLowerCase().includes(texto)) : sintomas;

    // Agrupar por categoria
    const categorias = {};
    filtrados.forEach(s => {
        if (!categorias[s.categoria]) categorias[s.categoria] = [];
        categorias[s.categoria].push(s);
    });

    const lista = document.getElementById("sintomas-lista");
    lista.innerHTML = Object.entries(categorias).map(([cat, items]) => `
    <div>
      <div class="categoria-header">${cat}</div>
      ${items.map(s => `
        <label class="sintoma-check ${state.sintomasSelecionados.has(s.id) ? 'checked' : ''}" data-id="${s.id}">
          <input type="checkbox" ${state.sintomasSelecionados.has(s.id) ? 'checked' : ''} />
          <span class="check-box"><span class="check-icon">✓</span></span>
          <span class="sintoma-label">${s.label}</span>
        </label>
      `).join("")}
    </div>
  `).join("");

    lista.querySelectorAll(".sintoma-check").forEach(el => {
        el.addEventListener("click", () => {
            const id = el.dataset.id;
            if (state.sintomasSelecionados.has(id)) {
                state.sintomasSelecionados.delete(id);
                el.classList.remove("checked");
            } else {
                state.sintomasSelecionados.add(id);
                el.classList.add("checked");
            }
            updateCountAndTags();
        });
    });

    updateCountAndTags();
}

function updateCountAndTags() {
    const count = state.sintomasSelecionados.size;
    document.getElementById("count-sintomas").textContent = `${count} selecionado${count !== 1 ? 's' : ''}`;
    document.getElementById("btn-step2-next").disabled = count === 0;

    const tagsContainer = document.getElementById("tags-container");
    if (count > 0) {
        tagsContainer.classList.remove("hidden");
        tagsContainer.innerHTML = [...state.sintomasSelecionados].map(id => {
            const s = SINTOMAS.find(x => x.id === id);
            return s ? `<span class="tag-sintoma">${s.label.substring(0, 30)}${s.label.length > 30 ? '…' : ''} <button onclick="removeSintoma('${id}')">×</button></span>` : '';
        }).join("");
    } else {
        tagsContainer.classList.add("hidden");
    }
}

function removeSintoma(id) {
    state.sintomasSelecionados.delete(id);
    renderStep2(document.getElementById("search-sintomas").value);
}
window.removeSintoma = removeSintoma;

// ─── STEP 3 ────────────────────────────────────────────────────────────────────
function renderStep3() {
    const sugestoes = calcularDoencasSugeridas(state.especie, state.sintomasSelecionados);
    const maxCount = sugestoes[0]?.count || 1;

    const container = document.getElementById("doencas-sugeridas");

    if (sugestoes.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-sm text-center py-8">Nenhuma doença associada encontrada. Continue para registrar manualmente.</p>`;
        return;
    }

    container.innerHTML = sugestoes.map((d, i) => {
        const pct = Math.round((d.count / maxCount) * 100);
        const meta = DOENCAS_META[d.nome] || {};
        const badges = [];
        if (meta.urgencia) badges.push(`<span class="badge-urgente text-[10px] px-1.5 py-0.5 rounded-md font-bold">⚠ URGENTE</span>`);
        if (meta.zoonose) badges.push(`<span class="badge-zoonose text-[10px] px-1.5 py-0.5 rounded-md font-bold">🔬 ZOONOSE</span>`);
        const gravClass = `badge-${meta.gravidade || 'leve'}`;
        if (meta.gravidade) badges.push(`<span class="${gravClass} text-[10px] px-1.5 py-0.5 rounded-md font-bold">${meta.gravidade?.toUpperCase()}</span>`);

        return `
      <div class="doenca-card ${state.doencaSelecionada === d.nome ? 'selected' : ''}" data-doenca="${d.nome}">
        <div class="w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 mt-0.5">${i + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2 mb-1">
            <span class="text-sm font-semibold text-white leading-tight">${d.nome}</span>
            <span class="text-xs text-primary font-bold flex-shrink-0">${pct}%</span>
          </div>
          <div class="match-bar-bg mb-2"><div class="match-bar-fill" style="width:${pct}%"></div></div>
          <div class="flex flex-wrap gap-1 mb-1">${badges.join('')}</div>
          <p class="text-[11px] text-gray-600 truncate">Sintomas: ${d.sintomas_match.join(', ')}</p>
        </div>
      </div>
    `;
    }).join("");

    container.querySelectorAll(".doenca-card").forEach(el => {
        el.addEventListener("click", () => {
            const nome = el.dataset.doenca;
            if (state.doencaSelecionada === nome) {
                state.doencaSelecionada = null;
                el.classList.remove("selected");
            } else {
                state.doencaSelecionada = nome;
                container.querySelectorAll(".doenca-card").forEach(c => c.classList.remove("selected"));
                el.classList.add("selected");
            }
        });
    });
}

// ─── STEP 4 ────────────────────────────────────────────────────────────────────
function renderStep4() {
    // Tags de sintomas
    const resumoDiv = document.getElementById("resumo-sintomas");
    resumoDiv.innerHTML = [...state.sintomasSelecionados].map(id => {
        const s = SINTOMAS.find(x => x.id === id);
        return s ? `<span class="tag-sintoma">${s.label.substring(0, 35)}${s.label.length > 35 ? '…' : ''}</span>` : '';
    }).join("") || '<span class="text-gray-600 text-xs">Nenhum sintoma selecionado</span>';

    // Preencher diagnóstico
    const campo = document.getElementById("campo-diagnostico");
    if (state.doencaSelecionada) {
        campo.value = state.doencaSelecionada;
        document.getElementById("badge-diagnostico-selecionado").classList.remove("hidden");
    } else {
        campo.value = state.diagnosticoTexto || "";
        document.getElementById("badge-diagnostico-selecionado").classList.add("hidden");
    }

    // Alertas
    const alertasDiv = document.getElementById("alertas-urgencia");
    alertasDiv.innerHTML = "";
    let temAlerta = false;

    [...state.sintomasSelecionados, state.doencaSelecionada].filter(Boolean).forEach(item => {
        const meta = DOENCAS_META[item];
        if (!meta) return;
        if (meta.urgencia) {
            alertasDiv.innerHTML += `<div class="flex items-center gap-3 p-3 rounded-xl badge-urgente"><i class="ph ph-warning-circle text-xl"></i><div><p class="text-xs font-bold">EMERGÊNCIA CLÍNICA</p><p class="text-[11px] opacity-80">${item} — Requer atenção imediata.</p></div></div>`;
            temAlerta = true;
        }
        if (meta.zoonose) {
            alertasDiv.innerHTML += `<div class="flex items-center gap-3 p-3 rounded-xl badge-zoonose"><i class="ph ph-virus text-xl"></i><div><p class="text-xs font-bold">ATENÇÃO — ZOONOSE</p><p class="text-[11px] opacity-80">${item} — Transmissível ao humano. Notificar vigilância se confirmado.</p></div></div>`;
            temAlerta = true;
        }
    });

    alertasDiv.classList.toggle("hidden", !temAlerta);
}

// ─── COPY ─────────────────────────────────────────────────────────────────────
function gerarResumo() {
    const esp = ESPECIES.find(e => e.value === state.especie);
    const sintNomes = [...state.sintomasSelecionados].map(id => SINTOMAS.find(x => x.id === id)?.label).filter(Boolean);
    const diag = document.getElementById("campo-diagnostico")?.value || "";
    return `=== DIAGNÓSTICO ASSISTIDO — PETTO ===
Espécie: ${esp?.label || "—"}
Sintomas: ${sintNomes.join("; ") || "Nenhum"}
Hipótese Diagnóstica: ${diag || "—"}
Data: ${new Date().toLocaleDateString("pt-BR")}`;
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
document.getElementById("btn-demo-open").addEventListener("click", () => {
    document.getElementById("modal-diagnostico").classList.add("open");
    renderStep1();
    goToStep(1);
});

document.getElementById("btn-close-modal").addEventListener("click", () => {
    document.getElementById("modal-diagnostico").classList.remove("open");
});

document.getElementById("modal-diagnostico").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("open");
});

document.getElementById("btn-step1-next").addEventListener("click", () => {
    renderStep2();
    goToStep(2);
    document.getElementById("search-sintomas").value = "";
});

document.getElementById("btn-step2-back").addEventListener("click", () => {
    renderStep1();
    goToStep(1);
});

document.getElementById("btn-step2-next").addEventListener("click", () => {
    renderStep3();
    goToStep(3);
});

document.getElementById("btn-step3-back").addEventListener("click", () => {
    renderStep2();
    goToStep(2);
});

document.getElementById("btn-step3-next").addEventListener("click", () => {
    renderStep4();
    goToStep(4);
});

document.getElementById("btn-step4-back").addEventListener("click", () => {
    renderStep3();
    goToStep(3);
});

document.getElementById("btn-finalizar").addEventListener("click", () => {
    const diag = document.getElementById("campo-diagnostico").value;
    state.diagnosticoTexto = diag;

    // Dispara evento customizado para integração com prontuários.js
    const evento = new CustomEvent("diagnostico-assistido-concluido", {
        detail: {
            especie: state.especie,
            sintomas: [...state.sintomasSelecionados].map(id => SINTOMAS.find(x => x.id === id)?.label).filter(Boolean),
            diagnostico: diag,
            doencaSelecionada: state.doencaSelecionada
        }
    });
    document.dispatchEvent(evento);

    document.getElementById("modal-diagnostico").classList.remove("open");

    // Feedback visual (se integrado ao prontuários.html, use o Swal global)
    if (window.Swal) {
        Swal.fire({ icon: "success", title: "Aplicado!", text: "Os dados foram transferidos para o prontuário.", timer: 2000, showConfirmButton: false });
    } else {
        alert(`Diagnóstico aplicado: ${diag}`);
    }
});

document.getElementById("btn-copiar-resultado").addEventListener("click", () => {
    navigator.clipboard.writeText(gerarResumo()).then(() => {
        const btn = document.getElementById("btn-copiar-resultado");
        btn.innerHTML = `<i class="ph ph-check"></i> Copiado!`;
        btn.style.color = "#00D09E";
        setTimeout(() => { btn.innerHTML = `<i class="ph ph-copy"></i> Copiar resumo`; btn.style.color = ""; }, 2000);
    });
});

document.getElementById("search-sintomas").addEventListener("input", (e) => {
    renderStep2(e.target.value);
});

document.getElementById("campo-diagnostico").addEventListener("input", (e) => {
    state.diagnosticoTexto = e.target.value;
    if (state.doencaSelecionada && e.target.value !== state.doencaSelecionada) {
        state.doencaSelecionada = null;
        document.getElementById("badge-diagnostico-selecionado").classList.add("hidden");
    }
}); 