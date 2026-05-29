document.addEventListener('DOMContentLoaded', () => {

    // 0. Carrega Perfil do Veterinário no Topo
    const rawName = localStorage.getItem('user-name') || 'Veterinário';
    let formattedName = rawName;
    if (!rawName.toLowerCase().startsWith('dr')) {
        const firstName = rawName.split(' ')[0].toLowerCase();
        const nomesFemininos = ['thais', 'beatriz', 'raquel', 'carol', 'aline', 'sabrina', 'stefani'];
        formattedName = (nomesFemininos.includes(firstName) || firstName.endsWith('a')) ? `Dra. ${rawName}` : `Dr. ${rawName}`;
    }

    const vetProfileName = document.getElementById('vet-profile-name');
    if (vetProfileName) vetProfileName.textContent = formattedName;

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

    // ==========================================
    // 1. RENDERIZAÇÃO DOS PACIENTES
    // ==========================================
    carregarPacientes();

    async function carregarPacientes() {
        const container = document.getElementById('lista-pets');
        const token = localStorage.getItem('auth-token-petto');
        if (!container) return;

        try {
            const response = await fetch('/api/vet/pacientes', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erro ao carregar dados do servidor.');
            const pacientes = await response.json();

            if (pacientes.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-16 border border-dashed border-dark-border rounded-3xl bg-dark-900/40 p-8">
                        <div class="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500 text-2xl">
                            <i class="ph ph-paw-print"></i>
                        </div>
                        <h4 class="text-lg font-bold text-white mb-1">Nenhum pet na sua base de dados</h4>
                        <p class="text-sm text-gray-400 max-w-md mx-auto mb-6">Você só verá os pets de tutores vinculados à sua conta. Use a busca por CPF para vincular um tutor existente.</p>
                    </div>`;
                return;
            }

            container.innerHTML = pacientes.map(pet => {
                let fotoURL = pet.foto_url;
                if (!fotoURL) {
                    fotoURL = (pet.especie && pet.especie.toLowerCase() === 'gato') ? 'https://placecats.com/500/300' : 'https://placedog.net/500/300';
                }

                const racaExibir = pet.raca || 'Sem raça definida';
                const idadeExibir = pet.idade_valor ? `${pet.idade_valor} ${pet.idade_unidade}` : 'Idade N/I';
                const pesoExibir = pet.peso ? `${pet.peso}kg` : 'N/I';

                return `
                <div class="glass-panel rounded-3xl p-0 card-hover flex flex-col overflow-hidden border border-dark-border bg-dark-900">
                    <div class="pet-cover h-40 relative overflow-hidden">
                        <img src="${fotoURL}" class="w-full h-full object-cover" />
                        <div class="pet-overlay absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-900/40 to-transparent"></div>
                        <div class="absolute top-4 right-4 z-10"><span class="badge badge-green"><i class="ph-fill ph-check-circle"></i> Sincronizado</span></div>
                    </div>
                    <div class="p-6 pt-0 flex-1 flex flex-col relative">
                        <div class="flex justify-between items-start">
                            <div class="w-20 h-20 rounded-2xl overflow-hidden border-4 border-dark-950 -mt-10 relative z-10 bg-dark-800">
                                <img src="${fotoURL}" class="w-full h-full object-cover" />
                            </div>
                            <div class="flex gap-2 mt-4">
                                <button onclick="editarPet(${pet.id_pet})" class="w-10 h-10 rounded-xl bg-dark-800 border border-dark-border text-gray-400 hover:text-primary transition-colors flex items-center justify-center">
                                    <i class="ph ph-pencil-simple"></i>
                                </button>
                            </div>
                        </div>

                        <div class="mt-4 mb-6">
                            <h3 class="text-2xl font-bold text-white tracking-tight">${pet.pet_nome}</h3>
                            <p class="text-sm text-gray-400 mt-1">${racaExibir} • ${idadeExibir}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-3 mb-6">
                            <div class="bg-dark-800 border border-dark-border rounded-xl p-3">
                                <p class="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Tutor(a)</p>
                                <p class="text-sm font-medium text-white truncate" title="${pet.tutor_nome}">${pet.tutor_nome}</p>
                            </div>
                            <div class="bg-dark-800 border border-dark-border rounded-xl p-3">
                                <p class="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Peso</p>
                                <p class="text-sm font-medium text-white">${pesoExibir}</p>
                            </div>
                        </div>

                        <div class="mt-auto pt-4 border-t border-dark-border flex items-center justify-between">
                            <span class="text-xs text-gray-500 flex items-center gap-1"><i class="ph ph-shield-check text-primary"></i> Prontuário Ativo</span>
                            <button class="text-primary text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">Prontuário <i class="ph-bold ph-arrow-right text-xs"></i></button>
                        </div>
                    </div>
                </div>`;
            }).join('');

        } catch (error) {
            container.innerHTML = `<div class="col-span-full text-center py-12 text-red-400"><i class="ph ph-warning text-2xl"></i><p class="mt-2">Erro ao conectar com a API.</p></div>`;
        }
    }

    // ==========================================
    // 2. MODAL VINCULAR POR CPF
    // ==========================================
    const modalBuscaCPF = document.getElementById('modalBuscaCPF');
    const panelBusca = modalBuscaCPF?.querySelector('.shadow-card');

    const abrirModalCPF = () => {
        formBuscaTutor?.classList.remove('hidden');
        formVincularPets?.classList.add('hidden');
        if (inputBusca) inputBusca.value = '';

        modalBuscaCPF?.classList.remove('hidden');
        setTimeout(() => { panelBusca?.classList.remove('opacity-0', 'scale-95'); panelBusca?.classList.add('scale-100'); }, 10);
    };

    const fecharModalCPF = () => {
        panelBusca?.classList.remove('scale-100');
        panelBusca?.classList.add('opacity-0', 'scale-95');
        setTimeout(() => modalBuscaCPF?.classList.add('hidden'), 300);
    };

    document.getElementById('btnBuscarCPF')?.addEventListener('click', abrirModalCPF);
    document.getElementById('fecharModalCPF')?.addEventListener('click', fecharModalCPF);

    const radiosTipoBusca = document.querySelectorAll('input[name="tipoBusca"]');
    const inputBusca = document.getElementById('inputBusca');
    radiosTipoBusca.forEach(radio => {
        radio.addEventListener('change', (e) => {
            inputBusca.value = '';
            inputBusca.placeholder = e.target.value === 'cpf' ? 'Digite o CPF...' : 'Digite o E-mail...';
            inputBusca.type = e.target.value === 'cpf' ? 'text' : 'email';
        });
    });

    inputBusca?.addEventListener('input', function (e) {
        if (document.querySelector('input[name="tipoBusca"]:checked')?.value === 'cpf') {
            let v = e.target.value.replace(/\D/g, '').substring(0, 11);
            v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = v;
        }
    });

    const formBuscaTutor = document.getElementById('formBuscaTutor');
    const formVincularPets = document.getElementById('formVincularPets');
    const btnBuscarTutor = document.getElementById('btnBuscarTutor');

    formBuscaTutor?.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnBuscarTutor.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Buscando...';

        try {
            const response = await fetch('/api/vet/buscar-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth-token-petto')}` },
                body: JSON.stringify({ tipo: document.querySelector('input[name="tipoBusca"]:checked').value, termo: inputBusca.value })
            });
            const data = await response.json();

            if (response.ok) {
                document.getElementById('tutorIdSelecionado').value = data.tutor.id;
                document.getElementById('resultadoTutorNome').textContent = data.tutor.nome;
                document.getElementById('resultadoTutorDetalhe').textContent = `${data.tutor.email} ${data.tutor.cpf ? '• CPF: ' + data.tutor.cpf : ''}`;

                const lista = document.getElementById('listaPetsResultado');
                if (data.pets.length === 0) {
                    lista.innerHTML = `<p class="text-sm text-gray-500 italic p-4 text-center">Nenhum pet cadastrado.</p>`;
                    document.getElementById('btnConfirmarVinculo').disabled = true;
                } else {
                    document.getElementById('btnConfirmarVinculo').disabled = false;
                    lista.innerHTML = data.pets.map(p => `
                        <label class="flex items-center gap-3 p-3 bg-dark-900 border border-dark-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                            <input type="checkbox" name="petSelecionado" value="${p.id_pet}" class="w-5 h-5 accent-primary">
                            <div><p class="text-white font-bold text-sm">${p.nome}</p><p class="text-xs text-gray-400">${p.especie}</p></div>
                        </label>`).join('');
                }
                formBuscaTutor.classList.add('hidden');
                formVincularPets.classList.remove('hidden');
            } else {
                if (typeof Swal !== 'undefined') Swal.fire('Ops', data.message, 'warning');
            }
        } catch (e) { console.log(e); }
        btnBuscarTutor.innerHTML = '<i class="ph-bold ph-magnifying-glass"></i> Buscar Tutor';
    });

    document.getElementById('btnVoltarBusca')?.addEventListener('click', abrirModalCPF);

    formVincularPets?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ids = Array.from(document.querySelectorAll('input[name="petSelecionado"]:checked')).map(cb => cb.value);
        if (ids.length === 0) return Swal.fire('Atenção', 'Selecione um pet.', 'warning');

        try {
            await fetch('/api/vet/vincular-tutor-pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth-token-petto')}` },
                body: JSON.stringify({ id_tutor: document.getElementById('tutorIdSelecionado').value, pets_ids: ids })
            });
            Swal.fire({ icon: 'success', title: 'Pronto!', timer: 2000, showConfirmButton: false });
            fecharModalCPF();
            carregarPacientes();
        } catch (e) { }
    });

    // ==========================================
    // 3. SUPER MODAL DO VETERINÁRIO (Cadastrar Pet e Clínico)
    // ==========================================
    const modalPet = document.getElementById('modalPet');
    const toggleModalPet = () => {
        modalPet?.classList.toggle('hidden');
        if (!modalPet.classList.contains('hidden')) carregarTutoresNoSelect();
    };

    document.getElementById('btnNovoPet')?.addEventListener('click', toggleModalPet);
    document.getElementById('fecharModal')?.addEventListener('click', toggleModalPet);
    document.getElementById('cancelarModal')?.addEventListener('click', toggleModalPet);

    const tabsBtn = document.querySelectorAll('.tab-btn');
    tabsBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            tabsBtn.forEach(b => b.classList.replace('text-primary', 'text-gray-500') || b.classList.replace('border-primary', 'border-transparent'));
            btn.classList.replace('text-gray-500', 'text-primary'); btn.classList.replace('border-transparent', 'border-primary');
            if (btn.getAttribute('data-tab') === 'dados-pet') {
                document.getElementById('tab-dados-pet').classList.remove('hidden');
                document.getElementById('tab-historico-clinico').classList.add('hidden');
            } else {
                document.getElementById('tab-dados-pet').classList.add('hidden');
                document.getElementById('tab-historico-clinico').classList.remove('hidden');
            }
        });
    });

    async function carregarTutoresNoSelect() {
        const select = document.getElementById('selectTutorNovoPet');
        try {
            const resp = await fetch('/api/vet/tutores', { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token-petto')}` } });
            const tutores = await resp.json();
            if (tutores.length === 0) select.innerHTML = '<option disabled selected>Nenhum tutor vinculado.</option>';
            else {
                select.innerHTML = '<option disabled selected>Selecione um tutor...</option>';
                tutores.forEach(t => select.innerHTML += `<option value="${t.id}">${t.nome}</option>`);
            }
        } catch (e) { }
    }

    document.getElementById('formSuperPet')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            id_tutor: document.getElementById('selectTutorNovoPet').value,
            nome: document.getElementById('novoPetNome').value,
            especie: document.getElementById('novoPetEspecie').value,
            raca: document.getElementById('novoPetRaca').value,
            idadeValor: document.getElementById('novoPetIdadeNum').value,
            idadeUnidade: document.getElementById('novoPetIdadeUnidade').value,
            peso: document.getElementById('novoPetPeso').value,
            sexo: document.getElementById('novoPetSexo').value,
            vacinas: [], medicamentos: [],
            prontuario_motivo: document.getElementById('histMotivo').value,
            prontuario_diagnostico: document.getElementById('histDiagnostico').value
        };
        const nomeVacina = document.getElementById('histVacinaNome').value;
        if (nomeVacina) payload.vacinas.push({ nome: nomeVacina, data_aplicacao: document.getElementById('histVacinaData').value });

        const btnSalvar = document.getElementById('btnSalvarSuperPet');
        btnSalvar.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Salvando...';

        try {
            const res = await fetch('/api/vet/cadastro-pet-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth-token-petto')}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Paciente Adicionado!', timer: 2000, showConfirmButton: false });
                toggleModalPet();
                document.getElementById('formSuperPet').reset();
                carregarPacientes();
            } else {
                Swal.fire('Erro', 'Preencha os campos obrigatórios', 'warning');
            }
        } catch (e) { console.log(e); }
        btnSalvar.innerHTML = '<i class="ph-bold ph-floppy-disk"></i> Salvar Paciente';
    });
}); 