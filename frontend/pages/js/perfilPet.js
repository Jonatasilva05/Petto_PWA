import { PetModel } from '../../js/models/PetModel.js';

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('btn-voltar').addEventListener('click', () => {
        window.location.href = '../dashboard.html';
    });

    document.getElementById('btn-favorito').addEventListener('click', function() {
        this.classList.toggle('active');
        this.classList.toggle('fa-regular');
        this.classList.toggle('fa-solid');
    });

    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');

    if (!petId) {
        Swal.fire('Erro', 'Pet não identificado.', 'error').then(() => {
            window.location.href = '../dashboard.html';
        });
        return;
    }

    const model = new PetModel();
    try {
        const pet = await model.getPetById(petId);

        document.getElementById('lbl-nome-header').innerText = pet.nome || 'Sem nome';
        
        if (pet.foto_url) {
            document.getElementById('img-pet-foto').src = '../..' + pet.foto_url;
        }

        const racaSegura = (pet.raca && pet.raca !== 'null' && pet.raca !== 'Selecione...') ? pet.raca : 'Sem raça';
        document.getElementById('tag-raca').innerText = racaSegura;
        document.getElementById('tag-peso').innerText = pet.peso ? `Peso: ${pet.peso} kg` : 'Peso: -- kg';
        
        // Lógica unificada para exibição limpa da idade no perfil
        let idadeTexto = 'Idade: --';
        if (pet.data_nascimento) {
            const nascimento = new Date(pet.data_nascimento);
            const hoje = new Date();
            
            let anos = hoje.getFullYear() - nascimento.getFullYear();
            let meses = hoje.getMonth() - nascimento.getMonth();
            let dias = hoje.getDate() - nascimento.getDate();

            if (dias < 0) {
                meses--;
                const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
                dias += ultimoDiaMesAnterior;
            }
            if (meses < 0) {
                anos--;
                meses += 12;
            }

            if (anos > 0) idadeTexto = `Idade: ${anos} ${anos === 1 ? 'ano' : 'anos'}`;
            else if (meses > 0) idadeTexto = `Idade: ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
            else if (dias >= 0) idadeTexto = `Idade: ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
        } else if (pet.idade_valor !== null && pet.idade_valor !== undefined && pet.idade_valor !== '') {
            idadeTexto = `Idade: ${pet.idade_valor} ${pet.idade_unidade || 'anos'}`;
        }

        document.getElementById('tag-idade').innerText = idadeTexto;

    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Não foi possível carregar os dados deste pet.', 'error');
    }

    const exibirAvisoEmBreve = (nomeTela) => {
        Swal.fire({
            title: 'Em breve!',
            text: `A tela de "${nomeTela}" está em desenvolvimento.`,
            icon: 'info',
            confirmButtonColor: '#4890F0'
        });
    };

    document.querySelectorAll('.clickable[data-tela]').forEach(elemento => {
        elemento.addEventListener('click', (e) => {
            e.stopPropagation();
            const nomeTela = elemento.getAttribute('data-tela');
            
            // Verifica se o botão clicado é o de Histórico
            if (nomeTela === 'Histórico Completo' || nomeTela === 'Histórico Rápido') {
                // Redireciona para a tela de histórico passando o ID do pet na URL
                window.location.href = `historicoPet.html?petId=${petId}`;
            } else {
                // Para as outras telas que ainda não existem, continua mostrando o aviso
                exibirAvisoEmBreve(nomeTela);
            }
        });
    });

    document.getElementById('btn-download').addEventListener('click', () => exibirAvisoEmBreve('Baixar Relatório'));
    document.querySelectorAll('.card-compromisso').forEach(card => {
        card.addEventListener('click', () => exibirAvisoEmBreve('Detalhes do Compromisso'));
    });
});