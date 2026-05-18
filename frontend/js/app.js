import { AuthModel } from './models/AuthModel.js';
import { AuthView } from './view/AuthView.js';
import { AuthController } from './controllers/AuthController.js';

import { PetModel } from './models/PetModel.js';
import { PetView } from './view/PetView.js';
import { PetController } from './controllers/PetController.js';

/* =========================================
   INSTÂNCIAS MVC
========================================= */

// Pet Controller
const petApp = new PetController(
    new PetModel(),
    new PetView()
);

// Auth Controller
const authApp = new AuthController(
    new AuthModel(),
    new AuthView(),
    petApp
);

// Injeta AuthController no PetController
petApp.authController = authApp;

/* =========================================
   SERVICE WORKER
========================================= */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Caminho voltando para a raiz do frontend
            const registration = await navigator.serviceWorker.register('../sw.js');
            console.log('✅ Service Worker ativo!');
            console.log('📦 Scope:', registration.scope);
        } catch (error) {
            console.error('❌ Erro ao registrar SW:', error);
        }
    });
}

// Captura o clique no botão de registrar
document.getElementById('btn-register-final').addEventListener('click', async (e) => {
    e.preventDefault();

    // Verifica se a checkbox de veterinário está marcada
    const isVet = document.getElementById('reg-is-vet').checked;

    // Monta o objeto base
    const data = {
        nome: document.getElementById('reg-nome').value,
        email: document.getElementById('reg-email').value,
        senha: document.getElementById('reg-password').value,
        pet_primario: document.getElementById('reg-pet-primario').value,
        cor_favorita: document.getElementById('reg-cor-favorita').value,
        is_vet: isVet
    };

    // Se for veterinário, adiciona os campos extras
    if (isVet) {
        data.cpf = document.getElementById('reg-cpf').value;
        data.crmv = document.getElementById('reg-crmv').value;
        data.clinica = document.getElementById('reg-clinica').value;
        data.cep = document.getElementById('reg-cep').value;
        data.endereco = document.getElementById('reg-endereco').value;
        data.bairro = document.getElementById('reg-bairro').value;
        data.numero = document.getElementById('reg-numero').value;
    }

    try {
        // Envia os dados para o seu Controller PHP
        // Ajuste a URL abaixo para o caminho correto na sua estrutura MVC
        const response = await fetch('api/controllers/RegistrarController.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.sucesso) {
            // Aqui você pode chamar a função do seu toast-container
            alert('Conta criada com sucesso! Redirecionando...'); 
            window.location.href = '../../index.html'; // Volta para o login
        } else {
            alert('Erro ao registrar: ' + result.erro);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
});

