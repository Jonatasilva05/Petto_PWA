document.addEventListener('DOMContentLoaded', () => {
    // Bloqueio Global de Submit Acidental via Enter
    document.querySelectorAll('#formAgenda input, #formAgenda select').forEach(el => {
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter') e.preventDefault();
        });
    });

    // Controle do Modal
    const modal = document.getElementById('modalConsulta');
    const toggleModal = () => modal.classList.toggle('hidden');
    
    document.getElementById('btnNovaConsulta').addEventListener('click', toggleModal);
    document.getElementById('fecharModal').addEventListener('click', toggleModal);
    document.getElementById('cancelarModal').addEventListener('click', toggleModal);
});

document.addEventListener("DOMContentLoaded", () => {
    // 1. Pega o nome do arquivo atual da URL (ex: "pets.html")
    let currentPage = window.location.pathname.split("/").pop();
    
    // Se a URL estiver vazia (ex: localhost:3000/), assume que é o dashboard
    if (currentPage === "" || currentPage === "/") {
        currentPage = "dashboard.html"; // ou index.html, dependendo de como você chamou
    }

    // 2. Seleciona todos os links do menu lateral
    const menuLinks = document.querySelectorAll('.sidebar-item, .sidebar-active');

    // 3. Varre todos os links para ajustar o visual
    menuLinks.forEach(link => {
        const linkHref = link.getAttribute('href');

        // Garante que todo mundo comece apagado (remove active, adiciona item)
        link.classList.remove('sidebar-active');
        link.classList.add('sidebar-item');
        
        // Volta o ícone para a versão sem preenchimento (linha fina)
        const icon = link.querySelector('i');
        if (icon && icon.className.includes('ph-fill')) {
            icon.className = icon.className.replace('ph-fill', 'ph');
        }

        // 4. Se o link for o da página atual, ele acende!
        if (linkHref === currentPage) {
            link.classList.remove('sidebar-item');
            link.classList.add('sidebar-active');
            
            // Exceção de cor: O Centro Cirúrgico tem um layout vermelho
            if (currentPage === 'procedimentos.html') {
                link.classList.add('text-red-400', 'bg-red-500/10', 'border-red-500/20');
                if (icon) {
                    icon.className = icon.className.replace('ph ', 'ph-fill text-red-400 ');
                }
            } else {
                // Para os outros menus, preenche o ícone de verde
                if (icon) {
                    icon.className = icon.className.replace('ph ', 'ph-fill ');
                }
            }
        }
    });
});