require('dotenv').config();

const express = require('express');
const cors = require('cors');
const os = require('os');
const path = require('path');
const qrcode = require('qrcode-terminal');

const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const vetRoutes = require('./routes/vetRoutes');

const app = express();
const port = 3000;

/* =========================================
   CONFIGURAÇÕES GERAIS
========================================= */

app.use(cors());

// FORÇA UTF-8 NO JSON
app.use(express.json({
    type: 'application/json',
    limit: '10mb'
}));

app.use(express.urlencoded({
    extended: true
}));

/* =========================================
   FRONTEND (UTF-8)
========================================= */

const frontendPath = path.join(__dirname, '../frontend');

app.use(express.static(frontendPath, {
    setHeaders: (res, filePath) => {

        // HTML
        if (filePath.endsWith('.html')) {
            res.setHeader(
                'Content-Type',
                'text/html; charset=utf-8'
            );
        }

        // JS
        else if (filePath.endsWith('.js')) {
            res.setHeader(
                'Content-Type',
                'application/javascript; charset=utf-8'
            );
        }

        // CSS
        else if (filePath.endsWith('.css')) {
            res.setHeader(
                'Content-Type',
                'text/css; charset=utf-8'
            );
        }

        // JSON
        else if (filePath.endsWith('.json')) {
            res.setHeader(
                'Content-Type',
                'application/json; charset=utf-8'
            );
        }
    }
}));

/* =========================================
   ROTAS
========================================= */

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/vet', vetRoutes);

/* =========================================
   TESTE UTF-8
========================================= */

app.get('/teste', (req, res) => {
    res.send('Olá João, vacinação, cão, coração, ação, informação');
});

/* =========================================
   IP LOCAL
========================================= */

const getLocalIp = () => {

    const interfaces = os.networkInterfaces();

    for (let devName in interfaces) {

        let iface = interfaces[devName];

        for (let i = 0; i < iface.length; i++) {

            let alias = iface[i];

            // IPv4 válido
            if (
                alias.family === 'IPv4' &&
                alias.address !== '127.0.0.1' &&
                !alias.internal
            ) {

                // Ignora VirtualBox
                if (!alias.address.startsWith('192.168.56.')) {
                    return alias.address;
                }
            }
        }
    }

    return 'localhost';
};

/* =========================================
   START SERVER
========================================= */

const startServer = async () => {

    try {

        // TESTE BANCO
        await pool.query('SELECT 1');

        console.log('✅ Conexão com o banco estabelecida.');

        app.listen(port, '0.0.0.0', () => {

            const ipLocal = getLocalIp();

            const urlMobile = `http://${ipLocal}:${port}`;
            const urlDesktop = `http://localhost:${port}`;

            console.log(`\n🚀 Servidor Petto ativo na porta ${port}`);
            console.log(`💻 PC: ${urlDesktop}`);

            console.log('\n=========================================');
            console.log('📱 Escaneie no celular');
            console.log('=========================================\n');

            qrcode.generate(urlMobile, {
                small: true
            });

            console.log(`\n🌐 Wi-Fi: ${urlMobile}\n`);
        });

    } catch (error) {

        console.error('❌ ERRO:', error.message);

        process.exit(1);
    }
};

startServer();