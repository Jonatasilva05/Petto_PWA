const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Acesso negado.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err || user.role !== 'veterinario') return res.status(403).json({ message: 'Acesso restrito.' });
        req.user = user;
        next();
    });
};

// Listar pacientes do veterinário
router.get('/pacientes', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT p.id_pet, p.nome, p.raca, p.foto_url, u.nome as nome_tutor 
            FROM pets p JOIN usuarios u ON p.id_usuario = u.id 
            WHERE p.id_veterinario = (SELECT id_veterinario FROM veterinarios WHERE user_id = ?)`;
        const [pacientes] = await pool.execute(sql, [req.user.id]);
        res.status(200).json(pacientes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pacientes.' });
    }
});

module.exports = router;