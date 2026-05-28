document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. VARIÁVEIS E ELEMENTOS GLOBAIS
    // ==========================================
    const modalTutor = document.getElementById('modalTutor');
    const formTutor = document.getElementById('formTutor');
    const panel = modalTutor?.querySelector('.scale-95');
    const btnNovoTutor = document.getElementById('btnNovoTutor');
    const fecharModal = document.getElementById('fecharModal');
    const cancelarModal = document.getElementById('cancelarModal');

    // ==========================================
    // 2. LÓGICA DO MODAL (ABRIR E FECHAR)
    // ==========================================
    const openModal = () => {
        if (!modalTutor) return;
        modalTutor.classList.remove('hidden');
        modalTutor.classList.add('flex');
        setTimeout(() => {
            modalTutor.classList.remove('opacity-0');
            if (panel) {
                panel.classList.remove('scale-95');
                panel.classList.add('scale-100');
            }
        }, 10);
    };

    const closeModal = () => {
        if (!modalTutor) return;
        modalTutor.classList.add('opacity-0');
        if (panel) {
            panel.classList.remove('scale-100');
            panel.classList.add('scale-95');
        }
        setTimeout(() => { 
            modalTutor.classList.add('hidden'); 
            modalTutor.classList.remove('flex');
        }, 300);
    };

    btnNovoTutor?.addEventListener('click', openModal);
    fecharModal?.addEventListener('click', closeModal);
    cancelarModal?.addEventListener('click', closeModal);

    // ==========================================
    // 3. ENVIO DO FORMULÁRIO (CADASTRO)
    // ==========================================
    if (formTutor) {
        formTutor.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnSubmit = formTutor.querySelector('button[type="submit"]');
            const originalBtnText = btnSubmit.innerHTML;
            
            btnSubmit.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Cadastrando...';
            btnSubmit.disabled = true;

            const payload = {
                nome: document.getElementById('tutor-nome').value,
                email: document.getElementById('tutor-email').value,
                cpf: document.getElementById('tutor-cpf').value,
                telefone: document.getElementById('tutor-telefone').value,
                endereco_completo: `${document.getElementById('tutor-rua').value}, ${document.getElementById('tutor-bairro').value} - ${document.getElementById('tutor-cidade').value}`
            };

            try {
                const token = localStorage.getItem('auth-token-petto');
                const response = await fetch('/api/vet/tutor', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Erro ao cadastrar.');

                Swal.fire({ 
                    icon: 'success', 
                    title: 'Sucesso!', 
                    text: 'Tutor cadastrado com sucesso!', 
                    background: '#151F25', 
                    color: '#fff' 
                });
                
                closeModal(); 
                formTutor.reset();
                carregarListaTutores(); // Atualiza a tabela
            } catch (error) {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Erro', 
                    text: error.message, 
                    background: '#151F25', 
                    color: '#fff' 
                });
            } finally {
                btnSubmit.innerHTML = originalBtnText;
                btnSubmit.disabled = false;
            }
        });
    }

    // ==========================================
    // 4. LÓGICA DE LISTAGEM (BUSCA TUTORES)
    // ==========================================
    async function carregarListaTutores() {
        const listaTutoresContainer = document.getElementById('lista-tutores-container');
        if (!listaTutoresContainer) return;
        
        try {
            const token = localStorage.getItem('auth-token-petto');
            const response = await fetch('/api/vet/tutores', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha na busca.');
            const tutores = await response.json();
            
            listaTutoresContainer.innerHTML = '';
            if (tutores.length === 0) {
                listaTutoresContainer.innerHTML = '<div class="p-8 text-center text-gray-500">Nenhum cliente encontrado.</div>';
                return;
            }

            tutores.forEach(tutor => {
                const iniciais = tutor.nome.substring(0, 2).toUpperCase();
                const card = `
                    <div class="grid grid-cols-[2fr_1.5fr_1.5fr_auto] gap-4 px-8 py-6 items-center card-hover glass-panel m-2 rounded-2xl border-none">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">${iniciais}</div>
                            <div>
                                <h4 class="font-bold text-white text-base">${escapeHTML(tutor.nome)}</h4>
                                <p class="text-xs text-gray-400"><i class="ph-fill ph-map-pin"></i> ${escapeHTML(tutor.endereco || 'Sem endereço')}</p>
                            </div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-300">${escapeHTML(tutor.telefone || 'Sem telefone')}</p>
                            <p class="text-xs text-gray-500">${escapeHTML(tutor.email)}</p>
                        </div>
                        <div><span class="bg-dark-800 text-gray-400 px-2 py-1 rounded text-xs">${tutor.total_pets || 0} pets</span></div>
                        <div class="flex gap-2 justify-end"><button class="btn-icon"><i class="ph ph-whatsapp-logo"></i></button></div>
                    </div>`;
                listaTutoresContainer.insertAdjacentHTML('beforeend', card);
            });
        } catch (error) {
            console.error(error);
        }
    }


    // ==========================================
    // 5. MÁSCARA E BUSCA AUTOMÁTICA DE CEP (ViaCEP)
    // ==========================================
    const inputCep = document.getElementById('tutor-cep');
    const inputRua = document.getElementById('tutor-rua');
    const inputBairro = document.getElementById('tutor-bairro');
    const inputCidade = document.getElementById('tutor-cidade');
    const cepLoader = document.getElementById('cep-loader');

    if (inputCep) {
        inputCep.addEventListener('input', async (e) => {
            let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número

            // Aplica a máscara 00000-000
            if (v.length > 5) {
                v = v.replace(/^(\d{5})(\d)/, "$1-$2");
            }
            e.target.value = v.substring(0, 9); // Limita a 9 caracteres no total

            // Dispara a busca quando o CEP está completo (8 números + 1 traço)
            if (e.target.value.length === 9) {
                const cepLimpo = v; // A variável 'v' já tem apenas os números

                // Exibe o ícone de carregamento
                if (cepLoader) {
                    cepLoader.classList.remove('hidden');
                }

                try {
                    // Consulta segura (HTTPS) à API do ViaCEP
                    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                    const data = await response.json();

                    if (data.erro) {
                        throw new Error('CEP não encontrado na base de dados.');
                    }

                    // Preenche os inputs automaticamente
                    if (inputRua) inputRua.value = data.logradouro || '';
                    if (inputBairro) inputBairro.value = data.bairro || '';
                    if (inputCidade) inputCidade.value = `${data.localidade} - ${data.uf}`;

                    // Direciona o cursor para o campo de Rua para o usuário preencher o número
                    if (inputRua) {
                        inputRua.focus();
                        // Dica de usabilidade: Se o logradouro já veio preenchido, adiciona uma vírgula para ele só colocar o número
                        if (data.logradouro) {
                            inputRua.value = data.logradouro + ', ';
                        }
                    }

                    // Feedback visual positivo no input de CEP
                    inputCep.classList.remove('border-red-500', 'text-red-500');
                    inputCep.classList.add('border-primary', 'text-primary');

                } catch (error) {
                    // Feedback visual negativo
                    inputCep.classList.remove('border-primary', 'text-primary');
                    inputCep.classList.add('border-red-500', 'text-red-500');

                    if (typeof Swal !== 'undefined') {
                        Swal.fire('Atenção', 'CEP não encontrado ou inválido.', 'warning');
                    } else {
                        alert('CEP não encontrado ou inválido.');
                    }

                    // Limpa os campos por segurança caso o CEP seja inválido
                    if (inputRua) inputRua.value = '';
                    if (inputBairro) inputBairro.value = '';
                    if (inputCidade) inputCidade.value = '';
                } finally {
                    // Esconde o ícone de carregamento independente de sucesso ou erro
                    if (cepLoader) {
                        cepLoader.classList.add('hidden');
                    }
                }
            } else {
                // Remove as cores de validação enquanto o usuário está apagando/digitando
                inputCep.classList.remove('border-primary', 'text-primary', 'border-red-500', 'text-red-500');
            }
        });
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
    }

    // Gatilho inicial ao abrir a página
    carregarListaTutores();
});