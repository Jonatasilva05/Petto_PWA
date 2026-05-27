document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#formTutor input').forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    });
    const modal = document.getElementById('modalTutor');
    const toggleModal = () => modal.classList.toggle('hidden');
    document.getElementById('btnNovoTutor').addEventListener('click', toggleModal);
    document.getElementById('fecharModal').addEventListener('click', toggleModal);
    document.getElementById('cancelarModal').addEventListener('click', toggleModal);
});