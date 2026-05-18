const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Middleware para proteger as rotas de pets
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

// ==========================================
// ROTA: LISTAR PETS
// ==========================================
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

// ==========================================
// ROTA: CADASTRAR NOVO PET
// ==========================================
router.post('/cadastro', authenticateToken, async (req, res) => {
    const { nome, especie, raca, fotoBase64, data_nascimento, idade_valor, idade_unidade, sexo, peso, cor } = req.body;
    const id_usuario = req.user.id;

    let foto_url = null;

    // Processamento da Imagem Base64
    if (fotoBase64) {
        // Extrai a extensão e os dados puros da imagem
        const matches = fotoBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]; // Normaliza jpeg para jpg
            const buffer = Buffer.from(matches[2], 'base64');
            
            // Gera um nome único (Ex: 8f4b2c1d.jpg)
            const fileName = crypto.randomBytes(16).toString('hex') + '.' + ext;
            
            // Define o caminho para a pasta "uploads" dentro do seu "frontend"
            const uploadDir = path.join(__dirname, '../../frontend/uploads');
            
            // Cria a pasta automaticamente se ela não existir
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Salva o arquivo fisicamente
            fs.writeFileSync(path.join(uploadDir, fileName), buffer);
            
            // Salva o caminho relativo no banco para o HTML conseguir ler depois
            foto_url = './uploads/' + fileName;
        }
    }

    try {
        const sql = `
            INSERT INTO pets 
            (nome, id_usuario, especie, raca, idade_valor, idade_unidade, peso, sexo, cor, data_nascimento, foto_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
        await pool.execute(sql, [
            nome, id_usuario, especie, raca, 
            idade_valor || null, idade_unidade || null, 
            peso || null, sexo || null, cor || null, 
            data_nascimento || null, foto_url
        ]);

        res.status(201).json({ message: 'Pet cadastrado com sucesso!' });
    } catch (error) {
        console.error("Erro ao salvar pet:", error);
        res.status(500).json({ message: 'Erro ao salvar o pet no banco de dados.' });
    }
});

module.exports = router;