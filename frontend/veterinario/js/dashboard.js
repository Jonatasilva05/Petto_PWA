import { VetModel } from './models/VetModel.js';
import { VetView } from './view/VetView.js';
import { VetController } from './controllers/VetController.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new VetController(new VetModel(), new VetView());
    app.initDashboard();
});