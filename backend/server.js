require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const pool = require('./config/db');

// 1. Importar as rotas primeiro
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes'); 
const vetRoutes = require('./routes/vetRoutes'); 

// 2. Inicializar o app (ESSENCIAL vir antes de qualquer app.use)
const app = express();
const port = 3000;

// 3. Configurar Middlewares básicos
app.use(cors());
app.use(express.json());

// 4. Registrar as Rotas Modularizadas
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes); 
app.use('/api/vet', vetRoutes);  

// 5. Função de inicialização
const startServer = async () => {
    try {
        // Testa a conexão com o banco (pool importado do db.js)
        await pool.query('SELECT 1');
        console.log('✅ Conexão com o banco de dados estabelecida.'); 
        
        app.listen(port, '0.0.0.0', () => {
            console.log(`\n🚀 O PWA Petto Back-end Modularizado está Rodando na porta ${port}.`); 
        });
    } catch (error) {
        console.error('❌ ERRO:', error.message);
        process.exit(1);
    }
};

startServer();