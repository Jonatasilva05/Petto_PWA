const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

// ==========================================
// 1. Rota: Listar Pacientes (Apenas os selecionados/vinculados ao Vet)
// ==========================================
router.get('/pacientes', authenticateToken, async (req, res) => {
    try {
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        console.log("Veterinário logado (user_id):", req.user.id);
        console.log("ID do Veterinário no banco:", vetResult.length > 0 ? vetResult[0].id_veterinario : "NENHUM");
        if (vetResult.length === 0) return res.status(403).json({ message: 'Perfil não encontrado.' });
        const idVet = vetResult[0].id_veterinario;

        // Ao checar apenas "vc.id_veterinario = ?", permitimos que o Vet veja os pets de qualquer tutor que ele atenda,
        // mesmo que o campo id_veterinario direto na tabela 'pets' esteja NULL.
        const sql = `
            SELECT 
                p.id_pet, p.nome as pet_nome, p.raca, p.especie, p.idade_valor, p.idade_unidade, p.peso, p.foto_url,
                u.id as id_tutor, u.nome as tutor_nome 
            FROM pets p
LEFT JOIN usuarios u ON p.id_usuario = u.id
LEFT JOIN vet_clientes vc ON u.id = vc.id_usuario
WHERE vc.id_veterinario = ? OR p.id_usuario IS NULL
            ORDER BY p.nome ASC`;

        const [pacientes] = await pool.execute(sql, [idVet]);
        res.status(200).json(pacientes);
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ message: 'Erro ao buscar pacientes.' });
    }
});

// Rota: Métricas para o Dashboard
router.get('/dashboard-metrics', authenticateToken, async (req, res) => {
    try {
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) return res.status(404).json({ message: 'Perfil não encontrado.' });
        const idVeterinario = vetResult[0].id_veterinario;

        const queryPets = `SELECT COUNT(*) as total FROM pets WHERE id_veterinario = ?`;
        const queryTutores = `SELECT COUNT(DISTINCT id_usuario) as total FROM pets WHERE id_veterinario = ? AND id_usuario IS NOT NULL`;
        const queryConsultas = `SELECT COUNT(*) as total FROM agendamentos WHERE id_veterinario = ? AND DATE(data_hora) = CURDATE()`;
        const queryVacinas = `SELECT COUNT(*) as total FROM vacinas WHERE id_veterinario = ? AND proxima_aplicacao BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`;

        const [[resultPets], [resultTutores], [resultConsultas], [resultVacinas]] = await Promise.all([
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
        console.error('Erro dashboard:', error);
        res.status(500).json({ message: 'Erro interno' });
    }
});

// Rota: Salvar Prontuário
router.post('/prontuario', authenticateToken, async (req, res) => {
    const { id_pet, data_consulta, motivo, diagnostico, tratamento } = req.body;
    if (!id_pet || !data_consulta || !motivo) return res.status(400).json({ message: 'Dados obrigatórios faltando.' });

    try {
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) return res.status(403).json({ message: 'Acesso negado.' });
        const idVeterinario = vetResult[0].id_veterinario;

        const sql = `INSERT INTO prontuario (id_pet, id_veterinario, data_consulta, motivo, diagnostico, tratamento) VALUES (?, ?, ?, ?, ?, ?)`;
        await pool.execute(sql, [id_pet, idVeterinario, data_consulta, motivo, diagnostico || null, tratamento || null]);
        res.status(201).json({ message: 'Prontuário salvo com sucesso!' });
    } catch (error) {
        console.error('Erro prontuario:', error);
        res.status(500).json({ message: 'Erro ao gravar.' });
    }
});

router.post('/agendamento', authenticateToken, async (req, res) => {
    const { id_pet, data_hora, vincular_tutor } = req.body;
    if (!id_pet || !data_hora) return res.status(400).json({ message: 'Campos obrigatórios faltando.' });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [vetResult] = await connection.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) throw new Error('Acesso negado.');
        const idVeterinario = vetResult[0].id_veterinario;

        // 1. Salva o Agendamento
        const sql = 'INSERT INTO agendamentos (id_pet, id_veterinario, data_hora, status) VALUES (?, ?, ?, ?)';
        await connection.execute(sql, [id_pet, idVeterinario, data_hora, 'Confirmada']);

        // 2. Se o check de vincular estiver marcado, fazemos o link na vet_clientes
        if (vincular_tutor) {
            // Primeiro pegamos o dono do pet
            const [petResult] = await connection.execute('SELECT id_usuario FROM pets WHERE id_pet = ?', [id_pet]);
            if (petResult.length > 0 && petResult[0].id_usuario) {
                const idUsuario = petResult[0].id_usuario;
                // Vincula (IGNORE para não duplicar se já existir)
                await connection.execute('INSERT IGNORE INTO vet_clientes (id_veterinario, id_usuario) VALUES (?, ?)', [idVeterinario, idUsuario]);
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Consulta agendada!' });
    } catch (error) {
        await connection.rollback();
        console.error('Erro agendamento:', error);
        res.status(500).json({ message: 'Erro ao agendar.' });
    } finally {
        connection.release();
    }
});

