document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. CARREGAR PERFIL (DR/DRA) E MENU
    // ==========================================
    const rawName = localStorage.getItem('user-name') || 'Veterinário';
    let formattedName = rawName;

    if (!rawName.toLowerCase().startsWith('dr')) {
        const firstName = rawName.split(' ')[0].toLowerCase();
        const nomesFemininos = ['thais', 'beatriz', 'raquel', 'carol', 'aline', 'maria', 'ana', 'sabrina'];
        formattedName = ((firstName.endsWith('a') || nomesFemininos.includes(firstName)) ? 'Dra. ' : 'Dr. ') + rawName;
    }

    const vetProfile = document.getElementById('vet-profile-name');
    const vetAvatar = document.getElementById('vet-profile-avatar');
    if (vetProfile) vetProfile.textContent = formattedName;
    if (vetAvatar) vetAvatar.textContent = rawName.charAt(0).toUpperCase();

    // Menu Suspenso e Logout
    const btnProfileMenu = document.getElementById('btn-profile-menu');
    const dropdownProfile = document.getElementById('dropdown-profile');

    if (btnProfileMenu && dropdownProfile) {
        btnProfileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownProfile.classList.toggle('hidden');
            dropdownProfile.classList.toggle('flex');
        });
        document.addEventListener('click', (e) => {
            if (!btnProfileMenu.contains(e.target) && !dropdownProfile.contains(e.target)) {
                dropdownProfile.classList.add('hidden');
                dropdownProfile.classList.remove('flex');
            }
        });
    }

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        if (confirm('Deseja realmente sair da conta?')) {
            localStorage.clear();
            window.location.href = '../index.html';
        }
    });

    // ==========================================
    // 2. BUSCAR E RENDERIZAR TUTORES DO BANCO
    // ==========================================
    const listaTutoresContainer = document.querySelector('.divide-y.divide-dark-border');
    const totalTutoresEl = document.querySelector('.max-w-2xl h3.text-2xl.font-bold');

    async function carregarListaTutores() {
        if (!listaTutoresContainer) return;
        listaTutoresContainer.innerHTML = '<div class="p-8 text-center text-gray-500">Carregando clientes...</div>';

        try {
            const token = localStorage.getItem('auth-token-petto');
            const response = await fetch('/api/vet/tutores', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha na busca.');

            const tutores = await response.json();

            // Atualiza o contador do cabeçalho
            if (totalTutoresEl) totalTutoresEl.textContent = tutores.length;

            renderizarHTML(tutores);
        } catch (error) {
            console.error(error);
            listaTutoresContainer.innerHTML = '<div class="p-8 text-center text-red-400">Erro ao carregar lista de clientes.</div>';
        }
    }

    function renderizarHTML(tutores) {
        listaTutoresContainer.innerHTML = '';

        if (tutores.length === 0) {
            listaTutoresContainer.innerHTML = '<div class="p-8 text-center text-gray-500">Nenhum cliente cadastrado ainda.</div>';
            return;
        }

        tutores.forEach(tutor => {
            const iniciais = tutor.nome.substring(0, 2).toUpperCase();
            const nomesPets = tutor.nomes_pets ? tutor.nomes_pets.split(', ') : [];

            let petsHtml = nomesPets.length > 0
                ? nomesPets.map(pet => `<span class="bg-dark-800 text-gray-400 border border-dark-border px-2 py-1 rounded text-xs font-medium"><i class="ph-fill ph-paw-print text-primary mr-1"></i> ${escapeHTML(pet)}</span>`).join('')
                : `<span class="text-xs text-gray-500">Nenhum pet registrado</span>`;

            const card = `
                <div class="grid grid-cols-[2fr_1.5fr_1.5fr_auto] gap-4 px-8 py-6 items-center card-hover glass-panel m-2 rounded-2xl border-none">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg shadow-inner">
                            ${iniciais}
                        </div>
                        <div>
                            <h4 class="font-bold text-white text-base">${escapeHTML(tutor.nome)}</h4>
                            <p class="text-xs text-gray-400 mt-0.5"><i class="ph-fill ph-map-pin"></i> ${escapeHTML(tutor.endereco || 'Endereço não informado')}</p>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-300">${escapeHTML(tutor.telefone || 'Sem telefone')}</p>
                        <p class="text-xs text-gray-500 mt-0.5">${escapeHTML(tutor.email)}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        ${petsHtml}
                    </div>
                    <div class="flex gap-2 justify-end">
                        <button class="btn-icon w-10 h-10 hover:text-primary hover:border-primary"><i class="ph ph-whatsapp-logo"></i></button>
                    </div>
                </div>
            `;
            listaTutoresContainer.insertAdjacentHTML('beforeend', card);
        });
    }

    // ==========================================
    // 3. LÓGICA DO MODAL (ABRIR, FECHAR E SALVAR)
    // ==========================================
    const modalTutor = document.getElementById('modalTutor');
    const formTutor = document.getElementById('formTutor');
    const panel = modalTutor?.querySelector('.glass-panel');

    const openModal = () => {
        if (!modalTutor) return;
        modalTutor.classList.remove('hidden');
        setTimeout(() => {
            modalTutor.classList.remove('opacity-0');
            panel.classList.remove('scale-95');
            panel.classList.add('scale-100');
        }, 10);
    };

    const closeModal = () => {
        if (!modalTutor) return;
        modalTutor.classList.add('opacity-0');
        panel.classList.remove('scale-100');
        panel.classList.add('scale-95');
        setTimeout(() => { modalTutor.classList.add('hidden'); }, 300);
    };

    document.getElementById('btnNovoTutor')?.addEventListener('click', openModal);
    document.getElementById('fecharModal')?.addEventListener('click', closeModal);
    document.getElementById('cancelarModal')?.addEventListener('click', closeModal);

    // Evita submissão ao apertar Enter
    document.querySelectorAll('#formTutor input').forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    });

    // EVENTO: Salvar o Novo Tutor no Banco de Dados
    formTutor?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSalvar = formTutor.querySelector('button[type="submit"]');
        const textoOriginal = btnSalvar.innerHTML;
        btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Salvando...';
        btnSalvar.disabled = true;

        // Captura os valores dos inputs mapeados na tela
        const inputs = formTutor.querySelectorAll('input');
        const enderecoCompleto = [inputs[4].value, inputs[5].value, inputs[6].value].filter(Boolean).join(', ');

        const payload = {
            nome: inputs[0].value,
            cpf: inputs[1].value,
            telefone: inputs[2].value,
            email: inputs[3].value,
            endereco_completo: enderecoCompleto
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
            if (!response.ok) throw new Error(data.message || 'Erro ao registrar tutor');

            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Tutor Cadastrado!', text: 'O cliente foi adicionado à sua clínica.', timer: 2500, showConfirmButton: false });
            }

            closeModal();
            formTutor.reset();

            // ATUALIZA A LISTA NA HORA SEM RECARREGAR A PÁGINA!
            await carregarListaTutores();

        } catch (error) {
            if (typeof Swal !== 'undefined') Swal.fire('Erro', error.message, 'error');
            else alert(error.message);
        } finally {
            btnSalvar.innerHTML = textoOriginal;
            btnSalvar.disabled = false;
        }
    });

    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
    }

    // Gatilho inicial ao abrir a página
    carregarListaTutores();
});