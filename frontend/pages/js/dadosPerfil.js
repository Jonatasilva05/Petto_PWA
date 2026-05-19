const API_BASE_URL = '/api/auth'; 
const token = localStorage.getItem('auth-token-petto'); 
const userId = localStorage.getItem('userId') || 84; 

const inputsModificaveis = ['inputNome', 'inputTel', 'inputCpf', 'inputEndereco'];

// ==========================================
// CONTROLE INTERATIVO DO BOTTOM SHEET (UI)
// ==========================================
function abrirBottomSheetPerfil() {
    document.getElementById('overlayPerfil').classList.add('active');
    document.getElementById('sheetFotoPerfil').classList.add('active');
}

function fecharBottomSheetPerfil() {
    document.getElementById('overlayPerfil').classList.remove('active');
    document.getElementById('sheetFotoPerfil').classList.remove('active');
}

// Ouvintes principais da página
document.addEventListener("DOMContentLoaded", () => {
    const inputCamera = document.getElementById('input-camera-perfil');
    const inputGaleria = document.getElementById('input-gallery-perfil');
    const btnEditar = document.getElementById('btnEditar');

    if (inputCamera) inputCamera.addEventListener('change', (e) => gerenciarSelecaoImagem(e.target));
    if (inputGaleria) inputGaleria.addEventListener('change', (e) => gerenciarSelecaoImagem(e.target));
    
    if (btnEditar) {
        btnEditar.addEventListener('click', habilitarEdicao);
    }
    
    buscarDadosDoPerfil();
});

// Alterna os estados dos inputs para habilitar digitação
function habilitarEdicao() {
    inputsModificaveis.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.disabled = false;
            input.classList.remove('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
            input.classList.add('bg-gray-50', 'text-gray-700');
        }
    });
    document.getElementById('btnEditar').classList.add('hidden');
    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.classList.remove('hidden');
    btnSalvar.classList.add('flex');
}

// Retorna os inputs ao estado travado de segurança
function desabilitarEdicao() {
    inputsModificaveis.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.disabled = true;
            input.classList.remove('bg-gray-50', 'text-gray-700');
            input.classList.add('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        }
    });
    document.getElementById('btnSalvar').classList.add('hidden');
    document.getElementById('btnSalvar').classList.remove('flex');
    document.getElementById('btnEditar').classList.remove('hidden');
}

// ==========================================
// INTEGRAÇÃO DE SESSÃO E CARREGAMENTO (GET)
// ==========================================
async function buscarDadosDoPerfil() {
    if (!token) {
        Swal.fire('Erro', 'Usuário não autenticado. Faça login novamente.', 'error').then(() => {
            window.location.href = '../../index.html'; 
        });
        return;
    }

    try {
        const urlFinal = `${API_BASE_URL}/perfil/${userId}`;

        const response = await fetch(urlFinal, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const user = await response.json();

        if (response.ok) {
            document.getElementById('inputEmail').value = user.email || '';
            document.getElementById('inputNome').value = user.nome || '';
            document.getElementById('inputTel').value = user.telefone || '';
            document.getElementById('inputCpf').value = user.cpf || '';
            document.getElementById('inputEndereco').value = user.endereco || '';

            const imgEl = document.getElementById('avatar-img');
            const inicialEl = document.getElementById('avatar-inicial');

            // Renderiza a imagem salva na pasta de uploads de perfil do PWA
            if (user.foto_url) {
                imgEl.src = user.foto_url.startsWith('http') ? user.foto_url : `../../uploads/perfil/${user.foto_url}`;
                imgEl.classList.remove('hidden');
                inicialEl.classList.add('hidden');
            } else if (user.nome) {
                inicialEl.innerText = user.nome.charAt(0).toUpperCase();
                imgEl.classList.add('hidden');
                inicialEl.classList.remove('hidden');
            }
        } else if (response.status === 401 || response.status === 403) {
            window.location.href = '../../index.html';
        }
    } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
    }
}

// ==========================================
// SALVAR INFORMAÇÕES CADASTRAIS (PUT)
// ==========================================
document.getElementById('formDados').addEventListener('submit', async function(e) {
    e.preventDefault(); 
    
    const btn = document.getElementById('btnSalvar');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
    btn.disabled = true;

    const novosDados = {
        nome: document.getElementById('inputNome').value,
        telefone: document.getElementById('inputTel').value,
        cpf: document.getElementById('inputCpf').value,
        endereco: document.getElementById('inputEndereco').value
    };

    try {
        const urlFinal = `${API_BASE_URL}/perfil/${userId}`;

        const response = await fetch(urlFinal, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novosDados)
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('userName', novosDados.nome);
            const imgEl = document.getElementById('avatar-img');
            if (imgEl.classList.contains('hidden')) {
                document.getElementById('avatar-inicial').innerText = novosDados.nome.charAt(0).toUpperCase();
            }

            Swal.fire({ 
                title: 'Sucesso!', 
                text: 'Seus dados foram atualizados com segurança.', 
                icon: 'success', 
                confirmButtonColor: '#06b6d4' 
            });
            
            desabilitarEdicao(); // Trava os inputs novamente após salvar com sucesso
        } else {
            Swal.fire('Ops!', result.message || 'Erro ao atualizar dados.', 'error');
        }
    } catch (error) {
        Swal.fire('Erro', 'Incapaz de estabelecer comunicação estável.', 'error');
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Alterações';
        btn.disabled = false;
    }
});

// ==========================================
// PRÉ-VISUALIZAÇÃO E ENVIO DA FOTO (POST)
// ==========================================
async function gerenciarSelecaoImagem(input) {
    if (input.files && input.files[0]) {
        const arquivo = input.files[0];
        fecharBottomSheetPerfil();

        const reader = new FileReader();
        reader.onload = function(e) {
            const imgEl = document.getElementById('avatar-img');
            const inicialEl = document.getElementById('avatar-inicial');
            imgEl.src = e.target.result;
            imgEl.classList.remove('hidden');
            inicialEl.classList.add('hidden');
        };
        reader.readAsDataURL(arquivo);

        const formData = new FormData();
        formData.append('avatar', arquivo);

        try {
            const urlUpload = `${API_BASE_URL}/perfil/${userId}/avatar`;
            
            const response = await fetch(urlUpload, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const dados = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Foto Guardada!',
                    text: 'Sua foto foi gravada com sucesso dentro da pasta de perfis.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                if (dados.avatarUrl) localStorage.setItem('userAvatar', dados.avatarUrl);
            } else {
                Swal.fire('Ops!', dados.message || 'Erro ao processar imagem no servidor.', 'error');
            }
        } catch (error) {
            console.error("Erro no upload:", error);
            Swal.fire('Erro', 'Conexão interrompida com o servidor de mídias.', 'error');
        }
    }
}