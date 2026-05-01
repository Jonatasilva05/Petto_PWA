function validarCPF(cpf) {
    if (!cpf) return false;
    cpf = cpf.replace(/\D/g, ''); // Remove tudo que não é número
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function validarCRMV(crmv) {
    if (!crmv) return false;
    // Formato aceito: 1234-SP ou 123456-RJ
    const regex = /^\d{4,6}-[A-Z]{2}$/i;
    return regex.test(crmv.trim());
}

function validarSenha(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{6,55}$/;
    return regex.test(senha.trim());
}

module.exports = { validarCPF, validarCRMV, validarSenha };