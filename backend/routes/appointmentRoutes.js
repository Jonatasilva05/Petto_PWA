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
        
        // O CÓDIGO DE PROTEÇÃO ENTRA AQUI!
        await pool.execute(sql, [
            parseInt(id_pet, 10), 
            parseInt(id_veterinario, 10), 
            data_hora
        ]);
        
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

// Rota para listar agendamentos do usuário logado (usada no calendário)
router.get('/usuario', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT a.id_agendamento, a.data_hora, a.status, p.nome as nome_pet, a.id_pet 
            FROM agendamentos a
            JOIN pets p ON a.id_pet = p.id_pet
            WHERE p.id_usuario = ?
            ORDER BY a.data_hora ASC
        `;
        const [agendamentos] = await pool.execute(sql, [req.user.id]);
        console.log("Agendamentos encontrados:", agendamentos); // Adicione isso para ver no terminal!
        res.status(200).json(agendamentos);
    } catch (error) {
        console.error("Erro no backend:", error);
        res.status(500).json({ message: 'Erro ao buscar suas consultas.' });
    }
});

// NOVA Rota: Consultas de hoje para o Dashboard do Veterinário
router.get('/hoje', authenticateToken, async (req, res) => {
    try {
        // Descobre o id_veterinario do usuário logado
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        
        if (vetResult.length === 0) {
             return res.status(403).json({ message: 'Acesso negado. Apenas veterinários podem acessar esta rota.' });
        }
        
        const idVeterinario = vetResult[0].id_veterinario;

        const query = `
            SELECT 
                a.id_agendamento,
                a.status,
                DATE_FORMAT(a.data_hora, '%H:%i') as hora,
                p.nome as pet_nome,
                u.nome as tutor_nome,
                v.nome as veterinario_nome
            FROM agendamentos a
            JOIN pets p ON a.id_pet = p.id_pet
            LEFT JOIN usuarios u ON p.id_usuario = u.id
            JOIN veterinarios v ON a.id_veterinario = v.id_veterinario
            WHERE a.id_veterinario = ? 
            AND DATE(a.data_hora) = CURDATE()
            ORDER BY a.data_hora ASC
        `;

        const [consultas] = await pool.execute(query, [idVeterinario]);

        res.json(consultas);

    } catch (error) {
        console.error('Erro ao buscar consultas de hoje:', error);
        res.status(500).json({ message: 'Erro ao carregar agendamentos' });
    }
});

module.exports = router;