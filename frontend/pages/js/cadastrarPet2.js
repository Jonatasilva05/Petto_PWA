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

// ==========================================
// INTEGRAÇÃO COM BACKEND (Finalizar Cadastro)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se os dados da Tela 1 existem. Se não, devolve o usuário.
    const step1Raw = sessionStorage.getItem('pet_cadastro_step1');
    if (!step1Raw) {
        window.location.href = './cadastrarPet1.html';
        return;
    }

    // Coloque um id="btn-finalizar" no seu botão "Avançar" no cadastrarPet2.html
    const btnFinalizar = document.querySelector('.btn-primary');
    
    btnFinalizar.addEventListener('click', async () => {
        const step1Data = JSON.parse(step1Raw);
        
        // Coleta Data de Nascimento ou Idade
        let data_nascimento = null;
        let idade_valor = null;
        let idade_unidade = null;

        if (!document.getElementById('cb-unknown-date').checked) {
            data_nascimento = document.getElementById('input-birth-date').value;
        } else {
            const inputAnos = document.querySelector('.input-with-toggles input').value;
            if (inputAnos) {
                idade_valor = inputAnos;
                idade_unidade = document.getElementById('btn-years').classList.contains('active') ? 'anos' : 'meses';
            }
        }

        // Coleta Sexo
        let sexo = null;
        if (document.getElementById('btn-male').classList.contains('active')) sexo = 'M';
        if (document.getElementById('btn-female').classList.contains('active')) sexo = 'F';

        // Coleta Peso e Cor
        const peso = document.getElementById('cb-unknown-weight').checked ? null : document.getElementById('input-weight').value.replace(',', '.');
        const cor = document.querySelectorAll('.form-group input[type="text"]')[1].value; // Pega o input de cor

        // Junta tudo num payload só
        const payload = {
            ...step1Data,
            data_nascimento,
            idade_valor,
            idade_unidade,
            sexo,
            peso,
            cor
        };

        // Pega o token do tutor logado
        const token = localStorage.getItem('auth-token-petto');

        try {
            const response = await fetch('/api/pets/cadastro', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Autenticação obrigatória!
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({ text: 'Pet cadastrado com sucesso!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                sessionStorage.removeItem('pet_cadastro_step1'); // Limpa a memória
                
                // Volta para o dashboard
                setTimeout(() => window.location.href = '../dashboard.html', 2000);
            } else {
                Swal.fire({ text: result.message, icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            }
        } catch (error) {
            Swal.fire({ text: 'Erro ao comunicar com o servidor.', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }
    });
});