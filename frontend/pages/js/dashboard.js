import { PetModel } from '../../js/models/PetModel.js';
import { PetView } from '../../js/view/PetView.js';
import { PetController } from '../../js/controllers/PetController.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificação de Segurança
    const token = localStorage.getItem('auth-token-petto');
    const name = localStorage.getItem('user-name');

    if (!token) {
        // Se o usuário tentar acessar a URL diretamente sem login, expulsa para a home
        window.location.href = '../index.html'; 
        return;
    }

    // 2. Preenche a interface
    const nameDisplay = document.getElementById('tutor-name-display');
    if (nameDisplay) nameDisplay.innerText = name;

    // 3. Mock do AuthController 
    // (Apenas para evitar erros nas chamadas do PetController que mudam de tela)
    const mockAuthController = {
        view: {
            switchScreen: (screenName) => {
                if (screenName === 'cadastrar-pet-view') {
                    // Futuramente: window.location.href = './cadastroPet.html'
                    alert('Navegar para a página de Cadastro de Pet');
                }
            }
        }
    };

    // 4. Inicializa os Pets
    const petApp = new PetController(new PetModel(), new PetView(), mockAuthController);
    await petApp.loadDashboard();

    // 5. Configura o Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
        localStorage.removeItem('auth-token-petto');
        localStorage.removeItem('user-role');
        localStorage.removeItem('user-name');
        window.location.href = '../index.html';
    });
});