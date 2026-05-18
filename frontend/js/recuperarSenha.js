document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Função global para exibir os alertas bonitos com SweetAlert2
    const showToast = (msg, type = 'error') => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({ text: msg, icon: type, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        } else {
            alert(msg);
        }
    };

    // ==========================================
    // TELA 1: recupSenha1.html (E-mail)
    // ==========================================
    if (path.includes('recupSenha1.html')) {
        // Esconde a parte de segurança que está hardcoded no HTML1, pois usaremos a tela 2
        const screenSecurity = document.getElementById('screen-security');
        if (screenSecurity) screenSecurity.style.display = 'none';

        const btnContinuar = document.querySelector('#screen-email .btn');
        const btnBack = document.querySelector('.back-btn');
        
        // Seta de voltar: vai para a tela de login
        if (btnBack) btnBack.addEventListener('click', () => window.location.href = '../../index.html');

        if (btnContinuar) {
            // Remove o atributo onclick="mostrarVerificacao()" que estava no HTML
            btnContinuar.removeAttribute('onclick'); 
            
            btnContinuar.addEventListener('click', async (e) => {
                e.preventDefault();
                const email = document.querySelector('#screen-email input').value.trim();
                if (!email) return showToast('Digite seu e-mail.');

                try {
                    // Chama a rota do seu backend Node
                    const res = await fetch('/api/auth/verificar-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    const data = await res.json();
                    
                    if (res.ok && data.exists) {
                        localStorage.setItem('recup_email', email); // Salva o e-mail na memória
                        window.location.href = 'recupSenha2.html'; // Avança pra tela 2
                    } else {
                        showToast(data.message || 'E-mail não encontrado.');
                    }
                } catch (error) {
                    showToast('Erro ao comunicar com o servidor.');
                }
            });
        }
    }

    // ==========================================
    // TELA 2: recupSenha2.html (Primeiro Pet)
    // ==========================================
    if (path.includes('recupSenha2.html')) {
        const email = localStorage.getItem('recup_email');
        if (!email) return window.location.href = 'recupSenha1.html'; // Bloqueia acesso direto

        const btnVerificar = document.querySelector('.bottom .btn');
        const btnEsqueci = document.querySelector('.forgot');
        const btnBack = document.querySelector('.back-btn');

        // Navegação
        if (btnBack) btnBack.addEventListener('click', () => window.location.href = 'recupSenha1.html');
        if (btnEsqueci) btnEsqueci.addEventListener('click', () => window.location.href = 'recupSenha3.html');

        if (btnVerificar) {
            btnVerificar.addEventListener('click', async () => {
                const resposta = document.querySelector('.input-group input').value.trim();
                if (!resposta) return showToast('Digite o nome do pet.');

                try {
                    const res = await fetch('/api/auth/verificar-resposta', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, tipo_pergunta: 'pet', resposta })
                    });
                    const data = await res.json();
                    
                    if (res.ok && data.token) {
                        localStorage.setItem('recup_token', data.token); // Salva o token temporário de 10 min
                        window.location.href = 'confirmSenhaNova.html'; // Pula direto pra redefinição!
                    } else {
                        showToast('Resposta incorreta. Tente novamente ou clique em "Esqueci a resposta".');
                    }
                } catch (error) {
                    showToast('Erro ao verificar resposta.');
                }
            });
        }
    }

    // ==========================================
    // TELA 3: recupSenha3.html (Cor Favorita - Falha de Segurança)
    // ==========================================
    if (path.includes('recupSenha3.html')) {
        const email = localStorage.getItem('recup_email');
        if (!email) return window.location.href = 'recupSenha1.html';

        const btnVerificar = document.querySelector('.bottom .btn');
        const btnBack = document.querySelector('.back-btn');

        if (btnBack) btnBack.addEventListener('click', () => window.location.href = 'recupSenha2.html');

        if (btnVerificar) {
            btnVerificar.addEventListener('click', async () => {
                const resposta = document.querySelector('.input-box input').value.trim();
                if (!resposta) return showToast('Digite sua cor favorita.');

                try {
                    const res = await fetch('/api/auth/verificar-resposta', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, tipo_pergunta: 'cor', resposta })
                    });
                    const data = await res.json();
                    
                    if (res.ok && data.token) {
                        localStorage.setItem('recup_token', data.token);
                        window.location.href = 'confirmSenhaNova.html';
                    } else {
                        showToast('Resposta incorreta. Tentativas esgotadas.');
                    }
                } catch (error) {
                    showToast('Erro ao verificar resposta.');
                }
            });
        }
    }

    // ==========================================
    // TELA 4: confirmSenhaNova.html
    // ==========================================
    if (path.includes('confirmSenhaNova.html')) {
        const token = localStorage.getItem('recup_token');
        if (!token) {
            showToast('Acesso negado. Faça a verificação de segurança primeiro.');
            setTimeout(() => window.location.href = 'recupSenha1.html', 2000);
            return;
        }

        // AÇÃO DO BOTÃO HOME: Limpa a sessão de recuperação e volta para o login
        const btnHome = document.querySelector('.home-btn');
        if (btnHome) {
            btnHome.addEventListener('click', () => {
                localStorage.removeItem('recup_email');
                localStorage.removeItem('recup_token');
                window.location.href = '../../index.html';
            });
        }

        // Configuração dos ícones de mostrar/ocultar senha
        const eyes = document.querySelectorAll('.eye');
        const inputs = document.querySelectorAll('.input-group input');
        eyes.forEach((eye, index) => {
            eye.addEventListener('click', () => {
                const input = inputs[index];
                if (input.type === 'password') {
                    input.type = 'text';
                    eye.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    eye.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        });

        const btnSalvar = document.querySelector('.btn');
        
        if (btnSalvar) {
            btnSalvar.addEventListener('click', async () => {
                const novaSenha = inputs[0].value;
                const confirmSenha = inputs[1].value;

                if (!novaSenha || novaSenha !== confirmSenha) {
                    return showToast('As senhas não coincidem ou estão vazias.');
                }

                try {
                    const res = await fetch('/api/auth/redefinir-senha', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token, novaSenha })
                    });
                    const data = await res.json();
                    
                    if (res.ok) {
                        showToast('Senha redefinida com sucesso!', 'success');
                        localStorage.removeItem('recup_email'); 
                        localStorage.removeItem('recup_token');
                        
                        setTimeout(() => window.location.href = '../../index.html', 2000);
                    } else {
                        showToast(data.message || 'A senha não atende aos requisitos.');
                    }
                } catch (error) {
                    showToast('Erro ao redefinir a senha.');
                }
            });
        }
    }
});