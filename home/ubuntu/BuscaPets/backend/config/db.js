const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar a conexão
pool.getConnection()
    .then(connection => {
        console.log('Conexão com o MySQL estabelecida com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('Erro ao conectar ao MySQL:', err.message);
        // Em um ambiente de produção, você pode querer sair do processo aqui
        // process.exit(1);
    });

module.exports = pool;
