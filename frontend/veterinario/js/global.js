document.addEventListener("DOMContentLoaded", () => {
    // Pega o nome do arquivo atual da URL (ex: "pets.html")
    const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
    
    // Seleciona todos os links da sidebar
    const navLinks = document.querySelectorAll('#main-nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // Se o href do link bater com a página atual
        if (linkHref === currentPage) {
            // Troca a classe para ativo
            link.classList.replace('sidebar-item', 'sidebar-active');
            
            // Tratamento especial para o Centro Cirúrgico que usa cor vermelha
            if(linkHref === 'procedimentos.html') {
                link.classList.add('text-red-400', 'bg-red-500/10', 'border-red-500/20');
                const icon = link.querySelector('i');
                if (icon) {
                    icon.className = icon.className.replace('ph ', 'ph-fill text-red-400 ');
                }
                return; // Sai do loop para essa exceção
            }

            // Para os demais, preenche o ícone do Phosphor
            const icon = link.querySelector('i');
            if (icon) {
                icon.className = icon.className.replace('ph ', 'ph-fill ');
            }
        }
    });
});