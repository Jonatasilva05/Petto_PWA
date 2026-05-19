const API_BASE_URL = 'http://localhost:3000/api/auth'; 
const userId = localStorage.getItem('userId');

// Função visual do toggle de biometria
function toggleBiometria(element) {
    const bg = element.querySelector('.toggle-bg');
    const circle = element.querySelector('.toggle-circle');
    if (bg.classList.contains('bg-cyan-500')) {
    bg.classList.remove('bg-cyan-500'); bg.classList.add('bg-gray-300');
    circle.classList.remove('ml-auto');
    } else {
    bg.classList.remove('bg-gray-300'); bg.classList.add('bg-cyan-500');
    circle.classList.add('ml-auto');
    }
}

// Lógica para Trocar Senha com o Backend
async function abrirModalTrocaSenha() {
    if (!userId) {
    return Swal.fire('Erro', 'Usuário não autenticado.', 'error');
    }

    const { value: formValues } = await Swal.fire({
    title: 'Alterar Senha',
    html:
        '<input id="swal-senha-atual" type="password" class="swal2-input" placeholder="Senha Atual">' +
        '<input id="swal-nova-senha" type="password" class="swal2-input" placeholder="Nova Senha">' +
        '<input id="swal-confirma-senha" type="password" class="swal2-input" placeholder="Confirme a Nova Senha">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: '#06b6d4',
    confirmButtonText: 'Atualizar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
        const atual = document.getElementById('swal-senha-atual').value;
        const nova = document.getElementById('swal-nova-senha').value;
        const confirma = document.getElementById('swal-confirma-senha').value;

        if (!atual || !nova || !confirma) {
        Swal.showValidationMessage('Por favor, preencha todos os campos!');
        return false;
        }
        if (nova !== confirma) {
        Swal.showValidationMessage('A nova senha e a confirmação não conferem!');
        return false;
        }
        return { atual, nova };
    }
    });

    if (formValues) {
    try {
        Swal.fire({ title: 'Aguarde...', didOpen: () => Swal.showLoading() });

        const response = await fetch(`${API_BASE_URL}/alterar-senha/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            senhaAtual: formValues.atual,
            novaSenha: formValues.nova
        })
        });

        const data = await response.json();

        if (response.ok) {
        Swal.fire('Pronto!', data.message, 'success');
        } else {
        Swal.fire('Erro', data.message, 'error');
        }
    } catch (error) {
        Swal.fire('Erro', 'Falha na conexão com o servidor.', 'error');
    }
    }
}