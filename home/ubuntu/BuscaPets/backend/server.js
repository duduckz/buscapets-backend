require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Variáveis obrigatórias (não exigir FRONTEND aqui)
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_DATABASE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:');
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\n💡 Crie um arquivo .env na raiz do projeto ou configure as variáveis no painel do Railway.');
    process.exit(1);
}

// Aceita ambos os nomes: URL_FRONTEND ou FRONTEND_URL
const FRONTEND_URL = process.env.URL_FRONTEND || process.env.FRONTEND_URL || '';

// Em produção exigir FRONTEND_URL
if (process.env.NODE_ENV === 'production' && !FRONTEND_URL) {
    console.error('❌ ERRO: URL_FRONTEND (ou FRONTEND_URL) não definida em produção.');
    process.exit(1);
}

// Logs
if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Variáveis de ambiente carregadas com sucesso!');
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅' : '❌ NÃO configurado'}`);
}
console.log(`   FRONTEND_URL: ${FRONTEND_URL || 'não definido (apenas dev)'}`);

// Inicializar DB
try { require('./config/db'); } catch (err) { console.warn('⚠️ Aviso ao carregar ./config/db:', err.message); }

const app = express();
const PORT = process.env.PORT || 3000;

// CORS dinâmico
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'production') {
      return origin === FRONTEND_URL ? callback(null, true) : callback(new Error('Origin não permitida'), false);
    } else {
      const allowed = ['http://localhost:3000', 'http://127.0.0.1:3000', FRONTEND_URL].filter(Boolean);
      return allowed.includes(origin) ? callback(null, true) : callback(null, true); // liberal em dev
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// ADICIONE este middleware seguro para tratar preflight:
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir uploads
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

// Health check (útil para CI / frontend)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send('API BuscaPet funcionando!'));

// 404 e error handler
app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada' }));
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  if (err && err.message && err.message.includes('Origin')) return res.status(403).json({ message: 'Origin não permitida pelo CORS' });
  res.status(500).json({ message: 'Erro interno do servidor', error: err.message || String(err) });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Frontend configurado: ${FRONTEND_URL || 'não definido'}`);
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err.message);
  process.exit(1);
});
