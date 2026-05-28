function toggleSwitch(element) {
    const bg = element.querySelector('.toggle-bg');
    const circle = element.querySelector('.toggle-circle');
    
    if (bg.classList.contains('bg-cyan-500')) {
        bg.classList.remove('bg-cyan-500');
        bg.classList.add('bg-gray-300');
        circle.classList.remove('ml-auto');
    } else {
        bg.classList.remove('bg-gray-300');
        bg.classList.add('bg-cyan-500');
        circle.classList.add('ml-auto');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // URL da rota de autenticação do seu servidor Express
    const API_BASE_URL = 'http://localhost:3000/api/auth'; 

    // Recupera o ID do usuário e a Role guardados no localStorage durante o login
    // Usamos o ID 84 (seu usuário Jhon do banco) como fallback seguro para testes
    const userId = localStorage.getItem('userId') || 84; 
    const userRole = localStorage.getItem('userRole') || 'tutor'; 

    // Faz a requisição para a sua Rota 7 real
    fetch(`${API_BASE_URL}/perfil/${userId}`)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao buscar dados do perfil do servidor.');
            return response.json();
        })
        .then(user => {
            // 1. Atualiza os textos de Nome e E-mail vindos direto do seu pool do MySQL
            document.getElementById('perfil-nome').innerText = user.nome;
            document.getElementById('perfil-email').innerText = user.email;

            // 2. Define o tipo de plano baseado na role que veio do login
            const planoElement = document.getElementById('perfil-plano');
            if (planoElement) {
                planoElement.innerText = userRole === 'veterinario' ? 'Plano Vet Pro' : 'Plano Free';
            }

            // 3. Renderização inteligente do Avatar
            const avatarElement = document.getElementById('perfil-avatar');
            if (avatarElement) {
                if (user.foto_url) {
                    let caminhoImagem = '';
                    
                    // Verifica se é um registro antigo (com /uploads/ no banco) ou novo (gerado pelo seu Multer)
                    if (user.foto_url.startsWith('/uploads')) {
                        caminhoImagem = `..${user.foto_url}`;
                    } else {
                        // Novo padrão seguro do seu storagePerfil: guarda apenas o nome do arquivo
                        caminhoImagem = `../uploads/perfil/${user.foto_url}`;
                    }

                    avatarElement.innerHTML = `<img src="${caminhoImagem}" class="w-full h-full rounded-full object-cover" alt="Foto de Perfil">`;
                    avatarElement.classList.remove('bg-cyan-100', 'text-cyan-600', 'font-bold');
                } else {
                    // Fallback se o usuário não tiver foto: exibe a primeira letra do nome real do banco
                    avatarElement.innerText = user.nome.charAt(0).toUpperCase();
                }
            }
        })
        .catch(error => {
            console.error("Não foi possível carregar os dados reais:", error);
            // Fallback visual caso o servidor Express esteja offline ou reiniciando
            const nomeElement = document.getElementById('perfil-nome');
            if (nomeElement) nomeElement.innerText = "Usuário Offline";
        });
});

// Ação real do botão de Sair (Limpa o acesso para não logar direto)
document.getElementById('btn-logout-perfil')?.addEventListener('click', () => {
    localStorage.removeItem('auth-token-petto');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user-name');
    localStorage.removeItem('userId');
    window.location.href = '../index.html'; // Volta para a tela de login
});