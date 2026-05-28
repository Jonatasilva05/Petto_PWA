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

// NOVA Rota: Salvar Prontuário
router.post('/prontuario', authenticateToken, async (req, res) => {
    const { id_pet, data_consulta, motivo, diagnostico, tratamento } = req.body;

    // Validação básica
    if (!id_pet || !data_consulta || !motivo) {
        return res.status(400).json({ message: 'Paciente, data e motivo são obrigatórios.' });
    }

    try {
        // 1. Descobre o id_veterinario de forma segura pelo Token (req.user.id)
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);

        if (vetResult.length === 0) {
            return res.status(403).json({ message: 'Acesso negado. Perfil de veterinário não encontrado.' });
        }

        const idVeterinario = vetResult[0].id_veterinario;

        // 2. Insere os dados na tabela prontuario
        const sql = `
            INSERT INTO prontuario (id_pet, id_veterinario, data_consulta, motivo, diagnostico, tratamento) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await pool.execute(sql, [
            id_pet,
            idVeterinario,
            data_consulta,
            motivo,
            diagnostico || null,
            tratamento || null
        ]);

        res.status(201).json({ message: 'Prontuário salvo com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar prontuário:', error);
        res.status(500).json({ message: 'Erro interno ao gravar no banco de dados.' });
    }
});

// NOVA Rota: Salvar Agendamento pelo Veterinário
router.post('/agendamento', authenticateToken, async (req, res) => {
    const { id_pet, data_hora } = req.body;

    if (!id_pet || !data_hora) {
        return res.status(400).json({ message: 'Paciente e data/hora são obrigatórios.' });
    }

    try {
        // Descobre quem é o veterinário logado pelo Token JWT
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) return res.status(403).json({ message: 'Acesso negado.' });
        
        const idVeterinario = vetResult[0].id_veterinario;
        
        // Insere a consulta (Quando o Vet agenda, já entra como "Confirmada")
        const sql = 'INSERT INTO agendamentos (id_pet, id_veterinario, data_hora, status) VALUES (?, ?, ?, ?)';
        await pool.execute(sql, [id_pet, idVeterinario, data_hora, 'Confirmada']);

        res.status(201).json({ message: 'Consulta agendada com sucesso!' });
    } catch (error) {
        console.error('Erro ao agendar consulta:', error);
        res.status(500).json({ message: 'Erro interno ao salvar o agendamento.' });
    }
});

const bcrypt = require('bcryptjs'); // Certifique-se de que o bcrypt está importado no topo

// ==========================================
// NOVA Rota: Listar Tutores da Clínica
// ==========================================
router.get('/tutores', authenticateToken, async (req, res) => {
    try {
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) return res.status(403).json({ message: 'Acesso negado.' });
        
        const idVet = vetResult[0].id_veterinario;

        // Busca os tutores vinculados e já conta/lista os pets que eles têm nessa clínica
        const sql = `
            SELECT 
                u.id, u.nome, u.email, u.telefone, u.endereco,
                (SELECT COUNT(*) FROM pets p WHERE p.id_usuario = u.id AND p.id_veterinario = ?) as total_pets,
                (SELECT GROUP_CONCAT(p.nome SEPARATOR ', ') FROM pets p WHERE p.id_usuario = u.id AND p.id_veterinario = ?) as nomes_pets
            FROM usuarios u
            JOIN vet_clientes vc ON u.id = vc.id_usuario
            WHERE vc.id_veterinario = ?
            ORDER BY u.nome ASC
        `;
        
        const [tutores] = await pool.execute(sql, [idVet, idVet, idVet]);
        res.json(tutores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar tutores.' });
    }
});

// ==========================================
// NOVA Rota: Veterinário Cadastrar Novo Tutor
// ==========================================
router.post('/tutor', authenticateToken, async (req, res) => {
    const { nome, cpf, telefone, email, endereco_completo } = req.body;
    
    if (!nome || !email) return res.status(400).json({ message: 'Nome e email são obrigatórios.' });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [vetResult] = await connection.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) throw new Error('Acesso negado.');
        const idVet = vetResult[0].id_veterinario;

        // Verifica se o usuário já existe na plataforma Petto
        const [users] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email.trim()]);
        let idUsuario;

        if (users.length > 0) {
            idUsuario = users[0].id; // Se já existir, aproveita o ID
        } else {
            // Se for novo, cria a conta com senha padrão "petto123"
            const senhaHash = await bcrypt.hash('petto123', 10);
            const sqlInsert = 'INSERT INTO usuarios (nome, email, senha, telefone, cpf, endereco, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : null;
            
            const [result] = await connection.execute(sqlInsert, [
                nome.trim(), email.trim(), senhaHash, telefone || null, cpfLimpo, endereco_completo || null, 'tutor'
            ]);
            idUsuario = result.insertId;
        }

        // Vincula o tutor ao veterinário
        await connection.execute('INSERT IGNORE INTO vet_clientes (id_veterinario, id_usuario) VALUES (?, ?)', [idVet, idUsuario]);

        await connection.commit();
        res.status(201).json({ message: 'Tutor salvo e vinculado com sucesso!' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar tutor no banco.' });
    } finally {
        connection.release();
    }
});

module.exports = router;