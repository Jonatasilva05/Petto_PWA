export class PetController {
    constructor(model, view, authController) {
        this.model = model;
        this.view = view;
        this.authController = authController; // Usado para acessar view.switchScreen

        this.initBinds();
    }

    initBinds() {
        // Clicou no botão gigante "Adicionar Pet" na Home
        document.getElementById('btn-go-add-pet')?.addEventListener('click', () => {
            this.authController.view.switchScreen('cadastrar-pet-view');
        });

        // Clicou no botão "Voltar" na tela de cadastro
        document.getElementById('btn-back-home')?.addEventListener('click', () => {
            this.authController.view.switchScreen('tutor');
        });

        // (Fake click para a foto)
        document.getElementById('pet-photo-preview')?.addEventListener('click', () => {
            document.getElementById('reg-pet-foto')?.click();
        });

        // Enviar o formulário
        document.getElementById('btn-save-pet')?.addEventListener('click', this.handleSavePet.bind(this));
    }

    async loadDashboard() {
        this.view.showSkeleton();
        try {
            const pets = await this.model.getPets();
            // Passamos a função do que acontece quando clica no botão "Carteira"
            this.view.renderPets(pets, (petId) => {
                // Futuramente: this.authController.view.switchScreen('vacinacao');
                console.log('Ir para carteira do pet: ', petId);
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    async handleSavePet() {
        // Coleta os dados do formulário de forma simples
        const nome = document.getElementById('reg-pet-nome').value;
        const especie = document.getElementById('reg-pet-especie').value;
        const raca = document.getElementById('reg-pet-raca').value;
        
        if(!nome || !especie) {
            alert('Nome e Espécie são obrigatórios!');
            return;
        }

        // Simulação de salvar (depois integramos com o FormData pro backend)
        this.authController.view.showToast('Pet salvo com sucesso!', 'success');
        this.authController.view.switchScreen('tutor');
        await this.loadDashboard(); // Recarrega a lista para mostrar o novo pet
    }
}