import { AuthModel } from './models/AuthModel.js';
import { AuthView } from './view/AuthView.js'; 
import { AuthController } from './controllers/AuthController.js';

import { PetModel } from './models/PetModel.js';
import { PetView } from './view/PetView.js';
import { PetController } from './controllers/PetController.js';

// 1. Inicializa o Controller de Pets primeiro
const petApp = new PetController(new PetModel(), new PetView());

// 2. Inicializa o AuthController PASSANDO o petApp como dependência
// Isso permite que o AuthController mande carregar os pets após o login
const authApp = new AuthController(new AuthModel(), new AuthView(), petApp);

// 3. Registrar o Service Worker (Essencial para PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('✅ Service Worker Ativo!'))
      .catch(err => console.log('❌ Erro no SW:', err));
  });
}