document.addEventListener('DOMContentLoaded', () => {

    // VARIÁVEIS DE CONTROLE DO WIZARD
    let currentStep = 1;
    const totalSteps = 4;

    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnFinish = document.getElementById('btn-finish');
    const progressBar = document.getElementById('progress-bar');

    // NAVEGAÇÃO DE PASSOS
    function updateWizard() {
        // Esconde todos
        document.querySelectorAll('.step-section').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });

        // Mostra o atual
        const currentSection = document.getElementById(`step-${currentStep}`);
        if (currentSection) {
            currentSection.classList.remove('hidden');
            currentSection.classList.add('active');
        }

        // Progresso
        if (progressBar) progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;

        // Botões
        if (currentStep === 1) {
            btnPrev.classList.add('hidden');
        } else {
            btnPrev.classList.remove('hidden');
        }

        if (currentStep === totalSteps) {
            btnNext.classList.add('hidden');
            btnFinish.classList.remove('hidden');
        } else {
            btnNext.classList.remove('hidden');
            btnFinish.classList.add('hidden');
        }
    }

    btnNext?.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateWizard();
        }
    });

    btnPrev?.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizard();
        }
    });

    btnFinish?.addEventListener('click', () => {
        alert("Cadastro finalizado com sucesso!");
        window.location.href = './dashboard.html';
    });

    // ETAPA 2: Data vs Idade
    const checkNaoSeiData = document.getElementById('check-nao-sei-data');
    const containerData = document.getElementById('container-data-nasc');
    const containerIdade = document.getElementById('container-idade-aprox');

    checkNaoSeiData?.addEventListener('change', (e) => {
        if (e.target.checked) {
            containerData.classList.add('hidden');
            containerIdade.classList.remove('hidden');
        } else {
            containerData.classList.remove('hidden');
            containerIdade.classList.add('hidden');
        }
    });

    // Toggle de Anos/Meses
    document.querySelectorAll('.btn-toggle-idade').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-toggle-idade').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // ETAPA 2: Sexo
    const btnSexes = document.querySelectorAll('.btn-sex');
    const inputSexo = document.getElementById('pet-sexo');

    btnSexes.forEach(btn => {
        btn.addEventListener('click', (e) => {
            btnSexes.forEach(b => b.classList.remove('active'));
            const targetBtn = e.currentTarget;
            targetBtn.classList.add('active');
            inputSexo.value = targetBtn.getAttribute('data-value');
        });
    });

    // ETAPA 3 e 4: Toggles Sim/Não/Não Sei
    const vacinaOpts = document.querySelectorAll('.btn-vacina-opt');
    vacinaOpts.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const group = e.target.getAttribute('data-group');
            const value = e.target.getAttribute('data-value');

            document.querySelectorAll(`.btn-vacina-opt[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            if (group === 'vacina') {
                document.getElementById('pet-vacinado').value = value;
                const areaVacinas = document.getElementById('area-selecionar-vacinas');
                if (value === 'sim') areaVacinas.classList.remove('hidden');
                else areaVacinas.classList.add('hidden');
            } else if (group === 'med') {
                document.getElementById('pet-medicado').value = value;
            }
        });
    });
});

// BOTTOM SHEETS
let activeSheetId = null;

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

document.getElementById('overlay')?.addEventListener('click', closeBottomSheet);

window.selectItem = function (tipo, nome) {
    const el = document.getElementById(`txt-${tipo}`);
    if (el) {
        el.innerText = nome;
        el.style.color = '#fff';
    }
};

window.addSelectedVaccines = function () {
    const checkboxes = document.querySelectorAll('#sheet-vacina .vacina-check:checked');
    const container = document.getElementById('lista-vacinas-selecionadas');

    container.innerHTML = '';

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