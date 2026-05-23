import { PetModel } from '../../js/models/PetModel.js';
import { PetView } from '../../js/view/PetView.js';
import { PetController } from '../../js/controllers/PetController.js';

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa o MVC. O PetController vai detectar que está na etapa 1 e ativar os binds.
    const petController = new PetController(new PetModel(), new PetView());

    // Captura o botão de avançar
    const btnNext = document.getElementById('btn-next');

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            // 1. Captura os valores preenchidos
            const nomePet = document.getElementById('pet-nome').value.trim();
            const especiePet = document.getElementById('txt-especie').innerText.trim();
            const racaPet = document.getElementById('txt-raca').innerText.trim();

            // Validação simples (opcional, mas recomendada)
            if (!nomePet || especiePet === 'Selecione...' || racaPet === 'Selecione...') {
                // Aqui você pode usar o seu showToast() do SweetAlert se ele for global, ou um alert simples
                alert('Por favor, preencha o nome, espécie e raça do pet antes de avançar.');
                return;
            }

            // 2. Salva os dados no sessionStorage (para não perder ao trocar de página de HTML)
            // Esses dados serão resgatados no PetController na última etapa (cadastrarPet4) para enviar ao banco
            const petData = JSON.parse(sessionStorage.getItem('petCadastroTemp')) || {};
            petData.nome = nomePet;
            petData.especie = especiePet;
            petData.raca = racaPet;
            sessionStorage.setItem('petCadastroTemp', JSON.stringify(petData));

            // 3. Redireciona para a Etapa 2
            window.location.href = 'cadastrarPet2.html';
        });
    }
});