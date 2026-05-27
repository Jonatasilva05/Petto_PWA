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

// Rota: Listar pacientes do veterinário (Mantida do seu código original)
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

// NOVA Rota: Métricas para o Dashboard
router.get('/dashboard-metrics', authenticateToken, async (req, res) => {
    try {
        // 1. Descobrir o id_veterinario usando o ID do usuário logado (req.user.id)
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        
        if (vetResult.length === 0) {
            return res.status(404).json({ message: 'Perfil de veterinário não encontrado para este usuário.' });
        }
        
        const idVeterinario = vetResult[0].id_veterinario;

        // 2. Executar as queries usando o id_veterinario correto
        const queryPets = `SELECT COUNT(*) as total FROM pets WHERE id_veterinario = ?`;
        const queryTutores = `SELECT COUNT(DISTINCT id_usuario) as total FROM pets WHERE id_veterinario = ? AND id_usuario IS NOT NULL`;
        const queryConsultas = `SELECT COUNT(*) as total FROM agendamentos WHERE id_veterinario = ? AND DATE(data_hora) = CURDATE()`;
        const queryVacinas = `
            SELECT COUNT(*) as total 
            FROM vacinas 
            WHERE id_veterinario = ? 
            AND proxima_aplicacao BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        `;

        const [
            [resultPets],
            [resultTutores],
            [resultConsultas],
            [resultVacinas]
        ] = await Promise.all([
            pool.execute(queryPets, [idVeterinario]),
            pool.execute(queryTutores, [idVeterinario]),
            pool.execute(queryConsultas, [idVeterinario]),
            pool.execute(queryVacinas, [idVeterinario])
        ]);

        res.json({
            totalPets: resultPets[0].total,
            totalTutores: resultTutores[0].total,
            consultasHoje: resultConsultas[0].total,
            vacinasPendentes: resultVacinas[0].total
        });

    } catch (error) {
        console.error('Erro ao buscar métricas do dashboard:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

module.exports = router;