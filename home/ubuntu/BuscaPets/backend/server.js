require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Validar variáveis de ambiente críticas
// DB_PASSWORD pode estar vazia (comum em desenvolvimento local)
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_DATABASE', 'FRONTEND_URL'];
const optionalButRequiredKeys = ['DB_PASSWORD']; // Deve existir, mas pode estar vazia
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
const missingOptional = optionalButRequiredKeys.filter(envVar => process.env[envVar] === undefined);

if (missingEnvVars.length > 0 || missingOptional.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:');
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
    missingOptional.forEach(envVar => console.error(`   - ${envVar} (deve existir no .env, mesmo que vazia)`));
    console.error('\n💡 Crie um arquivo .env na raiz do projeto com as variáveis necessárias.');
    console.error('   Veja o arquivo .env.example para referência.\n');
    process.exit(1);
}

// Log de confirmação (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Variáveis de ambiente carregadas com sucesso!');
    if (process.env.JWT_SECRET) {
        console.log('   JWT_SECRET: ✅ Configurado');
    } else {
        console.warn('   JWT_SECRET: ❌ NÃO configurado');
    }
}

// Preferência: aceitar ambos os nomes e validar somente em production
const FRONTEND_URL = process.env.URL_FRONTEND || process.env.FRONTEND_URL || process.env.URL_FRONTEND;

if (process.env.NODE_ENV === 'production' && !FRONTEND_URL) {
    console.error('❌ ERRO: Variáveis de ambientes obrigatórios não definidas:');
    console.error('   - URL_FRONTEND (ou FRONTEND_URL)');
    process.exit(1);
} else {
    if (!FRONTEND_URL) {
        console.warn('⚠️ URL_FRONTEND não definida — usando valor padrão/relativo (apenas dev).');
    } else {
        console.log(`   URL_FRONTEND: ${FRONTEND_URL}`);
    }
}

// Importar a conexão com o banco de dados para garantir que ela seja inicializada
require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
// Configurar CORS para aceitar apenas a URL do frontend (não usar '*' em produção)
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};

if (!process.env.FRONTEND_URL) {
    console.error('❌ ERRO: FRONTEND_URL não está configurada no .env');
    process.exit(1);
}

app.use(cors(corsOptions));
app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Servir arquivos estáticos (imagens de upload)
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

// Rota de teste
app.get('/', (req, res) => {
    res.send('API BuscaPet funcionando!');
});

// Tratamento de erro 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// Tratamento de erro geral
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`📡 API disponível em: http://localhost:${PORT}`);
    console.log(`🔗 Frontend configurado: ${process.env.FRONTEND_URL}\n`);
});

// Tratamento de erro na porta
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERRO: Porta ${PORT} já está em uso!\n`);
        console.error('💡 Soluções:');
        console.error(`   1. Execute o script: .\\kill-port.ps1`);
        console.error(`   2. Ou encontre e encerre o processo manualmente:`);
        console.error(`      netstat -ano | findstr :${PORT}`);
        console.error(`      taskkill /PID <PID> /F`);
        console.error(`   3. Ou altere a porta no arquivo .env (PORT=3001)\n`);
        process.exit(1);
    } else {
        console.error('❌ Erro ao iniciar servidor:', err.message);
        process.exit(1);
    }
});
