// Script Node.js para criar o arquivo .env
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Gerar chave JWT
const jwtSecret = crypto.randomBytes(32).toString('base64');

// Conteúdo do arquivo .env
const envContent = `# ============================================
# Configurações do Banco de Dados
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=buscapet

# ============================================
# Configurações de Segurança
# ============================================
# IMPORTANTE: Esta chave foi gerada automaticamente. 
# Para produção, gere uma nova chave usando: node generate-jwt-secret.js
JWT_SECRET=${jwtSecret}

# ============================================
# Configurações do Frontend
# ============================================
# URL do frontend (ajuste para a URL do seu frontend)
FRONTEND_URL=http://localhost:3000

# ============================================
# Configurações do Servidor
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# Configurações de Upload (opcional)
# ============================================
UPLOAD_DIR=uploads
`;

// Caminho do arquivo .env
const envPath = path.join(__dirname, '.env');

// Verificar se o arquivo já existe
if (fs.existsSync(envPath)) {
    console.log('⚠️  O arquivo .env já existe!');
    console.log('   Deseja sobrescrever? (S/N)');
    console.log('   Para criar manualmente, veja o arquivo SETUP_ENV.md');
    process.exit(0);
}

// Criar o arquivo .env
try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('\n✅ Arquivo .env criado com sucesso!');
    console.log(`\n📋 Chave JWT gerada: ${jwtSecret}`);
    console.log('\n⚠️  IMPORTANTE: Ajuste os valores de:');
    console.log('   - DB_USER: Seu usuário do MySQL');
    console.log('   - DB_PASSWORD: Sua senha do MySQL');
    console.log('   - DB_DATABASE: Nome do seu banco de dados');
    console.log('   - FRONTEND_URL: URL do seu frontend');
    console.log('\n💡 Veja o arquivo SETUP_ENV.md para mais detalhes.\n');
} catch (error) {
    console.error('❌ Erro ao criar arquivo .env:', error.message);
    process.exit(1);
}

