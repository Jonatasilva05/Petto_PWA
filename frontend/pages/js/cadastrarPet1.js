import { PetModel } from '../../js/models/PetModel.js';
import { PetView } from '../../js/view/PetView.js';
import { PetController } from '../../js/controllers/PetController.js';

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa o MVC. O PetController vai detectar que está na etapa 1 e ativar os binds.
    const petController = new PetController(new PetModel(), new PetView());

    // NOVA LÓGICA: Recupera os dados caso a câmera tenha forçado o recarregamento
    const draft = JSON.parse(sessionStorage.getItem('petCadastroDraft'));
    if (draft) {
        if (draft.nome) document.getElementById('pet-nome').value = draft.nome;
        if (draft.especie && draft.especie !== 'Selecione...') document.getElementById('txt-especie').textContent = draft.especie;
        if (draft.raca && draft.raca !== 'Selecione...') document.getElementById('txt-raca').textContent = draft.raca;
    }

    // NOVA LÓGICA: Recupera a foto que acabou de ser tirada e guardada temporariamente
    const tempFoto = sessionStorage.getItem('tempFotoBase64');
    if (tempFoto) {
        const previewImage = document.getElementById('pet-photo-preview');
        const placeholder = document.getElementById('photo-placeholder');
        if (previewImage && placeholder) {
            previewImage.src = tempFoto;
            previewImage.style.display = 'block';
            placeholder.style.display = 'none';
        }
    }

    // Captura o botão de avançar
    const btnNext = document.getElementById('btn-next');

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            // 1. Captura os valores preenchidos
            const nomePet = document.getElementById('pet-nome').value.trim();
            const especiePet = document.getElementById('txt-especie').innerText.trim();
            const racaPet = document.getElementById('txt-raca').innerText.trim();

            // Validação simples
            if (!nomePet || especiePet === 'Selecione...' || racaPet === 'Selecione...') {
                alert('Por favor, preencha o nome, espécie e raça do pet antes de avançar.');
                return;
            }

            // 2. Salva os dados no sessionStorage (para não perder ao trocar de página)
            const petData = JSON.parse(sessionStorage.getItem('petCadastroTemp')) || {};
            petData.nome = nomePet;
            petData.especie = especiePet;
            petData.raca = racaPet;
            sessionStorage.setItem('petCadastroTemp', JSON.stringify(petData));

            // Limpa o draft pois já vamos avançar com sucesso
            sessionStorage.removeItem('petCadastroDraft');

            // 3. Redireciona para a Etapa 2
            window.location.href = 'cadastrarPet2.html';
        });
    }
});