import { PetModel } from '../../js/models/PetModel.js';
import { PetView } from '../../js/view/PetView.js';
import { PetController } from '../../js/controllers/PetController.js';

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa o MVC respeitando os caminhos corretos de diretório do PWA
    new PetController(new PetModel(), new PetView());
});

// Funções globais para o Bottom Sheet
window.openBottomSheet = (id) => {
    document.getElementById('overlay').classList.add('active');
    document.getElementById(id).classList.add('active');
};

window.closeBottomSheet = () => {
    document.getElementById('overlay').classList.remove('active');
    document.querySelectorAll('.bottom-sheet').forEach(sheet => sheet.classList.remove('active'));
};

document.addEventListener('DOMContentLoaded', async () => {
    const petModel = new PetModel();
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');

    if (!petId) {
        window.location.href = '../dashboard.html';
        return;
    }

    const inputNome = document.getElementById('edit-nome');
    const txtRaca = document.getElementById('txt-raca');
    const inputNascimento = document.getElementById('edit-nascimento');
    const inputPeso = document.getElementById('edit-peso');
    const inputCor = document.getElementById('edit-cor');
    const imgPreview = document.getElementById('edit-photo-preview');
    const loader = document.getElementById('native-pic-loader');
    
    let fotoBase64Atualizada = null;
    let petEspecie = null; 

    // 1. Carregar dados atuais do pet
    try {
        const petData = await petModel.getPetById(petId);
        
        petEspecie = petData.especie ? petData.especie.toLowerCase() : null;
        inputNome.value = petData.nome || '';
        txtRaca.textContent = petData.raca && petData.raca !== 'Selecione...' ? petData.raca : 'Selecione...';
        inputPeso.value = petData.peso || '';
        inputCor.value = petData.cor || '';
        if (petData.data_nascimento) inputNascimento.value = petData.data_nascimento.split('T')[0];
        if (petData.foto_url) imgPreview.src = '../../' + petData.foto_url;

        // Inicia o carregamento das raças baseadas na espécie
        carregarRacas(petEspecie);

    } catch (error) {
        Swal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
    }

    // 2. Carregar e Filtrar Raças do JSON
    async function carregarRacas(especieNome) {
        const listaRacas = document.getElementById('lista-racas');
        const searchInput = document.getElementById('search-raca');
        
        if (!especieNome) {
            listaRacas.innerHTML = '<li><span style="color:#888;">Espécie desconhecida. Impossível carregar raças.</span></li>';
            return;
        }

        try {
            const response = await fetch('../data/databasePets.json');
            const data = await response.json();
            
            // Procura a espécie correspondente no JSON
            const especieData = data.find(e => especieNome.includes(e.value));
            
            if (especieData && especieData.breeds) {
                renderizarRacas(especieData.breeds);

                // Adiciona o evento de pesquisa na gavetinha
                searchInput.addEventListener('input', (e) => {
                    const termo = e.target.value.toLowerCase();
                    const racasFiltradas = especieData.breeds.filter(b => b.label.toLowerCase().includes(termo));
                    renderizarRacas(racasFiltradas);
                });
            } else {
                listaRacas.innerHTML = '<li><span style="color:#888;">Nenhuma raça encontrada.</span></li>';
            }
        } catch (error) {
            listaRacas.innerHTML = '<li><span style="color:red;">Erro ao carregar raças.</span></li>';
        }
    }

    function renderizarRacas(breedsArray) {
        const listaRacas = document.getElementById('lista-racas');
        listaRacas.innerHTML = '';
        
        breedsArray.forEach(b => {
            const li = document.createElement('li');
            li.textContent = b.label;
            li.onclick = () => { 
                document.getElementById('txt-raca').textContent = b.label;
                window.closeBottomSheet(); 
            };
            listaRacas.appendChild(li);
        });
    }

    // 3. Lógica de Upload de Foto Unificada (Câmera e Galeria)
    const handleFileProcess = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        window.closeBottomSheet();

        if (file.size > 25 * 1024 * 1024) {
            Swal.fire('Aviso', 'A imagem é muito grande. O limite é 25MB.', 'warning');
            e.target.value = ''; // Limpa para permitir tentar novamente
            return;
        }

        loader.style.display = 'flex';

        const objectURL = URL.createObjectURL(file);
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

            fotoBase64Atualizada = canvas.toDataURL('image/jpeg', 0.7);
            imgPreview.src = fotoBase64Atualizada;

            URL.revokeObjectURL(objectURL);
            canvas.width = 0; canvas.height = 0; img.src = '';
            loader.style.display = 'none';
            e.target.value = ''; 
        };

        img.onerror = () => {
            loader.style.display = 'none';
            Swal.fire('Erro', 'Formato de imagem não suportado.', 'error');
            e.target.value = '';
        };

        img.src = objectURL;
    };

    document.getElementById('input-camera').addEventListener('change', handleFileProcess);
    document.getElementById('input-gallery').addEventListener('change', handleFileProcess);

    // 4. Salvar Alterações
    document.getElementById('form-edit-pet').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSalvar = document.getElementById('btn-salvar');
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

        const racaSelecionada = txtRaca.textContent.trim();

        const payload = {
            nome: inputNome.value.trim(),
            raca: racaSelecionada === 'Selecione...' ? '' : racaSelecionada,
            dataNascimento: inputNascimento.value || null,
            peso: inputPeso.value ? parseFloat(inputPeso.value) : null,
            cor: inputCor.value.trim(),
            fotoBase64: fotoBase64Atualizada
        };

        try {
            await petModel.updatePet(petId, payload);
            await Swal.fire({ title: 'Sucesso!', text: 'Dados atualizados.', icon: 'success', confirmButtonColor: '#1565C0' });
            window.location.href = '../dashboard.html';
        } catch (error) {
            Swal.fire('Erro', error.message, 'error');
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Alterações';
        }
    });
});