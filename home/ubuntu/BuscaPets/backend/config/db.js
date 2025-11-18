const mysql = require('mysql2/promise');
const path = require('path');
// Carregar .env da raiz do projeto (onde o servidor é executado)
require('dotenv').config({ path: path.join(__dirname, '../../../../.env') });

// Verificar se as variáveis de ambiente estão carregadas
const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Log das configurações (sem mostrar a senha completa)
if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 Configurações do Banco de Dados:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Porta: ${dbConfig.port}`);
    console.log(`   Usuário: ${dbConfig.user}`);
    console.log(`   Banco: ${dbConfig.database}`);
    console.log(`   Senha: ${dbConfig.password ? '✅ Configurada' : '❌ Não configurada'}`);
}

// Verificar se todas as variáveis necessárias estão presentes
if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error('❌ ERRO: Variáveis de ambiente do banco de dados não configuradas corretamente!');
    console.error('   Verifique o arquivo .env na raiz do projeto.');
    process.exit(1);
}

const pool = mysql.createPool(dbConfig);

// Testar a conexão
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexão com o MySQL estabelecida com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        console.error('\n💡 Verifique:');
        console.error('   1. Se o MySQL está rodando');
        console.error('   2. Se as credenciais no .env estão corretas');
        console.error('   3. Se o banco de dados "' + dbConfig.database + '" existe');
        console.error('   4. Se o usuário "' + dbConfig.user + '" tem permissão de acesso\n');
        // Em desenvolvimento, não encerra o processo para permitir debug
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });

module.exports = pool;
