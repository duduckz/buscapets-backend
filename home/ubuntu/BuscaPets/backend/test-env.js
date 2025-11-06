// Script para testar se todas as variáveis de ambiente estão configuradas
require('dotenv').config();

// DB_PASSWORD pode estar vazia (comum em desenvolvimento local)
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_DATABASE', 'FRONTEND_URL'];
const optionalButRequiredKeys = ['DB_PASSWORD']; // Deve existir, mas pode estar vazia
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
const missingOptional = optionalButRequiredKeys.filter(envVar => process.env[envVar] === undefined);

console.log('\n🔍 Verificando variáveis de ambiente...\n');

if (missingEnvVars.length > 0 || missingOptional.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:');
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
    missingOptional.forEach(envVar => console.error(`   - ${envVar} (deve existir no .env, mesmo que vazia)`));
    console.error('\n💡 Ajuste o arquivo .env com os valores necessários.');
    console.error('   Veja o arquivo .env.example ou SETUP_ENV.md para referência.\n');
    process.exit(1);
}

console.log('✅ Todas as variáveis obrigatórias estão configuradas!\n');
console.log('📋 Configurações carregadas:');
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_PORT: ${process.env.DB_PORT || 3306}`);
console.log(`   DB_USER: ${process.env.DB_USER}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD !== undefined ? (process.env.DB_PASSWORD ? '✅ Configurada' : '⚠️  Vazia (OK para desenvolvimento)') : '❌ Não configurada'}`);
console.log(`   DB_DATABASE: ${process.env.DB_DATABASE}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`   PORT: ${process.env.PORT || 3000}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurado (' + process.env.JWT_SECRET.length + ' caracteres)' : '❌ Não configurado'}`);
console.log('\n✅ Pronto para iniciar o servidor!\n');

