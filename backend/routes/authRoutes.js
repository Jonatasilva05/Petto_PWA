const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { validarCPF, validarCRMV, validarSenha } = require('../utils/validators');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

/* =========================================
   CONFIGURAÇÃO DO MULTER (UPLOAD SEGURO)
========================================= */
const storagePerfil = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define o caminho exato apontando para frontend/uploads/perfil
        const dir = path.join(__dirname, '../../frontend/uploads/perfil');
        
        // Cria a pasta de forma recursiva caso ela não exista
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Gera um nome único baseado em timestamp para evitar conflito de arquivos
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E3);
        cb(null, 'perfil_' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de segurança para aceitar apenas imagens de fato
const uploadPerfil = multer({ 
    storage: storagePerfil,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB por foto para proteção do servidor
});

/* =========================================
   MIDDLEWARE DE AUTENTICAÇÃO INTERNO
========================================= */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
        req.user = user;
        next();
    });
};

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

// ==========================================
// ROTA 7: BUSCAR DADOS DO PERFIL
// ==========================================
router.get('/perfil/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await pool.execute(
            'SELECT nome, email, telefone, endereco, cpf, role, foto_url FROM usuarios WHERE id = ?', 
            [id]    
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        
        // Mapeia tanto foto_url quanto avatar_url para garantir compatibilidade com o JS do frontend
        const dadosCompletos = {
            ...users[0],
            avatar_url: users[0].foto_url
        };
        
        res.status(200).json(dadosCompletos);
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ message: 'Erro interno ao buscar dados do perfil.' });
    }
});

// ==========================================
// ROTA 8: ATUALIZAR DADOS DO PERFIL
// ==========================================
router.put('/perfil/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, endereco, cpf } = req.body;

    if (!nome) {
        return res.status(400).json({ message: 'O nome é obrigatório.' });
    }

    const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : null;

    if (cpfLimpo && !validarCPF(cpfLimpo)) {
        return res.status(400).json({ message: 'O CPF informado é inválido.' });
    }

    try {
        await pool.execute(
            'UPDATE usuarios SET nome = ?, telefone = ?, endereco = ?, cpf = ? WHERE id = ?',
            [nome.trim(), telefone || null, endereco || null, cpfLimpo, id]
        );
        
        res.status(200).json({ message: 'Dados updated com sucesso!' });
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ message: 'Erro interno ao atualizar perfil.' });
    }
});

// ==========================================
// ROTA 9: ALTERAR SENHA (LOGADO)
// ==========================================
router.put('/alterar-senha/:id', async (req, res) => {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ message: 'Preencha a senha atual e a nova senha.' });
    }

    if (!validarSenha(novaSenha)) {
        return res.status(400).json({ message: 'A nova senha não atende aos requisitos de segurança.' });
    }

    try {
        const [users] = await pool.execute('SELECT senha FROM usuarios WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const isPasswordCorrect = await bcrypt.compare(senhaAtual, users[0].senha);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'A senha atual está incorreta.' });
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);
        await pool.execute('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, id]);

        res.status(200).json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        res.status(500).json({ message: 'Erro interno ao alterar senha.' });
    }
});

// ==========================================
// ROTA 10: UPLOAD DE FOTO DE PERFIL (NOVA)
// ==========================================
router.post('/perfil/:id/avatar', authenticateToken, uploadPerfil.single('avatar'), async (req, res) => {
    const { id } = req.params;

    // BARREIRA DE DEFESA: Verifica se o ID do token bate com o ID solicitado na URL
    if (parseInt(req.user.id) !== parseInt(id)) {
        if (req.file) fs.unlinkSync(req.file.path); // Apaga o arquivo imediatamente
        return res.status(403).json({ message: 'Acesso negado. Não é permitido alterar mídias de outra conta.' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum ficheiro de imagem foi detetado.' });
    }

    try {
        const novoNomeArquivo = req.file.filename;

        // Limpeza de cache/armazenamento: descobre se o usuário já possuía uma imagem antiga
        const [usuario] = await pool.execute('SELECT foto_url FROM usuarios WHERE id = ?', [id]);
        
        if (usuario.length > 0 && usuario[0].foto_url) {
            const caminhoFotoAntiga = path.join(__dirname, '../../frontend/uploads/perfil', usuario[0].foto_url);
            // Deleta o arquivo antigo para economizar espaço em disco
            if (fs.existsSync(caminhoFotoAntiga)) {
                fs.unlinkSync(caminhoFotoAntiga);
            }
        }

        // Salva o novo nome do arquivo na tabela de usuários
        await pool.execute('UPDATE usuarios SET foto_url = ? WHERE id = ?', [novoNomeArquivo, id]);

        res.status(200).json({ 
            message: 'Foto de perfil gravada com sucesso!', 
            avatarUrl: novoNomeArquivo 
        });

    } catch (error) {
        console.error("Erro crítico ao salvar avatar:", error);
        if (req.file) fs.unlinkSync(req.file.path); // Remove em caso de falha no banco
        res.status(500).json({ message: 'Erro interno ao processar e salvar a imagem.' });
    }
});

module.exports = router;