import { PetModel } from '../../js/models/PetModel.js';
import { PetView } from '../../js/view/PetView.js';
import { PetController } from '../../js/controllers/PetController.js';

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa o controlador principal do MVC
    new PetController(new PetModel(), new PetView());

    // Mantém apenas os comportamentos visuais de esconder/mostrar campos nesta tela
    const cbUnknownDate = document.getElementById('cb-unknown-date');
    const inputBirthDate = document.getElementById('input-birth-date');
    const approxAgeSection = document.getElementById('approx-age-section');
    const labelApproxMain = document.getElementById('label-approx-main');
    const labelApproxSub = document.getElementById('label-approx-sub');

    cbUnknownDate?.addEventListener('change', function() {
        if (this.checked) {
            if (inputBirthDate) { inputBirthDate.disabled = true; inputBirthDate.value = ''; }
            approxAgeSection?.classList.add('active');
        } else {
            if (inputBirthDate) inputBirthDate.disabled = false;
            approxAgeSection?.classList.remove('active');
        }
    });

    document.getElementById('btn-months')?.addEventListener('click', () => {
        document.getElementById('btn-months').classList.add('active');
        document.getElementById('btn-years').classList.remove('active');
        if (labelApproxMain) labelApproxMain.textContent = 'Meses aproximados';
        if (labelApproxSub) labelApproxSub.textContent = 'e Dias (opcional)';
    });

    document.getElementById('btn-years')?.addEventListener('click', () => {
        document.getElementById('btn-years').classList.add('active');
        document.getElementById('btn-months').classList.remove('active');
        if (labelApproxMain) labelApproxMain.textContent = 'Anos aproximados';
        if (labelApproxSub) labelApproxSub.textContent = 'e Meses (opcional)';
    });

    const cbUnknownMonths = document.getElementById('cb-unknown-months');
    const inputApproxMonths = document.getElementById('input-approx-months');
    cbUnknownMonths?.addEventListener('change', function() {
        if (inputApproxMonths) inputApproxMonths.disabled = this.checked;
        if (this.checked && inputApproxMonths) inputApproxMonths.value = '';
    });

    const cbUnknownWeight = document.getElementById('cb-unknown-weight');
    const inputWeight = document.getElementById('input-weight');
    cbUnknownWeight?.addEventListener('change', function() {
        if (inputWeight) inputWeight.disabled = this.checked;
        if (this.checked && inputWeight) inputWeight.value = '';
    });
});