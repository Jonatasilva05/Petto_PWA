require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
// Exemplo: const petRoutes = require('./routes/petRoutes');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Rotas Modularizadas
app.use('/api/auth', authRoutes);

const startServer = async () => {
    try {
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