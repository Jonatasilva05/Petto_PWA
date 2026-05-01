import { AuthModel } from './models/AuthModel.js';
import { AuthView } from './view/AuthView.js'; 
import { AuthController } from './controllers/AuthController.js';
import { PetModel } from './models/PetModel.js';
import { PetView } from './view/PetView.js';
import { PetController } from './controllers/PetController.js';

const petApp = new PetController(new PetModel(), new PetView());

// Registrar o Service Worker (Essencial para PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registrado com sucesso!'))
      .catch(err => console.log('Falha ao registrar o SW:', err));
  });
}

// Inicializar o MVC de Autenticação
const authApp = new AuthController(new AuthModel(), new AuthView());