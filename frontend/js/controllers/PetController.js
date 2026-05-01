export class PetController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async loadDashboard() {
        this.view.showSkeleton();
        try {
            const pets = await this.model.getPets();
            this.view.renderPets(pets);
        } catch (error) {
            console.error(error.message);
        }
    }
}