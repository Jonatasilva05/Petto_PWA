const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validarCPF, validarCRMV, validarSenha } = require('../utils/validators');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// ROTA 1: CADASTRO
// ==========================================
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha, pet_primario, cor_favorita, role } = req.body;
    const { crmv, cpf, nome_clinica, tempo_experiencia, cep_clinica, endereco, bairro_clinica, numero_clinica } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
    }
    if (!validarSenha(senha)) {
        return res.status(400).json({ message: 'A senha não atende aos requisitos.' });
    }

    const userRole = role === 'veterinario' ? 'veterinario' : 'tutor';
    const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : null;

    if (userRole === 'veterinario') {
        if (!cpfLimpo || !validarCPF(cpfLimpo)) return res.status(400).json({ message: 'Para veterinários, o CPF é obrigatório e deve ser válido.' });
        if (!crmv || !validarCRMV(crmv)) return res.status(400).json({ message: 'CRMV inválido. Use o formato: 123456-SP.' });
    } else {
        if (cpfLimpo && !validarCPF(cpfLimpo)) return res.status(400).json({ message: 'O CPF informado é inválido.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [users] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email.trim()]);
        if (users.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        
        const senhaHash = await bcrypt.hash(senha.trim(), 10);
        
        const userSql = 'INSERT INTO usuarios (nome, email, senha, pet_primario, cor_favorita, role, cpf) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [userResult] = await connection.execute(userSql, [
            nome.trim(), email.trim(), senhaHash, pet_primario || null, cor_favorita || null, userRole, cpfLimpo
        ]);
        const newUserId = userResult.insertId;

        if (userRole === 'veterinario') {
            const vetSql = `INSERT INTO veterinarios (user_id, nome, email, crmv, cpf, nome_clinica, tempo_experiencia, cep_clinica, endereco, bairro_clinica, numero_clinica) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await connection.execute(vetSql, [
                newUserId, nome.trim(), email.trim(), crmv.toUpperCase(), cpfLimpo, nome_clinica || null, 
                tempo_experiencia || null, cep_clinica || null, endereco || null, bairro_clinica || null, numero_clinica || null
            ]);
        }
        
        await connection.commit();
        res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    } catch (error) { 
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erro interno no servidor.' }); 
    } finally {
        connection.release();
    }
});

// ==========================================
// ROTA 2: VERIFICAR SE EMAIL EXISTE (Cadastro)
// ==========================================
router.post('/check-email', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'E-mail não fornecido.' });
    }
    try {
        const [users] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email.trim()]);
        if (users.length > 0) {
            return res.status(409).json({ isAvailable: false, message: 'Este e-mail já está em uso.' });
        }
        return res.status(200).json({ isAvailable: true });
    } catch (error) {
        console.error("Erro ao verificar e-mail:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// ==========================================
// ROTA 3: LOGIN
// ==========================================
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });

    try {
        const [users] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email.trim()]);
        const user = users[0];
        if (!user) {
            return res.status(404).json({ message: 'Usuário não cadastrado.', errorCode: 'USER_NOT_FOUND' });
        }
        const isPasswordCorrect = await bcrypt.compare(senha, user.senha);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }
        const tokenPayload = { id: user.id, nome: user.nome, email: user.email, role: user.role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// ==========================================
// ROTA 4: ESQUECI A SENHA (Verificar Email)
// ==========================================
router.post('/verificar-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'E-mail é obrigatório.' });

    try {
        const [users] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (users.length > 0) res.status(200).json({ exists: true });
        else res.status(404).json({ exists: false, message: 'Nenhum usuário encontrado com este e-mail.' });
    } catch (error) { res.status(500).json({ message: 'Erro interno no servidor.' }); }
});

// ==========================================
// ROTA 5: ESQUECI A SENHA (Verificar Resposta)
// ==========================================
router.post('/verificar-resposta', async (req, res) => {
    const { email, tipo_pergunta, resposta } = req.body;
    if (!email || !tipo_pergunta || !resposta) return res.status(400).json({ message: 'Informações incompletas.' });

    try {
        const [users] = await pool.execute('SELECT pet_primario, cor_favorita FROM usuarios WHERE email = ?', [email]);
        const user = users[0];
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        let respostaCorreta = false;
        if (tipo_pergunta === 'pet' && resposta.toLowerCase() === user.pet_primario.toLowerCase()) respostaCorreta = true;
        else if (tipo_pergunta === 'cor' && resposta.toLowerCase() === user.cor_favorita.toLowerCase()) respostaCorreta = true;

        if (respostaCorreta) {
            const tempToken = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: '10m' });
            res.status(200).json({ message: 'Resposta correta!', token: tempToken });
        } else {
            res.status(401).json({ message: 'Resposta incorreta.' });
        }
    } catch (error) { res.status(500).json({ message: 'Erro interno no servidor.' }); }
});

// ==========================================
// ROTA 6: REDEFINIR SENHA
// ==========================================
router.post('/redefinir-senha', async (req, res) => {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha) return res.status(400).json({ message: 'Token ou nova senha não fornecidos.' });
    
    if (!validarSenha(novaSenha)) {
        return res.status(400).json({ message: 'A nova senha não atende aos requisitos de segurança.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const senhaHash = await bcrypt.hash(novaSenha, 10);
        await pool.execute('UPDATE usuarios SET senha = ? WHERE email = ?', [senhaHash, decoded.email]);
        res.status(200).json({ message: 'Senha redefinida com sucesso!' });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado. Tente novamente.' });
    }
});

module.exports = router;