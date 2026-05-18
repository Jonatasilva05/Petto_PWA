import { PetModel } from '../../js/models/PetModel.js';
import { PetView } from '../../js/view/PetView.js';
import { PetController } from '../../js/controllers/PetController.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificação de Segurança
    const token = localStorage.getItem('auth-token-petto');
    const name = localStorage.getItem('user-name');

    if (!token) {
        window.location.href = '../index.html'; 
        return;
    }

    // 2. Preenche o nome do tutor na interface
    const nameDisplay = document.getElementById('tutor-name-display');
    if (nameDisplay) nameDisplay.innerText = name;

    // 3. Mock básico do AuthController apenas para evitar erros de navegação do PetController
    const mockAuthController = {
        view: { switchScreen: () => {} }
    };

    // 4. Inicializa os Pets conectando ao Banco de Dados REAL
    const petApp = new PetController(new PetModel(), new PetView(), mockAuthController);
    await petApp.loadDashboard();

    // 5. Configura o Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
        localStorage.removeItem('auth-token-petto');
        localStorage.removeItem('user-role');
        localStorage.removeItem('user-name');
        window.location.href = '../index.html';
    });

    // ==========================================
    // 6. NAVEGAÇÃO: REDIRECIONAMENTO DO CALENDÁRIO
    // ==========================================
    // Seleciona a div .nav-item que contém o ícone do calendário
    const calendarNavItem = document.querySelector('.bottom-nav .fa-calendar-days')?.closest('.nav-item');
    
    if (calendarNavItem) {
        calendarNavItem.style.cursor = 'pointer'; // Garante o feedback visual de clique
        calendarNavItem.addEventListener('click', () => {
            window.location.href = './pets/agendarConsulta.html';
        });
    }
});