// ==========================================
// 2. Rota: BUSCAR Tutor e seus Pets (Por CPF ou Email)
// ==========================================
router.post('/buscar-tutor', authenticateToken, async (req, res) => {
    const { tipo, termo } = req.body; // tipo pode ser 'cpf' ou 'email'
    if (!termo) return res.status(400).json({ message: 'Preencha o campo de busca.' });

    try {
        let queryTutor = '';
        let paramsTutor = [];

        if (tipo === 'cpf') {
            const cpfLimpo = termo.replace(/\D/g, '');
            queryTutor = 'SELECT id, nome, email, cpf FROM usuarios WHERE cpf = ? AND role = "tutor"';
            paramsTutor = [cpfLimpo];
        } else {
            queryTutor = 'SELECT id, nome, email, cpf FROM usuarios WHERE email = ? AND role = "tutor"';
            paramsTutor = [termo.trim()];
        }

        const [users] = await pool.execute(queryTutor, paramsTutor);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Nenhum tutor encontrado com esta informação.' });
        }

        const tutor = users[0];

        // Busca os pets desse tutor
        const [pets] = await pool.execute('SELECT id_pet, nome, especie, raca, id_veterinario FROM pets WHERE id_usuario = ?', [tutor.id]);

        res.status(200).json({ tutor, pets });
    } catch (error) {
        console.error('Erro ao buscar tutor:', error);
        res.status(500).json({ message: 'Erro interno ao buscar dados.' });
    }
});

// Rota: Veterinário Cadastrar Novo Tutor
router.post('/tutor', authenticateToken, async (req, res) => {
    const { nome, cpf, telefone, email, endereco_completo, senha } = req.body;
    if (!nome || !email) return res.status(400).json({ message: 'Nome e email são obrigatórios.' });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [vetResult] = await connection.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) throw new Error('Acesso negado.');
        const idVet = vetResult[0].id_veterinario;

        const [users] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email.trim()]);
        let idUsuario;

        if (users.length > 0) {
            idUsuario = users[0].id;
        } else {
            const senhaUsar = senha ? senha.trim() : 'petto123';
            const senhaHash = await bcrypt.hash(senhaUsar, 10);
            const sqlInsert = 'INSERT INTO usuarios (nome, email, senha, telefone, cpf, endereco, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : null;
            const [result] = await connection.execute(sqlInsert, [nome.trim(), email.trim(), senhaHash, telefone || null, cpfLimpo, endereco_completo || null, 'tutor']);
            idUsuario = result.insertId;
        }

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

