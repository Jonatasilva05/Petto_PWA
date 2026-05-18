// Variável global para armazenar os dados carregados do JSON
let PET_DATA = [];

// ==========================================
// ESTADO DO COMPONENTE
// ==========================================
const petSelecionado = {
    especieValue: '',
    especieLabel: '',
    racaValue: '',
    racaLabel: ''
};

document.addEventListener('DOMContentLoaded', async () => {

    // Carrega os dados do JSON assim que a página é montada
    await carregarDadosJSON();

    // Botão de Finalizar
    const btnFinish = document.getElementById('btn-finish');
    btnFinish?.addEventListener('click', () => {
        const nome = document.getElementById('pet-nome').value;
        
        if(!nome || !petSelecionado.especieValue || !petSelecionado.racaValue) {
            alert("Por favor, preencha o Nome, a Espécie e a Raça do pet.");
            return;
        }

        alert("Cadastro finalizado com sucesso!");
        window.location.href = '../dashboard.html';
    });

    // Filtro de pesquisa dentro das Bottom Sheets
    document.querySelectorAll('.sheet-search').forEach(input => {
        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const list = e.target.parentElement.querySelector('.sheet-list');
            
            if (list) {
                Array.from(list.children).forEach(li => {
                    const text = li.textContent.toLowerCase();
                    li.style.display = text.includes(term) ? '' : 'none';
                });
            }
        });
    });
});

// ==========================================
// 1. CARREGAR DADOS VIA FETCH (JSON)
// ==========================================
async function carregarDadosJSON() {
    try {
        // Faz a requisição para buscar o arquivo JSON (Ajuste o caminho se necessário)
        const response = await fetch('../data/databasePets.json');
        
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.status}`);
        }
        
        // Converte a resposta para um array/objeto JavaScript
        PET_DATA = await response.json();
        
        // Após os dados serem baixados com sucesso, carrega a lista de espécies
        carregarEspecies();
    } catch (error) {
        console.error("Erro ao buscar databasePets.json:", error);
        const lista = document.getElementById('lista-especies');
        if (lista) lista.innerHTML = '<li><span style="color:red;">Erro ao carregar dados de espécies. Verifique a conexão ou o console.</span></li>';
    }
}

// ==========================================
// 2. FUNÇÕES DE RENDERIZAÇÃO DE LISTAS
// ==========================================

function carregarEspecies() {
    const lista = document.getElementById('lista-especies');
    if (!lista) return;
    lista.innerHTML = '';

    PET_DATA.forEach(especie => {
        const li = document.createElement('li');
        li.textContent = especie.label;
        li.onclick = () => window.selecionarEspecie(especie.value, especie.label);
        lista.appendChild(li);
    });
}

function carregarRacas(especieValue) {
    const lista = document.getElementById('lista-racas');
    if (!lista) return;
    lista.innerHTML = ''; 

    const especieEncontrada = PET_DATA.find(pet => pet.value === especieValue);

    if (especieEncontrada && especieEncontrada.breeds) {
        especieEncontrada.breeds.forEach(raca => {
            const li = document.createElement('li');
            li.textContent = raca.label;
            li.onclick = () => window.selecionarRaca(raca.value, raca.label);
            lista.appendChild(li);
        });
    } else {
        lista.innerHTML = '<li><span style="color:#888;">Nenhuma raça encontrada</span></li>';
    }
}

// ==========================================
// 3. FUNÇÕES GLOBAIS (Acessíveis pelo HTML)
// ==========================================

let activeSheetId = null;

window.openBottomSheet = function (id) {
    // Regra de validação: Raças só abrem se a espécie estiver selecionada
    if (id === 'sheet-raca' && !petSelecionado.especieValue) {
        alert('Por favor, selecione uma espécie primeiro.');
        return;
    }

    activeSheetId = id;
    
    // Limpa a barra de pesquisa ao abrir a sheet
    const searchInput = document.querySelector(`#${id} .sheet-search`);
    if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input')); // Dispara o evento para resetar a lista
    }

    document.getElementById('overlay').classList.add('active');
    document.getElementById(id).classList.add('active');
};

window.closeBottomSheet = function () {
    if (activeSheetId) {
        document.getElementById(activeSheetId).classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        activeSheetId = null;
    }
};

document.getElementById('overlay')?.addEventListener('click', window.closeBottomSheet);

// Funcionalidade chamada ao clicar em um item de Espécie
window.selecionarEspecie = function(value, label) {
    petSelecionado.especieValue = value;
    petSelecionado.especieLabel = label;
    
    const txtEspecie = document.getElementById('txt-especie');
    txtEspecie.innerText = label;
    txtEspecie.style.color = '#fff';

    // Reseta Raça (pois a espécie mudou)
    petSelecionado.racaValue = '';
    petSelecionado.racaLabel = '';
    const txtRaca = document.getElementById('txt-raca');
    txtRaca.innerText = 'Selecione...';
    txtRaca.style.color = '';

    // Carrega dados baseados na nova espécie selecionada
    carregarRacas(value);

    window.closeBottomSheet();
};

// Funcionalidade chamada ao clicar em um item de Raça
window.selecionarRaca = function(value, label) {
    petSelecionado.racaValue = value;
    petSelecionado.racaLabel = label;
    
    const txtRaca = document.getElementById('txt-raca');
    txtRaca.innerText = label;
    txtRaca.style.color = '#fff';

    window.closeBottomSheet();
};

// ==========================================
// 4. FUNÇÃO DE UPLOAD E PREVIEW DA FOTO
// ==========================================

window.handlePhotoUpload = function(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Pega o elemento da imagem e o placeholder
            const previewImage = document.getElementById('pet-photo-preview');
            const placeholder = document.getElementById('photo-placeholder');
            
            // Define a foto tirada/escolhida como source da imagem
            previewImage.src = e.target.result;
            
            // Esconde o ícone da câmera e mostra a foto
            previewImage.style.display = 'block';
            placeholder.style.display = 'none';
            
            // Fecha a bottom sheet de seleção de foto
            window.closeBottomSheet();
        };
        
        // Lê a imagem como uma URL de dados (base64)
        reader.readAsDataURL(file);
    }
};