const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // <-- Adicionado para gerar hashes seguros

// Middleware de proteção nativo do seu app
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido.' });
        req.user = user;
        next();
    });
};

// Rota 1: Listar pets
router.get('/', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT p.id_pet, p.nome, p.raca, p.foto_url, p.idade_valor, p.idade_unidade, p.data_nascimento,
            (p.peso IS NOT NULL AND p.cor IS NOT NULL) as is_details_complete, 
            (SELECT COUNT(*) FROM vacinas v WHERE v.id_pet = p.id_pet) > 0 as has_vaccines, 
            (SELECT COUNT(*) FROM medicamentos m WHERE m.id_pet = p.id_pet) > 0 as has_meds 
            FROM pets p WHERE p.id_usuario = ?`;
        const [pets] = await pool.execute(sql, [req.user.id]);
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pets.' });
    }
});

// Rota de consulta individual para a tela de Perfil do Pet
router.get('/:id', authenticateToken, async (req, res) => {
    const petId = req.params.id;
    const userId = req.user.id;
    try {
        const sql = `SELECT * FROM pets WHERE id_pet = ? AND id_usuario = ?`;
        const [rows] = await pool.execute(sql, [petId, userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pet não encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao carregar perfil do pet.' });
    }
});

// Rota 2: Cadastro Completo Relacional com Transação SQL e Upload de Foto
router.post('/cadastro-completo', authenticateToken, async (req, res) => {
    const { 
        nome, especie, raca, fotoBase64, dataNascimento, idadeValor, 
        idadeUnidade, idadeMeses, peso, sexo, cor, vacinas, medicamentos 
    } = req.body;
    
    const id_usuario = req.user.id; 
    const connection = await pool.getConnection();

    // LÓGICA SEGURA DE SALVAMENTO DA FOTO
    let fotoUrlSalva = null;
    
    if (fotoBase64) {
        try {
            // Remove o cabeçalho do base64
            const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');

            // Trava de segurança: Arquivo de no máximo 2MB no backend
            if (buffer.length > 2 * 1024 * 1024) {
                return res.status(400).json({ message: "A imagem excede o limite de tamanho permitido no servidor." });
            }

            // Cria um nome em hash aleatório e força a extensão jpeg
            const hash = crypto.randomBytes(16).toString('hex');
            const nomeArquivo = `${hash}.jpeg`;
            
            // Diretório de uploads no frontend
            const pastaUploads = path.join(__dirname, '../../frontend/uploads');
            if (!fs.existsSync(pastaUploads)) {
                fs.mkdirSync(pastaUploads, { recursive: true });
            }
            
            // Grava o arquivo físico
            const uploadPath = path.join(pastaUploads, nomeArquivo);
            fs.writeFileSync(uploadPath, buffer);
            
            // URL que será gravada no banco
            fotoUrlSalva = '/uploads/' + nomeArquivo;
            
        } catch (err) {
            console.error("Erro ao salvar a foto:", err);
            return res.status(500).json({ message: 'Falha ao processar a foto do pet.' });
        }
    }

    try {
        await connection.beginTransaction();

        // 1. Insere na tabela 'pets' com a foto
        const sqlPet = `
            INSERT INTO pets 
            (nome, id_usuario, especie, raca, idade_valor, idade_unidade, idade_meses, peso, sexo, cor, data_nascimento, foto_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [petResult] = await connection.execute(sqlPet, [
            nome || null, id_usuario, especie || null, raca || null,
            idadeValor || null, idadeUnidade || 'anos',
            idadeMeses || null, peso || null, sexo || null, cor || null, dataNascimento || null, fotoUrlSalva
        ]);

        const id_pet = petResult.insertId;

        // 2. Insere a lista de vacinas se houver
        if (vacinas && vacinas.length > 0) {
            const sqlVacina = `INSERT INTO vacinas (id_dataset, nome, data_aplicacao, proxima_aplicacao, data_desconhecida, id_pet) VALUES (?, ?, ?, '0000-00-00', ?, ?)`;
            for (const v of vacinas) {
                await connection.execute(sqlVacina, [v.idDataset || null, v.nome, v.data_aplicacao || null, v.data_desconhecida, id_pet]);
            }
        }

        // 3. Insere a lista de medicações se houver
        if (medicamentos && medicamentos.length > 0) {
            const sqlMedicamento = `INSERT INTO medicamentos (id_dataset, id_pet, nome_medicamento, data_aplicacao, data_desconhecida) VALUES (?, ?, ?, ?, ?)`;
            for (const m of medicamentos) {
                await connection.execute(sqlMedicamento, [m.idDataset || null, id_pet, m.nome, m.data_aplicacao || null, m.data_desconhecida]);
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Pet e histórico médico salvos com sucesso!' });

    } catch (error) {
        // Se a transação SQL falhar, desfazemos tudo
        await connection.rollback();
        console.error(error);
        
        // Limpeza (Rollback Físico): Apaga a foto que acabou de ser salva para não deixar lixo no servidor
        if (fotoUrlSalva) {
            const fileToRemove = path.join(__dirname, '../../frontend', fotoUrlSalva);
            if (fs.existsSync(fileToRemove)) fs.unlinkSync(fileToRemove);
        }

        res.status(500).json({ message: 'Erro ao salvar o cadastro no banco de dados.' });
    } finally {
        connection.release(); 
    }
});

// Rota 3: Excluir pet
router.delete('/:id', authenticateToken, async (req, res) => {
    const petId = req.params.id;
    const userId = req.user.id;

    try {
        // 1. Busca a URL da foto para deletar do servidor
        const [pet] = await pool.execute('SELECT foto_url FROM pets WHERE id_pet = ? AND id_usuario = ?', [petId, userId]);
        
        if (pet.length === 0) {
            return res.status(404).json({ message: 'Pet não encontrado ou você não tem permissão para excluí-lo.' });
        }

        const fotoUrl = pet[0].foto_url;

        // 2. Deleta o pet do banco de dados (o CASCADE apagará vacinas, medicamentos e consultas)
        await pool.execute('DELETE FROM pets WHERE id_pet = ? AND id_usuario = ?', [petId, userId]);

        // 3. Deleta o arquivo de imagem fisicamente do servidor
        if (fotoUrl && fotoUrl.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '../../frontend', fotoUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Apaga o arquivo
            }
        }

        res.status(200).json({ message: 'Pet e imagem excluídos com sucesso!' });

    } catch (error) {
        console.error("Erro ao excluir pet:", error);
        res.status(500).json({ message: 'Erro interno ao excluir o pet.' });
    }
});

