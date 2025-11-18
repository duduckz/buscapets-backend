require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Variáveis obrigatórias (não exigir FRONTEND em dev)
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_DATABASE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:');
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\n💡 Configure essas variáveis no .env local e no painel do Railway.');
    process.exit(1);
}

// Aceita ambos os nomes: URL_FRONTEND ou FRONTEND_URL
const FRONTEND_URL = process.env.URL_FRONTEND || process.env.FRONTEND_URL || '';

// Em production exigir FRONTEND_URL
if (process.env.NODE_ENV === 'production' && !FRONTEND_URL) {
    console.error('❌ ERRO: URL_FRONTEND (ou FRONTEND_URL) não definida em produção.');
    process.exit(1);
}

// Logs informativos
if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Variáveis de ambiente carregadas (dev):');
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅' : '❌ NÃO configurado'}`);
}
console.log(`   FRONTEND_URL: ${FRONTEND_URL || 'não definido (apenas dev)'}`);

// Inicializar DB (se existir)
try {
    require('./config/db');
} catch (err) {
    console.warn('⚠️ Aviso ao carregar ./config/db:', err.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS dinâmico e seguro
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // server-to-server or curl

        if (process.env.NODE_ENV === 'production') {
            if (origin === FRONTEND_URL) return callback(null, true);
            return callback(new Error('Origin não permitida pelo CORS'), false);
        } else {
            const allowed = [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                FRONTEND_URL
            ].filter(Boolean);
            if (allowed.includes(origin)) return callback(null, true);
            return callback(null, true); // liberal in dev
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// Rotas
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');

app.use('/api/usuarios', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/mensagens', messageRoutes);
app.use('/api/adocoes', adoptionRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send('API BuscaPet funcionando!'));

// 404
app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada' }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack || err.message);
    if (err && err.message && err.message.includes('Origin não permitida')) {
        return res.status(403).json({ message: 'Origin não permitida pelo CORS' });
    }
    res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`🔗 Frontend configurado: ${FRONTEND_URL || 'não definido'}`);
});

server.on('error', (err) => {
    console.error('❌ Erro no servidor:', err.message);
    process.exit(1);
});
