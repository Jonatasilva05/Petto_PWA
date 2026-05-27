export class VetController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    // Inicializa o Dashboard carregando todos os dados em paralelo
    async initDashboard() {
        try {
            const [metrics, consultas] = await Promise.all([
                this.model.getDashboardMetrics(),
                this.model.getConsultasHoje()
            ]);

            this.view.renderMetrics(metrics);
            this.view.renderConsultasHoje(consultas);
        } catch (error) {
            console.error('Erro ao inicializar painel do veterinário:', error.message);
        }
    }
}