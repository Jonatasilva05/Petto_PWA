function assinar(plano) {
    Swal.fire({
    title: 'Confirmar Assinatura',
    text: `Deseja avançar para o checkout do Plano ${plano}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#06b6d4',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, assinar!',
    cancelButtonText: 'Cancelar'
    }).then((result) => {
    if (result.isConfirmed) {
        Swal.fire({ title: 'Redirecionando...', text: 'Processando pagamento seguro.', icon: 'success', timer: 2000, showConfirmButton: false });
    }
    })
}