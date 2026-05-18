export class PetController {
    constructor(model, view, authController) {
        this.model = model;
        this.view = view;
        this.authController = authController;
        this.initBinds();
    }

    initBinds() {
        document.getElementById('btn-go-add-pet')?.addEventListener('click', () => { window.location.href = './auth/cadastrarPet1.html'; });
        document.getElementById('btn-add-first')?.addEventListener('click', () => { window.location.href = './auth/cadastrarPet1.html'; });
        this.gerenciarCicloDeFormularios();
    }

    async loadDashboard() {
        this.view.showSkeleton();
        try {
            const pets = await this.model.getPets();
            this.view.renderPets(pets, (petId) => { console.log('Carteira do pet: ', petId); });
        } catch (error) { console.error(error.message); }
    }

    gerenciarCicloDeFormularios() {
        const path = window.location.pathname;
        const dadosEtapa1 = JSON.parse(localStorage.getItem('cadastro_pet_e1') || '{}');
        const especieDoPet = dadosEtapa1.especie ? dadosEtapa1.especie.toLowerCase() : null;

        // ==========================================
        // ETAPA 1: Nome, Espécie, Raça e Foto
        // ==========================================
        if (path.includes('cadastrarPet1.html')) {
            this.inicializarListasEtapa1();
            this.inicializarEventosFotoEtapa1();

            // Mude de 'btn-finish' para 'btn-next' aqui:
            document.getElementById('btn-next')?.addEventListener('click', () => {
                const nome = document.getElementById('pet-nome').value.trim();
                const especie = document.getElementById('txt-especie').textContent.trim();
                const raca = document.getElementById('txt-raca').textContent.trim();

                if (!nome || nome === "Ex: Bob" || especie === "Selecione...") {
                    alert("Por favor, preencha o nome e selecione uma espécie.");
                    return;
                }

                const previewImage = document.getElementById('pet-photo-preview');
                const fotoBase64 = previewImage && previewImage.style.display === 'block' ? previewImage.src : null;

                localStorage.setItem('cadastro_pet_e1', JSON.stringify({ nome, especie, raca, fotoBase64 }));
                window.location.href = 'cadastrarPet2.html';
            });
        }

        // ==========================================
        // ETAPA 2: Detalhes Físicos
        // ==========================================
        if (path.includes('cadastrarPet2.html')) {
            let sexo = '';
            let idadeUnidade = 'anos';

            const btnMacho = document.getElementById('btn-male');
            const btnFemea = document.getElementById('btn-female');
            btnMacho?.addEventListener('click', () => { sexo = 'M'; btnMacho.classList.add('active'); btnFemea?.classList.remove('active'); });
            btnFemea?.addEventListener('click', () => { sexo = 'F'; btnFemea.classList.add('active'); btnMacho?.classList.remove('active'); });

            document.getElementById('btn-months')?.addEventListener('click', () => { idadeUnidade = 'meses'; });
            document.getElementById('btn-years')?.addEventListener('click', () => { idadeUnidade = 'anos'; });
            
            // Corrige o botão de voltar para retornar à tela 1
            document.querySelector('.btn-secondary')?.addEventListener('click', () => { window.location.href = 'cadastrarPet1.html'; });

            // Corrige o botão avançar
            document.querySelector('.btn-primary')?.addEventListener('click', () => {
                const dataNascimento = document.getElementById('cb-unknown-date')?.checked ? null : document.getElementById('input-birth-date')?.value;
                const idValor = document.getElementById('input-age-value')?.value || null;
                const idMeses = document.getElementById('cb-unknown-months')?.checked ? null : document.getElementById('input-approx-months')?.value;
                const peso = document.getElementById('cb-unknown-weight')?.checked ? null : document.getElementById('input-weight')?.value;
                const cor = document.querySelector('.form-group input[placeholder*="Dourado"]')?.value || '';

                localStorage.setItem('cadastro_pet_e2', JSON.stringify({
                    dataNascimento, idValor, idadeUnidade, idMeses, peso, sexo, cor
                }));
                window.location.href = 'cadastrarPet3.html';
            });
        }

        // ==========================================
        // ETAPA 3: Vacinas Dinâmicas
        // ==========================================
        if (path.includes('cadastrarPet3.html')) {
            this.inicializarComponenteMedico('vaccines', especieDoPet, 'vacinasContainer', 'cadastro_pet_vacinas', 'cadastrarPet2.html', 'cadastrarPet4.html');
            this.configurarBotoesSimNao('vacinasContainer', 'toggleDropdown');
        }

        // ==========================================
        // ETAPA 4: Medicamentos Dinâmicos
        // ==========================================
        if (path.includes('cadastrarPet4.html')) {
            this.inicializarComponenteMedico('medications', especieDoPet, 'medicacoesContainer', 'cadastro_pet_meds', 'cadastrarPet3.html', null);
            this.configurarBotoesSimNao('medicacoesContainer', 'toggleDropdown');
        }
    }

    // Gerencia a abertura e captura das fotos na Etapa 1
    inicializarEventosFotoEtapa1() {
        window.openBottomSheet = (id) => {
            const dadosEtapa1 = JSON.parse(localStorage.getItem('cadastro_pet_e1') || '{}');
            if (id === 'sheet-raca' && (!dadosEtapa1.especie && document.getElementById('txt-especie').textContent.trim() === 'Selecione...')) {
                alert('Por favor, selecione uma espécie primeiro.');
                return;
            }
            document.getElementById('overlay')?.classList.add('active');
            document.getElementById(id)?.classList.add('active');
        };

        window.closeBottomSheet = () => {
            document.querySelectorAll('.bottom-sheet').forEach(el => el.classList.remove('active'));
            document.getElementById('overlay')?.classList.remove('active');
        };

        document.getElementById('overlay')?.addEventListener('click', window.closeBottomSheet);

        // Captura a imagem selecionada/tirada e gera o preview em Base64
        window.handlePhotoUpload = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewImage = document.getElementById('pet-photo-preview');
                    const placeholder = document.getElementById('photo-placeholder');
                    if (previewImage && placeholder) {
                        previewImage.src = e.target.result;
                        previewImage.style.display = 'block';
                        placeholder.style.display = 'none';
                    }
                    window.closeBottomSheet();
                };
                reader.readAsDataURL(file);
            }
        };

        // Conecta as ações dos botões dentro do Bottom Sheet de foto
        document.querySelector('#sheet-foto .btn-primary')?.addEventListener('click', () => {
            document.getElementById('input-camera').click();
        });
        document.querySelector('#sheet-foto .btn-secondary')?.addEventListener('click', () => {
            document.getElementById('input-gallery').click();
        });

        // Configura escuta de alteração nos inputs de arquivos
        document.getElementById('input-camera')?.addEventListener('change', window.handlePhotoUpload);
        document.getElementById('input-gallery')?.addEventListener('change', window.handlePhotoUpload);
    }

    async inicializarListasEtapa1() {
        try {
            const response = await fetch('../data/databasePets.json');
            if (!response.ok) return;
            const data = await response.json();
            const listaEspecies = document.getElementById('lista-especies');
            if (!listaEspecies) return;
            listaEspecies.innerHTML = '';

            data.forEach(especie => {
                const li = document.createElement('li');
                li.textContent = especie.label;
                li.onclick = () => {
                    document.getElementById('txt-especie').textContent = especie.label;
                    document.getElementById('txt-raca').textContent = 'Selecione...';
                    
                    // Atualiza dinamicamente o localStorage para liberar o clique da raça
                    localStorage.setItem('cadastro_pet_e1', JSON.stringify({ especie: especie.value }));

                    const listaRacas = document.getElementById('lista-racas');
                    if (listaRacas) {
                        listaRacas.innerHTML = '';
                        especie.breeds.forEach(b => {
                            const liB = document.createElement('li');
                            liB.textContent = b.label;
                            liB.onclick = () => { 
                                document.getElementById('txt-raca').textContent = b.label;
                                window.closeBottomSheet(); 
                            };
                            listaRacas.appendChild(liB);
                        });
                    }
                    window.closeBottomSheet();
                };
                listaEspecies.appendChild(li);
            });
        } catch (e) { console.error("Erro ao popular dados do pet:", e); }
    }

    async inicializarComponenteMedico(tipoDado, especieTarget, containerId, storageKey, urlVoltar, urlAvancar) {
        const dropdown = document.getElementById('dropdown');
        const container = document.getElementById(containerId);
        let itensSelecionados = [];

        if (!dropdown || !container) return;
        dropdown.innerHTML = '';

        try {
            const response = await fetch('../data/databaseMedi.json');
            if (!response.ok) throw new Error('Falha ao ler JSON médico.');
            const baseDados = await response.json();

            const dadosEspecie = baseDados.find(item => item.species_value.toLowerCase() === this.normalizarEspecie(especieTarget));
            const listaItens = dadosEspecie ? dadosEspecie[tipoDado] : [];

            if (listaItens.length === 0) {
                dropdown.innerHTML = `<div class="dropdown-item" style="color: #888; text-align:center; padding:10px;">Nenhum registro encontrado</div>`;
            } else {
                listaItens.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'dropdown-item';
                    div.setAttribute('data-id', item.id);
                    div.textContent = item.name;
                    dropdown.appendChild(div);
                });
            }
        } catch (error) { dropdown.innerHTML = `<div class="dropdown-item" style="color: red;">Erro ao carregar dados.</div>`; }

        // Abre/fecha dropdown
        document.getElementById('toggleDropdown')?.addEventListener('click', () => {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (!item || !item.getAttribute('data-id')) return;

            const idDataset = item.getAttribute('data-id');
            const nomeItem = item.textContent;

            if (!itensSelecionados.some(i => i.idDataset === idDataset)) {
                itensSelecionados.push({ idDataset, nome: nomeItem, data_aplicacao: null, data_desconhecida: 1 });
                container.innerHTML += `
                    <div style="background:#1e1e1e; padding:16px; margin-top:12px; border-radius:12px; border: 1px solid #333; color:#fff">
                        <p style="margin:0 0 8px 0; font-size:15px; font-weight:500;">${nomeItem}</p>
                        <input type="date" style="width:100%; padding:10px; border-radius:8px; border:1px solid #444; background:#121212; color:#fff;" class="date-picker-item" data-id="${idDataset}">
                    </div>`;
            }
            dropdown.style.display = 'none';
        });

        // Configuração dos botões Voltar
        document.querySelector('.voltar')?.addEventListener('click', () => { window.location.href = urlVoltar; });

        if (urlAvancar) {
            // Botão Avançar da Etapa 3
            document.querySelector('.avancar')?.addEventListener('click', () => {
                this.coletarDatasDinamicas(itensSelecionados, container);
                localStorage.setItem(storageKey, JSON.stringify(itensSelecionados));
                window.location.href = urlAvancar;
            });
        } else {
            
            document.querySelector('.finalizar')?.addEventListener('click', async () => {
                this.coletarDatasDinamicas(itensSelecionados, container);
                
                const e1 = JSON.parse(localStorage.getItem('cadastro_pet_e1') || '{}');
                const e2 = JSON.parse(localStorage.getItem('cadastro_pet_e2') || '{}');
                const vacinas = JSON.parse(localStorage.getItem('cadastro_pet_vacinas') || '[]');

                const payloadCompleto = {
                    nome: e1.nome,
                    especie: this.normalizarEspecie(e1.especie),
                    raca: e1.raca,
                    fotoBase64: e1.fotoBase64,
                    dataNascimento: e2.dataNascimento,
                    idadeValor: e2.idValor,
                    idadeUnidade: e2.idadeUnidade,
                    idadeMeses: e2.idMeses,
                    peso: e2.peso,
                    sexo: e2.sexo,
                    cor: e2.cor,
                    vacinas: vacinas,
                    medicamentos: itensSelecionados
                };

                try {
                    await this.model.cadastrarPetCompleto(payloadCompleto);
                    ['cadastro_pet_e1', 'cadastro_pet_e2', 'cadastro_pet_vacinas', 'cadastro_pet_meds'].forEach(k => localStorage.removeItem(k));
                    alert("Pet cadastrado com sucesso!");
                    window.location.href = '../dashboard.html';
                } catch (err) { alert(err.message); }
            });
        }
    }

    configurarBotoesSimNao(containerId, dropdownBtnId) {
        const options = document.querySelectorAll(".btn-option");
        const container = document.getElementById(containerId);
        const dropdownBtn = document.getElementById(dropdownBtnId);

        const atualizarVisibilidade = (textoBotao) => {
            if (textoBotao === 'Sim') {
                container.style.display = 'flex';
                dropdownBtn.style.display = 'flex';
            } else {
                container.style.display = 'none';
                dropdownBtn.style.display = 'none';
                // Limpa o HTML para garantir que nada seja salvo se ele mudar de ideia
                container.innerHTML = ''; 
            }
        };

        options.forEach(btn => {
            btn.addEventListener("click", (e) => {
                options.forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                atualizarVisibilidade(e.target.textContent.trim());
            });
        });

        // Configuração inicial ao carregar a página
        const ativo = document.querySelector(".btn-option.active");
        if (ativo) atualizarVisibilidade(ativo.textContent.trim());
    }

    coletarDatasDinamicas(arrayRef, containerRef) {
        containerRef.querySelectorAll('.date-picker-item').forEach(input => {
            const id = input.getAttribute('data-id');
            const item = arrayRef.find(i => i.idDataset === id);
            if (item) {
                item.data_aplicacao = input.value || null;
                item.data_desconhecida = input.value ? 0 : 1;
            }
        });
    }

    normalizarEspecie(texto) {
        if (!texto) return '';
        const t = texto.toLowerCase();
        if (t.includes('cachorro') || t.includes('cão')) return 'cachorro';
        if (t.includes('gato')) return 'gato';
        if (t.includes('furão') || t.includes('furao')) return 'furao';
        if (t.includes('tartaruga')) return 'tartaruga';
        return t;
    }
}