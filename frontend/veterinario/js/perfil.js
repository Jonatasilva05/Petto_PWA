document.addEventListener('DOMContentLoaded', () => {
    // Bloqueio Global de Submit Acidental
    document.querySelectorAll('input').forEach(el => {
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter') e.preventDefault();
        });
    });
});