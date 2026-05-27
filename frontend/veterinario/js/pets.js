document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#formPet input, #formPet select').forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    });
    const modal = document.getElementById('modalPet');
    const toggleModal = () => modal.classList.toggle('hidden');
    document.getElementById('btnNovoPet').addEventListener('click', toggleModal);
    document.getElementById('fecharModal').addEventListener('click', toggleModal);
    document.getElementById('cancelarModal').addEventListener('click', toggleModal);
});