const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

    let fotoUrlSalva = null;
    
    if (fotoBase64) {
        try {
            const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');

            if (buffer.length > 2 * 1024 * 1024) {
                return res.status(400).json({ message: "A imagem excede o limite de tamanho permitido no servidor." });
            }

            const hash = crypto.randomBytes(16).toString('hex');
            const nomeArquivo = `${hash}.jpeg`;
            
            const pastaUploads = path.join(__dirname, '../../frontend/uploads');
            if (!fs.existsSync(pastaUploads)) {
                fs.mkdirSync(pastaUploads, { recursive: true });
            }
            
            const uploadPath = path.join(pastaUploads, nomeArquivo);
            fs.writeFileSync(uploadPath, buffer);
            
            fotoUrlSalva = '/uploads/' + nomeArquivo;
            
        } catch (err) {
            console.error("Erro ao salvar a foto:", err);
            return res.status(500).json({ message: 'Falha ao processar a foto do pet.' });
        }
    }

    try {
        await connection.beginTransaction();

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

        if (vacinas && vacinas.length > 0) {
            const sqlVacina = `INSERT INTO vacinas (id_dataset, nome, data_aplicacao, proxima_aplicacao, data_desconhecida, id_pet) VALUES (?, ?, ?, '0000-00-00', ?, ?)`;
            for (const v of vacinas) {
                await connection.execute(sqlVacina, [v.idDataset || null, v.nome, v.data_aplicacao || null, v.data_desconhecida, id_pet]);
            }
        }

        if (medicamentos && medicamentos.length > 0) {
            const sqlMedicamento = `INSERT INTO medicamentos (id_dataset, id_pet, nome_medicamento, data_aplicacao, data_desconhecida) VALUES (?, ?, ?, ?, ?)`;
            for (const m of medicamentos) {
                await connection.execute(sqlMedicamento, [m.idDataset || null, id_pet, m.nome, m.data_aplicacao || null, m.data_desconhecida]);
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Pet e histórico médico salvos com sucesso!' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        
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
        const [pet] = await pool.execute('SELECT foto_url FROM pets WHERE id_pet = ? AND id_usuario = ?', [petId, userId]);
        
        if (pet.length === 0) {
            return res.status(404).json({ message: 'Pet não encontrado ou você não tem permissão para excluí-lo.' });
        }

        const fotoUrl = pet[0].foto_url;

        await pool.execute('DELETE FROM pets WHERE id_pet = ? AND id_usuario = ?', [petId, userId]);

        if (fotoUrl && fotoUrl.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '../../frontend', fotoUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); 
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
    const petId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    try {
        const sqlValidacao = `
            SELECT p.id_pet 
            FROM pets p 
            LEFT JOIN veterinarios v ON p.id_veterinario = v.id_veterinario
            WHERE p.id_pet = ? AND (p.id_usuario = ? OR v.user_id = ?)
        `;
        const [pet] = await pool.query(sqlValidacao, [petId, userId, userId]);
        
        if (pet.length === 0) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para visualizar este histórico.' });
        }

        const query = `
            SELECT 
                'Vacina' AS categoria,
                v.nome AS nome,
                v.data_aplicacao AS data,
                vet.nome AS veterinario,
                v.id_dataset  
            FROM vacinas v
            LEFT JOIN veterinarios vet ON v.id_veterinario = vet.id_veterinario
            WHERE v.id_pet = ?

            UNION ALL
            SELECT 
                'Medicação' AS categoria,
                m.nome_medicamento AS nome,
                m.data_aplicacao AS data,
                vet.nome AS veterinario,
                m.id_dataset
            FROM medicamentos m
            LEFT JOIN veterinarios vet ON m.id_veterinario = vet.id_veterinario
            WHERE m.id_pet = ?

            ORDER BY data DESC
        `;

        const [rows] = await pool.query(query, [petId, petId, petId]);
        res.status(200).json(rows);

    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        res.status(500).json({ message: 'Erro interno ao consultar banco de dados.' });
    }
});

module.exports = router;