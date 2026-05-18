// =========================================
// IMPORTAÇÃO DOS DADOS (MODEL)
// =========================================
import { PET_DATA } from '../../data/databasePets.js';
import { MEDICAL_DATABASE } from '../../data/databaseHealthReference.js';

// Mapeia todas as espécies que possuem vacinas cadastradas no banco médico
const ESPECIES_PERMITIDAS = [...new Set(MEDICAL_DATABASE.vacinas.flatMap(v => v.species))];

// =========================================
// VARIÁVEIS DE ESTADO
// =========================================
let activeSheetId = null;
let especieSelecionada = null;
let currentStep = 1;
const totalSteps = 4;

// =========================================
// FUNÇÕES GLOBAIS (Acessíveis pelo HTML)
// =========================================

window.openBottomSheet = function (id) {
    activeSheetId = id;
    document.getElementById('overlay').classList.add('active');
    document.getElementById(id).classList.add('active');
};

window.closeBottomSheet = function () {
    if (activeSheetId) {
        document.getElementById(activeSheetId).classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        activeSheetId = null;
    }
};

window.selecionarEspecie = function(value, label) {
    const elTexto = document.getElementById('txt-especie');
    if (elTexto) {
        elTexto.innerText = label;
        elTexto.style.color = '#fff';
    }

    especieSelecionada = value;

    // Reseta a raça ao trocar de espécie
    const elRacaTexto = document.getElementById('txt-raca');
    if (elRacaTexto) {
        elRacaTexto.innerText = 'Selecione...';
        elRacaTexto.style.color = 'var(--text-muted)';
    }

    carregarRacas(value);
    closeBottomSheet();
};

window.selecionarRaca = function(value, label) {
    const elTexto = document.getElementById('txt-raca');
    if (elTexto) {
        elTexto.innerText = label;
        elTexto.style.color = '#fff';
    }
    closeBottomSheet();
};

window.addSelectedVaccines = function () {
    const checkboxes = document.querySelectorAll('#sheet-vacina .vacina-check:checked');
    const container = document.getElementById('lista-vacinas-selecionadas');

    container.innerHTML = ''; // Limpa antes de adicionar

    checkboxes.forEach(chk => {
        const div = document.createElement('div');
        div.className = 'vacina-card';
        div.innerHTML = `
            <h4>${chk.value}</h4>
            <i class="fa-regular fa-trash-can trash-icon" onclick="this.parentElement.remove()"></i>
            <div class="header-checkbox">
                <input type="text" placeholder="DD/MM/AAAA" style="width: 60%">
                <label class="checkbox-label"><input type="checkbox"> Não lembro</label>
            </div>
        `;
        container.appendChild(div);
    });

    closeBottomSheet();
};

// =========================================
// FUNÇÕES LOCAIS (Lógica de Tela)
// =========================================

function carregarEspecies() {
    const listaEspecies = document.getElementById('lista-especies');
    if (!listaEspecies) return;

    listaEspecies.innerHTML = ''; 

    // Filtra para exibir apenas espécies com suporte médico
    const especiesFiltradas = PET_DATA.filter(esp => ESPECIES_PERMITIDAS.includes(esp.value));

    especiesFiltradas.forEach(especie => {
        const li = document.createElement('li');
        li.innerText = especie.label;
        li.onclick = () => selecionarEspecie(especie.value, especie.label);
        listaEspecies.appendChild(li);
    });
}

function carregarRacas(especieValue) {
    const listaRacas = document.getElementById('lista-racas');
    if (!listaRacas) return;

    listaRacas.innerHTML = '';

    const especieEncontrada = PET_DATA.find(e => e.value === especieValue);

    if (especieEncontrada && especieEncontrada.breeds) {
        especieEncontrada.breeds.forEach(raca => {
            const li = document.createElement('li');
            li.innerText = raca.label;
            li.onclick = () => selecionarRaca(raca.value, raca.label);
            listaRacas.appendChild(li);
        });
    } else {
        listaRacas.innerHTML = '<li style="text-align: center; color: var(--text-muted);">Nenhuma raça encontrada</li>';
    }
}

function updateWizard() {
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnFinish = document.getElementById('btn-finish');
    const progressBar = document.getElementById('progress-bar');

    document.querySelectorAll('.step-section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });

    const currentSection = document.getElementById(`step-${currentStep}`);
    if (currentSection) {
        currentSection.classList.remove('hidden');
        currentSection.classList.add('active');
    }

    if (progressBar) progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;

    // Controle de botões
    btnPrev.classList.toggle('hidden', currentStep === 1);
    
    if (currentStep === totalSteps) {
        btnNext.classList.add('hidden');
        btnFinish.classList.remove('hidden');
    } else {
        btnNext.classList.remove('hidden');
        btnFinish.classList.add('hidden');
    }
}

// =========================================
// INICIALIZAÇÃO E EVENTOS DO DOM
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicia os dados
    carregarEspecies();

    // Eventos do Wizard
    document.getElementById('btn-next')?.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateWizard();
        }
    });

    document.getElementById('btn-prev')?.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizard();
        }
    });

    document.getElementById('btn-finish')?.addEventListener('click', () => {
        alert("Cadastro finalizado com sucesso!");
        window.location.href = '../dashboard.html';
    });

    // Eventos de Data vs Idade
    const checkNaoSeiData = document.getElementById('check-nao-sei-data');
    const containerData = document.getElementById('container-data-nasc');
    const containerIdade = document.getElementById('container-idade-aprox');

    checkNaoSeiData?.addEventListener('change', (e) => {
        containerData.classList.toggle('hidden', e.target.checked);
        containerIdade.classList.toggle('hidden', !e.target.checked);
    });

    document.querySelectorAll('.btn-toggle-idade').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-toggle-idade').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Eventos de Sexo
    const inputSexo = document.getElementById('pet-sexo');
    document.querySelectorAll('.btn-sex').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-sex').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            inputSexo.value = e.currentTarget.getAttribute('data-value');
        });
    });

    // Eventos de Toggles (Vacina e Medicação)
    document.querySelectorAll('.btn-vacina-opt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const group = e.target.getAttribute('data-group');
            const value = e.target.getAttribute('data-value');

            document.querySelectorAll(`.btn-vacina-opt[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            if (group === 'vacina') {
                document.getElementById('pet-vacinado').value = value;
                const areaVacinas = document.getElementById('area-selecionar-vacinas');
                areaVacinas.classList.toggle('hidden', value !== 'sim');
            } else if (group === 'med') {
                document.getElementById('pet-medicado').value = value;
            }
        });
    });

    // Overlay Close
    document.getElementById('overlay')?.addEventListener('click', closeBottomSheet);
});