// Rota: Listar Clientes (Tutores) do Veterinário
router.get('/tutores', authenticateToken, async (req, res) => {
    try {
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) return res.status(403).json({ message: 'Perfil não encontrado.' });
        const idVet = vetResult[0].id_veterinario;

        const query = `
            SELECT 
                u.id, 
                u.nome, 
                u.email, 
                u.telefone, 
                u.endereco,
                (SELECT COUNT(*) FROM pets p WHERE p.id_usuario = u.id) as total_pets
            FROM vet_clientes vc
            JOIN usuarios u ON vc.id_usuario = u.id
            WHERE vc.id_veterinario = ?
            ORDER BY u.nome ASC
        `;
        const [tutores] = await pool.execute(query, [idVet]);
        res.status(200).json(tutores);
    } catch (error) {
        console.error('Erro ao buscar tutores:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// ==========================================
// 3. Rota: VINCULAR Tutor e Pets Selecionados
// ==========================================
router.post('/vincular-tutor-pets', authenticateToken, async (req, res) => {
    const { id_tutor, pets_ids } = req.body;
    
    if (!id_tutor || !pets_ids || pets_ids.length === 0) {
        return res.status(400).json({ message: 'Selecione o tutor e ao menos um pet para vincular.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [vetResult] = await connection.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) throw new Error('Acesso negado.');
        const idVet = vetResult[0].id_veterinario;

        // 1. Vincula o tutor na clínica (IGNORA se já estiver vinculado)
        await connection.execute('INSERT IGNORE INTO vet_clientes (id_veterinario, id_usuario) VALUES (?, ?)', [idVet, id_tutor]);

        // 2. Atualiza os pets selecionados informando que agora este veterinário tem acesso a eles
        const placeholders = pets_ids.map(() => '?').join(',');
        const sqlPets = `UPDATE pets SET id_veterinario = ? WHERE id_pet IN (${placeholders}) AND id_usuario = ?`;
        await connection.execute(sqlPets, [idVet, ...pets_ids, id_tutor]);

        await connection.commit();
        res.status(200).json({ message: 'Pets vinculados com sucesso à sua base!' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erro interno ao vincular os pets.' });
    } finally {
        connection.release();
    }
});

// ==========================================
// ROTA: Buscar a Agenda do Veterinário Logado
// ==========================================
router.get('/agenda', authenticateToken, async (req, res) => {
    try {
        // 1. Pega o ID do veterinário atrelado ao usuário logado (A GARANTIA DE SEGURANÇA)
        const [vetResult] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);

        if (vetResult.length === 0) {
            return res.status(403).json({ message: 'Acesso negado. Perfil de veterinário não encontrado.' });
        }

        const idVet = vetResult[0].id_veterinario;

        // 2. Busca APENAS os agendamentos deste veterinário específico
        const query = `
            SELECT 
                a.id_agendamento,
                a.data_hora,
                a.status,
                p.nome as pet_nome,
                p.raca,
                p.foto_url,
                u.nome as tutor_nome
            FROM agendamentos a
            JOIN pets p ON a.id_pet = p.id_pet
            LEFT JOIN usuarios u ON p.id_usuario = u.id
            WHERE a.id_veterinario = ?
              AND DATE(a.data_hora) >= CURDATE()
              AND DATE(a.data_hora) <= DATE_ADD(CURDATE(), INTERVAL 15 DAY)
            ORDER BY a.data_hora ASC
        `;

        const [agendamentos] = await pool.execute(query, [idVet]);
        res.status(200).json(agendamentos);

    } catch (error) {
        console.error('Erro ao carregar a agenda:', error);
        res.status(500).json({ message: 'Erro interno ao buscar agendamentos.' });
    }
});

// Rota: Buscar todos os pets que já tiveram algum histórico clínico no sistema
router.get('/pacientes-globais', authenticateToken, async (req, res) => {
    try {
        // Esta query ignora a tabela vet_clientes e olha para o histórico real
        const sql = `
            SELECT DISTINCT 
                p.id_pet, 
                p.nome as pet_nome, 
                p.raca, 
                u.id as id_tutor, 
                u.nome as tutor_nome 
            FROM pets p
            LEFT JOIN usuarios u ON p.id_usuario = u.id
            WHERE EXISTS (
                SELECT 1 FROM agendamentos a WHERE a.id_pet = p.id_pet
                UNION
                SELECT 1 FROM prontuario pr WHERE pr.id_pet = p.id_pet
            )
            ORDER BY u.nome ASC`;

        const [pacientes] = await pool.execute(sql);
        res.status(200).json(pacientes);
    } catch (error) {
        console.error('Erro ao buscar base global:', error);
        res.status(500).json({ message: 'Erro ao buscar base de dados.' });
    }
});

// ==========================================
// ROTA: Veterinário Cadastrando Pet Completo para o Tutor
// ==========================================
router.post('/cadastro-pet-tutor', authenticateToken, async (req, res) => {
    const { 
        id_tutor, nome, especie, raca, idadeValor, idadeUnidade, peso, sexo, cor,
        vacinas, medicamentos, prontuario_motivo, prontuario_diagnostico // dados clínicos opcionais
    } = req.body;

    if (!id_tutor || !nome || !especie) {
        return res.status(400).json({ message: 'Tutor, Nome e Espécie são obrigatórios.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Pega o ID do Veterinário logado
        const [vetResult] = await connection.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetResult.length === 0) throw new Error('Acesso negado.');
        const idVet = vetResult[0].id_veterinario;

        // 2. Insere o Pet vinculando ao Tutor E ao Veterinário simultaneamente
        const sqlPet = `
            INSERT INTO pets (nome, id_usuario, especie, raca, idade_valor, idade_unidade, peso, sexo, cor, id_veterinario) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [petResult] = await connection.execute(sqlPet, [
            nome, id_tutor, especie, raca || null, idadeValor || null, idadeUnidade || 'anos', 
            peso || null, sexo || null, cor || null, idVet
        ]);
        const id_pet = petResult.insertId;

        // 3. Opcional: Inserir Vacinas Retroativas
        if (vacinas && vacinas.length > 0) {
            const sqlVacina = `INSERT INTO vacinas (nome, data_aplicacao, id_pet, id_veterinario) VALUES (?, ?, ?, ?)`;
            for (const v of vacinas) {
                await connection.execute(sqlVacina, [v.nome, v.data_aplicacao, id_pet, idVet]);
            }
        }

        // 4. Opcional: Inserir Medicações Retroativas
        if (medicamentos && medicamentos.length > 0) {
            const sqlMed = `INSERT INTO medicamentos (nome_medicamento, data_aplicacao, id_pet, id_veterinario) VALUES (?, ?, ?, ?)`;
            for (const m of medicamentos) {
                await connection.execute(sqlMed, [m.nome, m.data_aplicacao, id_pet, idVet]);
            }
        }

        // 5. Opcional: Inserir Prontuário Base (Primeira Consulta)
        if (prontuario_motivo) {
            const sqlProntuario = `INSERT INTO prontuario (id_pet, id_veterinario, data_consulta, motivo, diagnostico) VALUES (?, ?, CURDATE(), ?, ?)`;
            await connection.execute(sqlProntuario, [id_pet, idVet, prontuario_motivo, prontuario_diagnostico || null]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Pet e histórico cadastrados com sucesso para o tutor!' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar o pet e histórico.' });
    } finally {
        connection.release();
    }
});

module.exports = router;