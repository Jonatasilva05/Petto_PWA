const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

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
            SELECT p.id_pet, p.nome, p.raca, p.foto_url, 
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

// Rota 2: Cadastro Completo Relacional com Transação SQL e Upload de Foto
router.post('/cadastro-completo', authenticateToken, async (req, res) => {
    const { 
        nome, especie, raca, fotoBase64, dataNascimento, idadeValor, 
        idadeUnidade, idadeMeses, peso, sexo, cor, vacinas, medicamentos 
    } = req.body;
    
    const id_usuario = req.user.id; 
    const connection = await pool.getConnection();

    // LÓGICA DE SALVAMENTO DA FOTO
    let fotoUrlSalva = null;
    if (fotoBase64 && fotoBase64.includes('base64')) {
        try {
            const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, "");
            const extensao = fotoBase64.substring(fotoBase64.indexOf('/') + 1, fotoBase64.indexOf(';base64'));
            const nomeArquivo = Date.now() + '_' + Math.round(Math.random() * 1000) + '.' + extensao;
            
            // Vai salvar na pasta frontend/uploads. IMPORTANTE: Crie essa pasta se não existir!
            const pastaUploads = path.join(__dirname, '../../frontend/uploads');
            if (!fs.existsSync(pastaUploads)) fs.mkdirSync(pastaUploads, { recursive: true });
            
            fs.writeFileSync(path.join(pastaUploads, nomeArquivo), base64Data, 'base64');
            fotoUrlSalva = '/uploads/' + nomeArquivo;
        } catch (err) {
            console.error("Erro ao salvar a foto:", err);
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
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erro ao salvar o cadastro no banco de dados.' });
    } finally {
        connection.release(); 
    }
});

module.exports = router;