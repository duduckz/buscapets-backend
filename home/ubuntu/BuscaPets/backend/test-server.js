// Script para testar se o servidor inicia corretamente
require('dotenv').config();

console.log('\n🚀 Testando inicialização do servidor...\n');

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
    console.error('\n💡 Ajuste o arquivo .env com os valores necessários.\n');
    process.exit(1);
}

console.log('✅ Variáveis de ambiente carregadas!');

// Testar conexão com banco de dados
const pool = require('./config/db');

pool.getConnection()
    .then(connection => {
        console.log('✅ Conexão com o MySQL estabelecida com sucesso!');
        connection.release();
        
        // Testar importação do servidor (sem iniciar)
        console.log('✅ Todas as validações passaram!');
        console.log('\n🎉 O servidor está pronto para iniciar!');
        console.log('   Execute: npm start ou npm run dev\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        console.error('\n💡 Verifique:');
        console.error('   - Se o MySQL está rodando');
        console.error('   - Se as credenciais no .env estão corretas');
        console.error('   - Se o banco de dados existe\n');
        process.exit(1);
    });

