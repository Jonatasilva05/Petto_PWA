require('dotenv').config();

const express = require('express');
const cors = require('cors');
const os = require('os');
const path = require('path');
const qrcode = require('qrcode-terminal');
const readline = require('readline');

const livereload = require('livereload');
const connectLiveReload = require('connect-livereload');

const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const vetRoutes = require('./routes/vetRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const port = 3000;

/* =========================================
   LIVE RELOAD
========================================= */

const liveReloadServer = livereload.createServer({
    exts: ['html', 'css', 'js']
});

liveReloadServer.watch([
    path.join(__dirname, '../frontend')
]);

// força reload automático no navegador/celular
liveReloadServer.server.once('connection', () => {

    setTimeout(() => {

        liveReloadServer.refresh('/');

    }, 100);
});

/* =========================================
   CONFIGURAÇÕES GERAIS
========================================= */

app.use(cors());

// LIVE RELOAD
app.use(connectLiveReload());

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
app.use('/api/agendamentos', appointmentRoutes);

/* =========================================
   TESTE UTF-8
========================================= */

app.get('/teste', (req, res) => {

    res.send(
        'Olá João, vacinação, cão, coração, ação, informação'
    );
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
   SERVIDOR
========================================= */

let server;

const startServer = async () => {
    try {
        // TESTE BANCO CORRETO PARA O SERVER.JS
        await pool.execute('SELECT 1');

        console.clear();
        console.log('✅ Conexão com o banco estabelecida.');

        server = app.listen(port, '0.0.0.0', () => {

            const ipLocal = getLocalIp();

            const urlMobile = `http://${ipLocal}:${port}`;
            const urlDesktop = `http://localhost:${port}`;

            console.log(
                `\n🚀 Servidor Petto ativo na porta ${port}`
            );

            console.log(`💻 PC: ${urlDesktop}`);

            console.log(
                '\n========================================='
            );

            console.log('📱 Escaneie no celular');

            console.log(
                '=========================================\n'
            );

            qrcode.generate(urlMobile, {
                small: true
            });

            console.log(`\n🌐 Wi-Fi: ${urlMobile}\n`);

            console.log(
                '========================================='
            );

            console.log('⌨️  COMANDOS');

            console.log(
                '========================================='
            );

            console.log('R = Reiniciar servidor');

            console.log('CTRL + C = Encerrar');

            console.log(
                '=========================================\n'
            );
        });

    } catch (error) {

        console.error('❌ ERRO:', error.message);

        process.exit(1);
    }
};

/* =========================================
   RESTART COM TECLA "R"
========================================= */

readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {

    process.stdin.setRawMode(true);
}

process.stdin.on('keypress', async (str, key) => {

    // CTRL + C
    if (key.ctrl && key.name === 'c') {

        console.log('\n🛑 Encerrando servidor...\n');

        process.exit();
    }

    // RESTART
    if (key.name === 'r') {

        console.log('\n🔄 Reiniciando servidor...\n');

        if (server) {

            server.close(async () => {

                console.log('✅ Servidor parado.');

                await startServer();
            });

        } else {

            await startServer();
        }
    }
});

/* =========================================
   INICIAR
========================================= */

startServer();