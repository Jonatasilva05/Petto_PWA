import { PetModel } from '../../js/models/PetModel.js';
import { PetView } from '../../js/view/PetView.js';
import { PetController } from '../../js/controllers/PetController.js';

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa o MVC. O controlador vai injetar os medicamentos e gerenciar o botão Finalizar Cadastro.
    new PetController(new PetModel(), new PetView());

    // Mantém a troca visual dos botões de opção (Sim, Não, Não Sei)
    const optionButtons = document.querySelectorAll(".btn-option");
    optionButtons.forEach(button => {
        button.addEventListener("click", () => {
            optionButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
});