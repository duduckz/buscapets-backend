// Script para atualizar o arquivo .env automaticamente com valores padrão
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// Valores padrão para desenvolvimento local
const defaultValues = {
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_USER: 'root',
    DB_PASSWORD: '',
    DB_DATABASE: 'buscapet',
    FRONTEND_URL: 'http://localhost:3000',
    PORT: '3000',
    NODE_ENV: 'development',
    UPLOAD_DIR: 'uploads'
};

// Ler valores existentes do .env
let existingValues = {};
let existingJwtSecret = '';

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();
            if (key && value) {
                existingValues[key.trim()] = value;
            }
        }
    });
    
    // Preservar JWT_SECRET se existir e for válido
    if (existingValues.JWT_SECRET && 
        existingValues.JWT_SECRET.length > 20 && 
        !existingValues.JWT_SECRET.includes('sua_chave')) {
        existingJwtSecret = existingValues.JWT_SECRET;
    }
}

// Gerar JWT_SECRET se não existir
if (!existingJwtSecret) {
    existingJwtSecret = crypto.randomBytes(32).toString('base64');
    console.log('✅ Nova chave JWT gerada.\n');
} else {
    console.log('✅ Chave JWT existente mantida.\n');
}

// Mesclar valores: usar existentes se disponíveis, senão usar padrões
const finalValues = {
    ...defaultValues,
    ...existingValues,
    JWT_SECRET: existingJwtSecret
};

// Garantir que valores obrigatórios não estejam vazios
if (!finalValues.DB_USER || finalValues.DB_USER === 'seu_usuario') {
    finalValues.DB_USER = 'root';
}

if (!finalValues.DB_DATABASE || finalValues.DB_DATABASE === 'nome_do_banco') {
    finalValues.DB_DATABASE = 'buscapet';
}

// Criar conteúdo do .env
const envContent = `# ============================================
# Configurações do Banco de Dados
# ============================================
DB_HOST=${finalValues.DB_HOST}
DB_PORT=${finalValues.DB_PORT}
DB_USER=${finalValues.DB_USER}
DB_PASSWORD=${finalValues.DB_PASSWORD}
DB_DATABASE=${finalValues.DB_DATABASE}

# ============================================
# Configurações de Segurança
# ============================================
JWT_SECRET=${finalValues.JWT_SECRET}

# ============================================
# Configurações do Frontend
# ============================================
FRONTEND_URL=${finalValues.FRONTEND_URL}

# ============================================
# Configurações do Servidor
# ============================================
PORT=${finalValues.PORT}
NODE_ENV=${finalValues.NODE_ENV}

# ============================================
# Configurações de Upload (opcional)
# ============================================
UPLOAD_DIR=${finalValues.UPLOAD_DIR}
`;

// Salvar arquivo
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Arquivo .env atualizado com sucesso!\n');
console.log('📋 Configuração atual:');
console.log(`   DB_HOST: ${finalValues.DB_HOST}`);
console.log(`   DB_PORT: ${finalValues.DB_PORT}`);
console.log(`   DB_USER: ${finalValues.DB_USER}`);
console.log(`   DB_DATABASE: ${finalValues.DB_DATABASE}`);
console.log(`   FRONTEND_URL: ${finalValues.FRONTEND_URL}`);
console.log(`   PORT: ${finalValues.PORT}`);
console.log(`   JWT_SECRET: ✅ Configurado (${finalValues.JWT_SECRET.length} caracteres)\n`);

console.log('⚠️  IMPORTANTE: Ajuste os valores conforme necessário:');
console.log('   - DB_PASSWORD: Adicione sua senha do MySQL se tiver');
console.log('   - DB_DATABASE: Confirme o nome do seu banco de dados');
console.log('   - FRONTEND_URL: Ajuste para a URL do seu frontend\n');

