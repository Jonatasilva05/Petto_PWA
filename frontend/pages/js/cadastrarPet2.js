// Referências aos elementos
const cbUnknownDate = document.getElementById('cb-unknown-date');
const inputBirthDate = document.getElementById('input-birth-date');
const approxAgeSection = document.getElementById('approx-age-section');

// Referências Rótulos (Labels) Dinâmicos
const labelApproxMain = document.getElementById('label-approx-main');
const labelApproxSub = document.getElementById('label-approx-sub');

// Lógica para mostrar/esconder a idade aproximada
cbUnknownDate.addEventListener('change', function() {
    if (this.checked) {
        inputBirthDate.disabled = true;
        inputBirthDate.value = ''; 
        approxAgeSection.classList.add('active');
    } else {
        inputBirthDate.disabled = false;
        approxAgeSection.classList.remove('active');
    }
});

// Lógica para os botões de Meses / Anos e troca de textos
const btnMonths = document.getElementById('btn-months');
const btnYears = document.getElementById('btn-years');

btnMonths.addEventListener('click', () => {
    btnMonths.classList.add('active');
    btnYears.classList.remove('active');
    
    // Altera os textos para Meses / Dias
    labelApproxMain.textContent = 'Meses aproximados';
    labelApproxSub.textContent = 'e Dias (opcional)';
});

btnYears.addEventListener('click', () => {
    btnYears.classList.add('active');
    btnMonths.classList.remove('active');
    
    // Volta os textos para Anos / Meses
    labelApproxMain.textContent = 'Anos aproximados';
    labelApproxSub.textContent = 'e Meses (opcional)';
});

// Lógica para Desabilitar o campo secundário se "Não sei" for marcado
const cbUnknownMonths = document.getElementById('cb-unknown-months');
const inputApproxMonths = document.getElementById('input-approx-months');

cbUnknownMonths.addEventListener('change', function() {
    inputApproxMonths.disabled = this.checked;
    if(this.checked) inputApproxMonths.value = '';
});

// Lógica para Seleção de Sexo (Macho / Fêmea)
const btnMale = document.getElementById('btn-male');
const btnFemale = document.getElementById('btn-female');

btnMale.addEventListener('click', () => {
    btnMale.classList.add('active');
    btnFemale.classList.remove('active');
});

btnFemale.addEventListener('click', () => {
    btnFemale.classList.add('active');
    btnMale.classList.remove('active');
});

// Lógica para Peso "Não sei"
const cbUnknownWeight = document.getElementById('cb-unknown-weight');
const inputWeight = document.getElementById('input-weight');

cbUnknownWeight.addEventListener('change', function() {
    inputWeight.disabled = this.checked;
    if(this.checked) inputWeight.value = '';
});