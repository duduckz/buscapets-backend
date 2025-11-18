// Script para testar a conexão com o banco de dados
require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 Testando conexão com o banco de dados...\n');

const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

console.log('📋 Configurações:');
console.log(`   Host: ${config.host}`);
console.log(`   Porta: ${config.port}`);
console.log(`   Usuário: ${config.user}`);
console.log(`   Banco: ${config.database}`);
console.log(`   Senha: ${config.password ? '✅ Configurada' : '❌ Não configurada'}\n`);

// Verificar se todas as variáveis estão presentes
if (!config.host || !config.user || !config.database) {
    console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
    console.error('   Verifique o arquivo .env na raiz do projeto.\n');
    process.exit(1);
}

// Tentar conectar
async function testarConexao() {
    let connection;
    try {
        console.log('🔄 Tentando conectar...\n');
        connection = await mysql.createConnection(config);
        console.log('✅ Conexão estabelecida com sucesso!\n');
        
        // Testar uma query simples
        const [rows] = await connection.execute('SELECT DATABASE() as db, USER() as user');
        console.log('📊 Informações da conexão:');
        console.log(`   Banco atual: ${rows[0].db}`);
        console.log(`   Usuário: ${rows[0].user}\n`);
        
        // Verificar se as tabelas existem
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tabelas encontradas: ${tables.length}`);
        if (tables.length > 0) {
            tables.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`   - ${tableName}`);
            });
        } else {
            console.log('   ⚠️  Nenhuma tabela encontrada. Execute o script criar_banco_dados.sql\n');
        }
        
        await connection.end();
        console.log('\n✅ Teste concluído com sucesso!\n');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Erro ao conectar:', err.message);
        console.error('\n💡 Possíveis soluções:');
        console.error('   1. Verifique se o MySQL está rodando');
        console.error('   2. Verifique se as credenciais estão corretas no .env');
        console.error('   3. Verifique se o banco de dados "' + config.database + '" existe');
        console.error('   4. Verifique se o usuário tem permissão de acesso\n');
        
        if (err.code === 'ECONNREFUSED') {
            console.error('   🔴 O MySQL não está respondendo. Inicie o serviço MySQL.\n');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   🔴 Credenciais incorretas. Verifique usuário e senha.\n');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('   🔴 O banco de dados "' + config.database + '" não existe.');
            console.error('   💡 Execute: CREATE DATABASE ' + config.database + ';\n');
        }
        
        if (connection) {
            await connection.end();
        }
        process.exit(1);
    }
}

testarConexao();

