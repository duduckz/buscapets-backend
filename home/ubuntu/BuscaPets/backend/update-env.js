// Script para atualizar o arquivo .env com valores padrão de desenvolvimento
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function updateEnv() {
    console.log('\n🔧 Configuração do Arquivo .env\n');
    console.log('Vamos configurar os valores do seu ambiente.\n');

    // Valores padrão
    let dbHost = 'localhost';
    let dbPort = '3306';
    let dbUser = 'root';
    let dbPassword = '';
    let dbDatabase = 'buscapet';
    let frontendUrl = 'http://localhost:3000';
    let port = '3000';
    let nodeEnv = 'development';

    // Ler JWT_SECRET existente ou gerar nova
    let jwtSecret = '';
    const envPath = path.join(__dirname, '.env');
    
    if (fs.existsSync(envPath)) {
        const existingContent = fs.readFileSync(envPath, 'utf8');
        const jwtMatch = existingContent.match(/JWT_SECRET=(.+)/);
        if (jwtMatch && jwtMatch[1] && jwtMatch[1].trim() && !jwtMatch[1].includes('sua_chave')) {
            jwtSecret = jwtMatch[1].trim();
            console.log('✅ Chave JWT existente será mantida.\n');
        }
    }

    if (!jwtSecret) {
        jwtSecret = crypto.randomBytes(32).toString('base64');
        console.log('✅ Nova chave JWT gerada.\n');
    }

    // Perguntar valores
    console.log('📋 Configurações do Banco de Dados:\n');
    
    const dbHostInput = await question(`DB_HOST [${dbHost}]: `);
    if (dbHostInput.trim()) dbHost = dbHostInput.trim();

    const dbPortInput = await question(`DB_PORT [${dbPort}]: `);
    if (dbPortInput.trim()) dbPort = dbPortInput.trim();

    const dbUserInput = await question(`DB_USER [${dbUser}]: `);
    if (dbUserInput.trim()) dbUser = dbUserInput.trim();

    const dbPasswordInput = await question(`DB_PASSWORD [deixe vazio se não tiver]: `);
    if (dbPasswordInput.trim()) dbPassword = dbPasswordInput.trim();

    const dbDatabaseInput = await question(`DB_DATABASE [${dbDatabase}]: `);
    if (dbDatabaseInput.trim()) dbDatabase = dbDatabaseInput.trim();

    console.log('\n📋 Configurações do Frontend:\n');
    const frontendUrlInput = await question(`FRONTEND_URL [${frontendUrl}]: `);
    if (frontendUrlInput.trim()) frontendUrl = frontendUrlInput.trim();

    console.log('\n📋 Configurações do Servidor:\n');
    const portInput = await question(`PORT [${port}]: `);
    if (portInput.trim()) port = portInput.trim();

    // Criar conteúdo do .env
    const envContent = `# ============================================
# Configurações do Banco de Dados
# ============================================
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_DATABASE=${dbDatabase}

# ============================================
# Configurações de Segurança
# ============================================
JWT_SECRET=${jwtSecret}

# ============================================
# Configurações do Frontend
# ============================================
URL_FRONTEND=${frontendUrl}

# ============================================
# Configurações do Servidor
# ============================================
PORT=${port}
NODE_ENV=${nodeEnv}

# ============================================
# Configurações de Upload (opcional)
# ============================================
UPLOAD_DIR=uploads
`;

    // Salvar arquivo
    fs.writeFileSync(envPath, envContent, 'utf8');
    
    console.log('\n✅ Arquivo .env atualizado com sucesso!\n');
    console.log('📋 Resumo da configuração:');
    console.log(`   DB_HOST: ${dbHost}`);
    console.log(`   DB_PORT: ${dbPort}`);
    console.log(`   DB_USER: ${dbUser}`);
    console.log(`   DB_DATABASE: ${dbDatabase}`);
    console.log(`   FRONTEND_URL: ${frontendUrl}`);
    console.log(`   PORT: ${port}`);
    console.log(`   JWT_SECRET: ${jwtSecret.substring(0, 20)}... (${jwtSecret.length} caracteres)\n`);
    
    rl.close();
}

updateEnv().catch(err => {
    console.error('❌ Erro:', err.message);
    rl.close();
    process.exit(1);
});

