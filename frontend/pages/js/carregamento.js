const progressBar = document.getElementById("progressBar");
const percentText = document.getElementById("percent");

// Elementos dinâmicos que adicionamos ID no HTML
const mobileFrame = document.querySelector(".mobile-frame");
const brandSubtitle = document.getElementById("brand-subtitle");
const featuresContainer = document.getElementById("features-container");
const loadingText = document.getElementById("loading-text");

// Pegamos o papel do usuário salvo pelo AuthController
const role = localStorage.getItem("user-role") || "tutor";

// CONFIGURAÇÃO DA CONDIÇÃO: Se for veterinário, adaptamos a tela antes de iniciar a barra
if (role === "veterinario") {
    // 1. Adiciona uma classe no frame para mudar o fundo e cores via CSS
    mobileFrame.classList.add("vet-mode");

    // 2. Altera os textos para o contexto profissional
    brandSubtitle.innerHTML = "Portal exclusivo para <span>Veterinários</span>";
    loadingText.innerText = "Preparando consultório...";

    // 3. Altera a lista de ícones/features para a versão médica
    featuresContainer.innerHTML = `
        <div class="feature-item">
            <i class="fa-solid fa-stethoscope"></i>
            <p>Clínica</p>
        </div>
        <div class="feature-divider"></div>
        <div class="feature-item">
            <i class="fa-solid fa-notes-medical"></i>
        </div>
        <div class="feature-divider"></div>
        <div class="feature-item">
            <i class="fa-solid fa-calendar-check"></i>
            <p>Agenda</p>
        </div>
    `;
}

// Animação da barra (idêntica para ambos, mantendo a performance)
let progress = 0;
const interval = setInterval(() => {
    progress++;

    progressBar.style.width = progress + "%";
    percentText.innerText = progress + "%";

    if (progress >= 100) {
        clearInterval(interval);

        // CONDIÇÃO DE REDIRECIONAMENTO FINAL
        if (role === "veterinario") {
            window.location.href = "../veterinario/dashboard.html"; // Vai para a pasta do vet
        } else {
            window.location.href = "./dashboard.html"; // Vai para o painel do tutor
        }
    }
}, 25);