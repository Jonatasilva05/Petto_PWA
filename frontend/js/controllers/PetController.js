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
        this.gerenciarPaginasDePerfil();
    }

    async loadDashboard() {
        this.view.showSkeleton();
        try {
            const pets = await this.model.getPets();
            this.view.renderPets(
                pets,
                (petId) => { window.location.href = `./pets/historicoPet.html?petId=${petId}`; },
                (petId) => { 
                    Swal.fire({
                        title: 'Em breve!',
                        text: 'A tela de edição de pets está em desenvolvimento.',
                        icon: 'info',
                        confirmButtonColor: '#4890F0'
                    });
                },
                (petId, petNome) => {
                    Swal.fire({
                        title: `Excluir ${petNome}?`,
                        text: "Essa ação é irreversível. Todos os dados, vacinas e imagem serão apagados.",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ff4d4d',
                        cancelButtonColor: '#ccc',
                        confirmButtonText: 'Sim, excluir',
                        cancelButtonText: 'Cancelar'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                await this.model.deletePet(petId);
                                Swal.fire('Excluído!', `${petNome} foi removido do seu painel.`, 'success');
                                this.loadDashboard(); 
                            } catch (error) {
                                Swal.fire('Erro', error.message, 'error');
                            }
                        }
                    });
                }
            );
        } catch (error) { 
            console.error(error.message); 
            this.view.renderPets([], () => {}, () => {}, () => {});
        }
    }

    gerenciarPaginasDePerfil() {
        const path = window.location.pathname;
        if (path.includes('historicoPet.html')) {
            this.loadHistoricoPet();
        }
    }

    async loadHistoricoPet() {
        const urlParams = new URLSearchParams(window.location.search);
        const petId = urlParams.get('petId');
        
        if (!petId) {
            Swal.fire('Erro', 'Pet não identificado', 'error').then(() => {
                window.location.href = '../dashboard.html';
            });
            return;
        }

        const listContainer = document.querySelector('.list-container');
        if (listContainer) listContainer.innerHTML = '<p style="text-align:center; margin-top:20px;">Carregando histórico...</p>';

        try {
            this.historicoDataBruto = await this.model.getHistoricoPet(petId);
            this.view.renderHistorico(this.historicoDataBruto, 'Tudo');
            this.view.bindFiltrosHistorico((filtroSelecionado) => {
                this.view.renderHistorico(this.historicoDataBruto, filtroSelecionado);
            });
        } catch (error) {
            console.error(error);
            if (listContainer) listContainer.innerHTML = '<p style="text-align:center; color: red; margin-top:20px;">Não foi possível carregar os dados.</p>';
            Swal.fire('Erro', error.message, 'error');
        }
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

            document.getElementById('btn-next')?.addEventListener('click', () => {
                const nome = document.getElementById('pet-nome').value.trim();
                const textoEspecie = document.getElementById('txt-especie').textContent.trim();
                const raca = document.getElementById('txt-raca').textContent.trim();

                if (!nome || nome === "Ex: Bob" || textoEspecie === "Selecione...") {
                    alert("Por favor, preencha o nome e selecione uma espécie.");
                    return;
                }

                // Recupera a espécie "limpa" (sem emoji) que foi salva ao clicar na lista
                const dadosTemp = JSON.parse(localStorage.getItem('cadastro_pet_e1') || '{}');
                const especie = dadosTemp.especie || textoEspecie;

                const previewImage = document.getElementById('pet-photo-preview');
                const fotoBase64 = previewImage && previewImage.style.display === 'block' ? previewImage.src : null;

                // Salva tudo corretamente
                localStorage.setItem('cadastro_pet_e1', JSON.stringify({ nome, especie, raca, fotoBase64 }));
                window.location.href = 'cadastrarPet2.html';
            });
        }

        // ETAPA 2
        if (path.includes('cadastrarPet2.html')) {
            let sexo = '';
            let idadeUnidade = 'anos';

            const btnMacho = document.getElementById('btn-male');
            const btnFemea = document.getElementById('btn-female');
            btnMacho?.addEventListener('click', () => { sexo = 'M'; btnMacho.classList.add('active'); btnFemea?.classList.remove('active'); });
            btnFemea?.addEventListener('click', () => { sexo = 'F'; btnFemea.classList.add('active'); btnMacho?.classList.remove('active'); });

            document.getElementById('btn-months')?.addEventListener('click', () => { idadeUnidade = 'meses'; });
            document.getElementById('btn-years')?.addEventListener('click', () => { idadeUnidade = 'anos'; });
            
            document.querySelector('.btn-secondary')?.addEventListener('click', () => { window.location.href = 'cadastrarPet1.html'; });

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

        // ETAPA 3
        if (path.includes('cadastrarPet3.html')) {
            this.inicializarComponenteMedico('vaccines', especieDoPet, 'vacinasContainer', 'cadastro_pet_vacinas', 'cadastrarPet2.html', 'cadastrarPet4.html');
            this.configurarBotoesSimNao('vacinasContainer', 'toggleDropdown');
        }

        // ETAPA 4
        if (path.includes('cadastrarPet4.html')) {
            this.inicializarComponenteMedico('medications', especieDoPet, 'medicacoesContainer', 'cadastro_pet_meds', 'cadastrarPet3.html', null);
            this.configurarBotoesSimNao('medicacoesContainer', 'toggleDropdown');
        }
    }

    inicializarEventosFotoEtapa1() {
        window.openBottomSheet = (id) => {
            const dadosEtapa1 = JSON.parse(localStorage.getItem('cadastro_pet_e1') || '{}');
            if (id === 'sheet-raca' && (!dadosEtapa1.especie && document.getElementById('txt-especie').textContent.trim() === 'Selecione...')) {
                alert('Por favor, selecione uma espécie primeiro.');
                return;
            }

            // Salva o rascunho atual antes de abrir a câmera
            const nome = document.getElementById('pet-nome').value.trim();
            const especie = document.getElementById('txt-especie').textContent.trim();
            const raca = document.getElementById('txt-raca').textContent.trim();
            sessionStorage.setItem('petCadastroDraft', JSON.stringify({ nome, especie, raca }));

            document.getElementById('overlay')?.classList.add('active');
            document.getElementById(id)?.classList.add('active');
        };

        window.closeBottomSheet = () => {
            document.querySelectorAll('.bottom-sheet').forEach(el => el.classList.remove('active'));
            document.getElementById('overlay')?.classList.remove('active');
        };

        document.getElementById('overlay')?.addEventListener('click', window.closeBottomSheet);

        window.handlePhotoUpload = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Limite de 25MB
            if (file.size > 25 * 1024 * 1024) {
                alert('A imagem é muito grande. O limite máximo é de 25MB.');
                return;
            }

            // 1. Cria e mostra o Loader Nativo
            let loader = document.getElementById('native-pic-loader');
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'native-pic-loader';
                loader.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(18, 18, 18, 0.9); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; font-family: "Poppins", sans-serif; backdrop-filter: blur(5px);';
                loader.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" style="font-size: 50px; color: #4890F0; margin-bottom: 20px;"></i><h3 style="margin:0; font-weight: 500;">Processando foto...</h3><p style="color:#aaa; font-size: 14px; margin-top:5px;">Aguarde um momento</p>';
                document.body.appendChild(loader);
            }
            loader.style.display = 'flex';

            // 2. Timeout para a tela conseguir renderizar o "Carregando"
            setTimeout(() => {
                // Voltamos para o FileReader, pois ele é imune a bloqueios de segurança do celular
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const img = new Image();
                    
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 800; 
                        const MAX_HEIGHT = 800; 
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                        } else {
                            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

                        const previewImage = document.getElementById('pet-photo-preview');
                        const placeholder = document.getElementById('photo-placeholder');
                        
                        if (previewImage && placeholder) {
                            previewImage.src = compressedBase64;
                            previewImage.style.display = 'block';
                            placeholder.style.display = 'none';
                            sessionStorage.setItem('tempFotoBase64', compressedBase64);
                        }

                        // Limpeza de memória
                        canvas.width = 0;
                        canvas.height = 0;
                        img.src = '';
                        
                        // Finaliza
                        loader.style.display = 'none';
                        window.closeBottomSheet();
                    };

                    img.onerror = () => {
                        loader.style.display = 'none';
                        alert('Formato de imagem não suportado pela câmera do dispositivo.');
                    };

                    img.src = e.target.result;
                };

                reader.onerror = () => {
                    loader.style.display = 'none';
                    alert('Erro ao ler a foto do celular. Tente novamente.');
                };

                // Inicia a leitura do arquivo fisicamente
                reader.readAsDataURL(file);
                
            }, 150);
        };

        document.querySelector('#sheet-foto .btn-primary')?.addEventListener('click', () => { document.getElementById('input-camera').click(); });
        document.querySelector('#sheet-foto .btn-secondary')?.addEventListener('click', () => { document.getElementById('input-gallery').click(); });

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
            // Lendo o novo banco de dados detalhado (Ajuste o caminho se necessário)
            const response = await fetch('../data/databaseInfoMed2.json');
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

            // ==========================================
            // LÓGICA DE CLIQUE NO DROPDOWN COM VALIDAÇÃO
            // ==========================================
            dropdown.addEventListener('click', async (e) => {
                const itemElement = e.target.closest('.dropdown-item');
                if (!itemElement || !itemElement.getAttribute('data-id')) return;

                const idDataset = itemElement.getAttribute('data-id');
                const nomeItem = itemElement.textContent;

                // Encontrar o item no JSON para checar a idade mínima
                const itemRegra = listaItens.find(i => i.id === idDataset);
                const idadeEmDias = this.calcularIdadePetEmDias();
                const idadeMinima = itemRegra?.schedule?.minimum_age_days || 0;

                const adicionarItemNaTela = () => {
                    if (!itensSelecionados.some(i => i.idDataset === idDataset)) {
                        itensSelecionados.push({ idDataset, nome: nomeItem, data_aplicacao: null, data_desconhecida: 1 });
                        
                        // Criação do elemento DOM com o botão de excluir
                        const divItem = document.createElement('div');
                        divItem.className = 'item-medico-adicionado';
                        divItem.setAttribute('data-id', idDataset);
                        divItem.style.cssText = 'background:#1e1e1e; padding:16px; margin-top:12px; border-radius:12px; border: 1px solid #333; color:#fff;';
                        
                        divItem.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <p style="margin:0; font-size:15px; font-weight:500; width: 85%;">${nomeItem}</p>
                                <button type="button" class="btn-excluir-item" style="background:none; border:none; color:#ff4d4d; font-size:16px; cursor:pointer; padding:4px;">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                            <input type="date" style="width:100%; padding:10px; border-radius:8px; border:1px solid #444; background:#121212; color:#fff;" class="date-picker-item" data-id="${idDataset}">
                        `;

                        // Lógica para excluir o item se foi adicionado por acidente
                        divItem.querySelector('.btn-excluir-item').addEventListener('click', () => {
                            itensSelecionados = itensSelecionados.filter(i => i.idDataset !== idDataset);
                            divItem.remove(); // Remove visualmente da tela
                        });

                        container.appendChild(divItem);
                    }
                    dropdown.style.display = 'none';
                };

                // Validação de Idade Mínima
                if (idadeEmDias !== null && idadeEmDias < idadeMinima) {
                    
                    // Verifica se o SweetAlert (Swal) foi carregado na página
                    if (typeof Swal !== 'undefined') {
                        const result = await Swal.fire({
                            title: 'Procedimento Precoce!',
                            html: `A idade do pet (<b>${idadeEmDias} dias</b>) não é recomendada para <b>${nomeItem}</b>.<br><br>A idade mínima exigida é de <b>${idadeMinima} dias</b>.`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Cancelar', 
                            cancelButtonText: 'Inserir mesmo assim', 
                            confirmButtonColor: '#4890F0', // Azul (Ação segura vira o botão principal)
                            cancelButtonColor: '#ff4d4d', // Vermelho (Inserir mesmo assim)
                            reverseButtons: true // Inverte a posição dos botões na tela (Opcional, mas melhora a UX)
                        });

                        // dismiss === cancel significa que ele clicou no botão vermelho "Inserir mesmo assim"
                        if (result.dismiss === Swal.DismissReason.cancel) {
                            adicionarItemNaTela();
                        } else {
                            dropdown.style.display = 'none';
                        }
                    } else {
                        // PLANO B: Se o desenvolvedor esquecer de colocar o script do Swal no HTML
                        const confirmou = confirm(`ATENÇÃO: Procedimento Precoce!\n\nA idade do pet (${idadeEmDias} dias) não é recomendada para ${nomeItem}. A idade mínima é de ${idadeMinima} dias.\n\nDeseja inserir mesmo assim?`);
                        if (confirmou) {
                            adicionarItemNaTela();
                        } else {
                            dropdown.style.display = 'none';
                        }
                    }
                } else {
                    // Idade compatível ou idade não informada, adiciona direto
                    adicionarItemNaTela();
                }
            });

        } catch (error) { 
            dropdown.innerHTML = `<div class="dropdown-item" style="color: red;">Erro ao carregar dados médicos.</div>`; 
            console.error(error);
        }

        document.getElementById('toggleDropdown')?.addEventListener('click', () => {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.querySelector('.voltar')?.addEventListener('click', () => { window.location.href = urlVoltar; });

        if (urlAvancar) {
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

                if (!e1.nome) {
                    alert("Os dados principais do pet foram perdidos. Por favor, reinicie o cadastro.");
                    window.location.href = 'cadastrarPet1.html';
                    return;
                }

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
                    sessionStorage.removeItem('tempFotoBase64');
                    alert("Pet cadastrado com sucesso!");
                    window.location.href = '../dashboard.html';
                } catch (err) { alert(err.message); }
            });
        }
    }

    // Função NOVA: Calcula a idade em dias do pet baseado nos dados da Etapa 2
    calcularIdadePetEmDias() {
        const e2 = JSON.parse(localStorage.getItem('cadastro_pet_e2') || '{}');
        let dias = null; // Se não conseguir calcular (tudo em branco), retorna null para não bloquear injustamente.

        if (e2.dataNascimento) {
            // O tutor preencheu a data de nascimento exata
            const nasc = new Date(e2.dataNascimento);
            const hoje = new Date();
            const diffTime = Math.abs(hoje - nasc);
            dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else if (e2.idMeses) {
            // O tutor preencheu a quantidade de meses aproximada
            dias = parseInt(e2.idMeses) * 30;
        } else if (e2.idValor && e2.idadeUnidade) {
            // O tutor preencheu a idade base (anos ou meses)
            if (e2.idadeUnidade === 'anos') {
                dias = parseInt(e2.idValor) * 365;
            } else if (e2.idadeUnidade === 'meses') {
                dias = parseInt(e2.idValor) * 30;
            }
        }
        
        return dias;
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
        
        // Remove emojis e espaços desnecessários
        let t = texto.toLowerCase().replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        
        if (t.includes('cachorro') || t.includes('cão') || t.includes('cao')) return 'cachorro';
        if (t.includes('gato')) return 'gato';
        if (t.includes('furão') || t.includes('furao')) return 'furao';
        if (t.includes('tartaruga')) return 'tartaruga';
        if (t.includes('coelho')) return 'coelho';
        if (t.includes('passaro') || t.includes('pássaro')) return 'passaro';
        if (t.includes('roedor')) return 'roedor';
        if (t.includes('reptil') || t.includes('réptil')) return 'reptil';
        if (t.includes('peixe')) return 'peixe';
        
        return t;
    }
}