// Rota 4: Buscar detalhes de um pet específico para o perfil
router.get('/:id', authenticateToken, async (req, res) => {
    const petId = req.params.id;
    const userId = req.user.id;

    try {
        const sql = `SELECT * FROM pets WHERE id_pet = ? AND id_usuario = ?`;
        const [rows] = await pool.execute(sql, [petId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pet não encontrado.' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar perfil do pet:", error);
        res.status(500).json({ message: 'Erro interno ao carregar perfil do pet.' });
    }
});

// Rota 5: Buscar o histórico unificado (Tutor e Veterinário protegidos)
router.get('/:id/historico', authenticateToken, async (req, res) => {
    const petId = req.params.id;
    const userId = req.user.id;

    try {
        // 1. Validação de segurança: O usuário é o dono (id_usuario) OU é o veterinário vinculado?
        const sqlValidacao = `
            SELECT p.id_pet 
            FROM pets p 
            LEFT JOIN veterinarios v ON p.id_veterinario = v.id_veterinario
            WHERE p.id_pet = ? AND (p.id_usuario = ? OR v.user_id = ?)
        `;
        const [pet] = await pool.execute(sqlValidacao, [petId, userId, userId]);
        
        if (pet.length === 0) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para visualizar este histórico.' });
        }

        // 2. Buscando exatamente nas tabelas onde o tutor inseriu os dados
        const [vacinas] = await pool.execute(
            'SELECT nome, data_aplicacao as data_registro FROM vacinas WHERE id_pet = ?', 
            [petId]
        );
        
        const [medicamentos] = await pool.execute(
            'SELECT nome_medicamento as nome, data_aplicacao as data_registro FROM medicamentos WHERE id_pet = ?', 
            [petId]
        );
        
        const [prontuarios] = await pool.execute(
            'SELECT motivo as nome, data_consulta as data_registro FROM prontuario WHERE id_pet = ?', 
            [petId]
        );

        // 3. Unificar as listas e organizar a ordem cronológica
        const historicoCompleto = [
            ...vacinas.map(v => ({ categoria: 'Vacina', nome: v.nome, data: v.data_registro })),
            ...medicamentos.map(m => ({ categoria: 'Medicação', nome: m.nome, data: m.data_registro })),
            ...prontuarios.map(p => ({ categoria: 'Exame/Consulta', nome: p.nome, data: p.data_registro }))
        ].sort((a, b) => {
            const dataA = a.data ? new Date(a.data).getTime() : 0;
            const dataB = b.data ? new Date(b.data).getTime() : 0;
            return dataB - dataA; 
        });

        res.status(200).json(historicoCompleto);
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        res.status(500).json({ message: 'Erro interno ao consultar banco de dados.' });
    }
});

module.exports = router;