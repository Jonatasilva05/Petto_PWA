document.addEventListener("DOMContentLoaded", () => {
    // 1. Destaque da Aba Ativa na Sidebar
    const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
    const navLinks = document.querySelectorAll('#main-nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        if (linkHref === currentPage) {
            link.classList.replace('sidebar-item', 'sidebar-active');
            
            // Tratamento especial para o Centro Cirúrgico que usa cor vermelha
            if(linkHref === 'procedimentos.html') {
                link.classList.add('text-red-400', 'bg-red-500/10', 'border-red-500/20');
                const icon = link.querySelector('i');
                if (icon) {
                    icon.className = icon.className.replace('ph ', 'ph-fill text-red-400 ');
                }
                return; 
            }

            // Para os demais, preenche o ícone
            const icon = link.querySelector('i');
            if (icon) {
                icon.className = icon.className.replace('ph ', 'ph-fill ');
            }
        }
    });

    // 2. Lógica para o botão Sair da Conta (Logout)
    const btnLogout = document.getElementById('btn-logout');
    
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Confere se o Swal está carregado
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Sair da Conta',
                    text: 'Deseja realmente encerrar sua sessão?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444', 
                    cancelButtonColor: '#26343C',
                    confirmButtonText: '<i class="ph ph-sign-out"></i> Sim, sair',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        localStorage.removeItem('auth-token-petto');
                        localStorage.removeItem('user-role');
                        localStorage.removeItem('user-name');
                        window.location.href = '../index.html'; 
                    }
                });
            } else {
                // Fallback padrão se não tiver Swal
                if(confirm('Deseja realmente sair da conta?')) {
                    localStorage.removeItem('auth-token-petto');
                    localStorage.removeItem('user-role');
                    localStorage.removeItem('user-name');
                    window.location.href = '../index.html'; 
                }
            }
        });
    }
});