const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

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

// Rota para listar pets do tutor logado
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

module.exports = router;