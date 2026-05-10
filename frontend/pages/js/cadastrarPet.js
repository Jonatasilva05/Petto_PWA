
document.addEventListener('DOMContentLoaded', () => {
    // Estado do formulário
    let currentStep = 1;
    const totalSteps = 4;

    // Elementos DOM
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnFinish = document.getElementById('btn-finish');
    const progressBar = document.getElementById('progress-bar');
    const steps = document.querySelectorAll('.step-section');

    // Dados Mockados para Espécie/Raça
    const petData = {
        'Cachorro': ['Golden Retriever', 'Bulldog', 'Poodle', 'Shih Tzu', 'Vira-lata'],
        'Gato': ['Persa', 'Siamês', 'Maine Coon', 'Vira-lata'],
        'Outro': ['Ave', 'Coelho', 'Roedor']
    };

    // Navegação de Etapas
    function updateUI() {
        // Atualiza barra de progresso
        progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;

        // Mostra a seção correta
        steps.forEach((step, index) => {
            if (index + 1 === currentStep) step.classList.remove('hidden');
            else step.classList.add('hidden');
        });

        // Botões do Footer
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

    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            updateUI();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    btnFinish.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            alert('Cadastro concluído com sucesso!');
            window.location.href = './dashboard.html';
        }
    });

    // Validação Simples
    function validateStep(step) {
        if (step === 1) {
            const nome = document.getElementById('pet-nome').value;
            const especie = document.getElementById('pet-especie').value;
            if (!nome || !especie) {
                alert('Preencha o Nome e a Espécie.');
                return false;
            }
        }
        if (step === 2) {
            const sexo = document.getElementById('pet-sexo').value;
            if (!sexo) {
                alert('Selecione o sexo do pet.');
                return false;
            }
        }
        return true;
    }

    // Lógica da Foto
    const photoInput = document.getElementById('pet-photo-input');
    const photoContainer = document.getElementById('photo-preview-container');

    photoContainer.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoContainer.innerHTML = `<img src="${e.target.result}" alt="Pet Photo">`;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Lógica Espécie/Raça
    const selectEspecie = document.getElementById('pet-especie');
    const selectRaca = document.getElementById('pet-raca');

    selectEspecie.addEventListener('change', function() {
        const especie = this.value;
        const racas = petData[especie] || [];
        
        selectRaca.innerHTML = '<option value="" disabled selected>Selecione a raça...</option>';
        racas.forEach(raca => {
            selectRaca.innerHTML += `<option value="${raca}">${raca}</option>`;
        });
        
        selectRaca.disabled = racas.length === 0;
    });

    // Lógica Checkbox "Não Sei" Data de Nascimento
    const checkNaoSeiData = document.getElementById('check-nao-sei-data');
    const containerDataNasc = document.getElementById('container-data-nasc');
    const containerIdadeAprox = document.getElementById('container-idade-aprox');

    checkNaoSeiData.addEventListener('change', function() {
        if (this.checked) {
            containerDataNasc.classList.add('hidden');
            containerIdadeAprox.classList.remove('hidden');
        } else {
            containerDataNasc.classList.remove('hidden');
            containerIdadeAprox.classList.add('hidden');
        }
    });

    // Lógica Checkbox "Não Sei" Peso
    const checkNaoSeiPeso = document.getElementById('check-nao-sei-peso');
    const inputPeso = document.getElementById('pet-peso');

    checkNaoSeiPeso.addEventListener('change', function() {
        inputPeso.disabled = this.checked;
        if (this.checked) inputPeso.value = '';
    });

    // Lógica Seleção de Sexo
    const btnSexos = document.querySelectorAll('.btn-sex');
    const inputSexo = document.getElementById('pet-sexo');

    btnSexos.forEach(btn => {
        btn.addEventListener('click', function() {
            btnSexos.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            inputSexo.value = this.dataset.value;
        });
    });

    // Lógica Toggle Sim/Não/Não Sei (Vacinas e Meds)
    const btnToggles = document.querySelectorAll('.btn-toggle');
    
    btnToggles.forEach(btn => {
        btn.addEventListener('click', function() {
            const group = this.dataset.group;
            const value = this.dataset.value;
            
            // Remove active dos irmãos
            document.querySelectorAll(`.btn-toggle[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Atualiza input hidden e mostra/esconde container
            if (group === 'vacina') {
                document.getElementById('pet-vacinado').value = value;
                const container = document.getElementById('vacinas-container');
                value === 'sim' ? container.classList.remove('hidden') : container.classList.add('hidden');
            } else if (group === 'med') {
                document.getElementById('pet-medicado').value = value;
                const container = document.getElementById('meds-container');
                value === 'sim' ? container.classList.remove('hidden') : container.classList.add('hidden');
            }
        });
    });

    // Inicializa a UI
    updateUI();
});
