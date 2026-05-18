const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware de autenticação nativo do Petto
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

// Rota para salvar o agendamento
router.post('/', authenticateToken, async (req, res) => {
    const { id_pet, id_veterinario, data_hora } = req.body;

    if (!id_pet || !id_veterinario || !data_hora) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const sql = 'INSERT INTO agendamentos (id_pet, id_veterinario, data_hora) VALUES (?, ?, ?)';
        await pool.execute(sql, [id_pet, id_veterinario, data_hora]);
        res.status(201).json({ message: 'Consulta agendada com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno ao salvar o agendamento.' });
    }
});

// Rota para listar veterinários na hora de escolher quem vai atender
router.get('/veterinarios', authenticateToken, async (req, res) => {
    try {
        const [vets] = await pool.execute('SELECT id_veterinario, nome, nome_clinica FROM veterinarios');
        res.status(200).json(vets);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar veterinários.' });
    }
});

module.exports = router;