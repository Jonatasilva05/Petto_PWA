export class PetController {
    constructor(model, view, authController) {
        this.model = model;
        this.view = view;
        this.authController = authController;

        this.initBinds();
    }

    initBinds() {
        // Clicou no FAB (Botão flutuante +)
        const btnFab = document.getElementById('btn-go-add-pet');
        if (btnFab) {
            btnFab.addEventListener('click', () => {
                window.location.href = './pets/cadastrarPet1.html';
            });
        }

        // Clicou no botão "Registrar primeiro pet" (quando a lista está vazia)
        const btnFirst = document.getElementById('btn-add-first');
        if (btnFirst) {
            btnFirst.addEventListener('click', () => {
                window.location.href = '../pages/cadastroPet/cadastrarPet1.html';
            });
        }
    }

    async loadDashboard() {
        this.view.showSkeleton();
        try {
            const pets = await this.model.getPets();
            
            this.view.renderPets(pets, (petId) => {
                console.log('Ir para carteira do pet: ', petId);
                // Futuramente: window.location.href = `./carteira.html?id=${petId}`;
            });
        } catch (error) {
            console.error(error.message);
        }
    }
}