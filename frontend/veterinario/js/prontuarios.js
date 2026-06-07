import { VetModel } from './models/VetModel.js';
import { VetView } from './view/VetView.js';
import { VetController } from './controllers/VetController.js';

document.addEventListener('DOMContentLoaded', () => {
    const model = new VetModel();
    const view = new VetView();
    const controller = new VetController(model, view);

    // Inicializa a página de prontuários
    if (typeof controller.initProntuariosPage === 'function') {
        controller.initProntuariosPage();
    } else {
        console.warn('O método initProntuariosPage não foi encontrado no VetController.');
    }
});

document.addEventListener("diagnostico-assistido-concluido", (e) => {
  document.getElementById("prontuario-diagnostico").value = e.detail.diagnostico;
  document.getElementById("prontuario-motivo").value = e.detail.sintomas.join(", ");
});