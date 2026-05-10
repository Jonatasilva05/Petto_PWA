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

            const registration = await navigator.serviceWorker.register('./sw.js');

            console.log('✅ Service Worker ativo!');
            console.log('📦 Scope:', registration.scope);

        } catch (error) {

            console.error('❌ Erro ao registrar SW:', error);

        }

    });

}