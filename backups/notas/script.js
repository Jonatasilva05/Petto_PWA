document.addEventListener('DOMContentLoaded', () => {
    // Referências dos elementos
    const checkNaoSeiData = document.getElementById('check-nao-sei-data');
    const inputData = document.getElementById('input-data');
    const sectionIdadeAprox = document.getElementById('idade-aproximada-section');
    
    const btnMeses = document.getElementById('btn-meses');
    const btnAnos = document.getElementById('btn-anos');
    const labelIdadePrincipal = document.getElementById('label-idade-principal');
    const labelTempoExtra = document.getElementById('label-tempo-extra');
    
    const checkNaoSeiMeses = document.getElementById('check-nao-sei-meses');
    const inputMesesExtra = document.getElementById('input-meses-extra');
    
    const btnMacho = document.getElementById('btn-macho');
    const btnFemea = document.getElementById('btn-femea');
    
    const checkNaoSeiPeso = document.getElementById('check-nao-sei-peso');
    const inputPeso = document.getElementById('input-peso');

    // Lógica 1: Não sei a data de nascimento
    checkNaoSeiData.addEventListener('change', (e) => {
        if (e.target.checked) {
            inputData.disabled = true; // Desabilita o input original
            inputData.value = ''; // Limpa o valor
            sectionIdadeAprox.classList.remove('hidden'); // Mostra a nova seção
        } else {
            inputData.disabled = false;
            sectionIdadeAprox.classList.add('hidden');
        }
    });

    // Lógica 2: Toggle Meses / Anos
    btnMeses.addEventListener('click', () => {
        // Estilização
        btnMeses.classList.add('active');
        btnAnos.classList.remove('active');
        
        // Altera os textos para a opção MESES
        labelIdadePrincipal.textContent = 'Meses Aproximados';
        labelTempoExtra.textContent = 'e Dias aproximados';
        inputMesesExtra.placeholder = 'Ex: 15';
    });

    btnAnos.addEventListener('click', () => {
        // Estilização
        btnAnos.classList.add('active');
        btnMeses.classList.remove('active');
        
        // Retorna os textos para a opção ANOS
        labelIdadePrincipal.textContent = 'Idade Aproximada';
        labelTempoExtra.textContent = 'e Meses (opcional)';
        inputMesesExtra.placeholder = 'Ex: 3';
    });

    // Lógica 3: Não sei os meses (opcional)
    checkNaoSeiMeses.addEventListener('change', (e) => {
        inputMesesExtra.disabled = e.target.checked;
        if(e.target.checked) inputMesesExtra.value = '';
    });

    // Lógica 4: Seleção de Sexo (Exclusiva)
    btnMacho.addEventListener('click', () => {
        btnMacho.classList.add('active');
        btnFemea.classList.remove('active');
    });

    btnFemea.addEventListener('click', () => {
        btnFemea.classList.add('active');
        btnMacho.classList.remove('active');
    });

    // Lógica 5: Não sei o peso
    checkNaoSeiPeso.addEventListener('change', (e) => {
        inputPeso.disabled = e.target.checked;
        if(e.target.checked) inputPeso.value = '';
    });
});