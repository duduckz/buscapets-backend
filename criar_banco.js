// Script para criar o banco de dados e as tabelas
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

console.log('🔧 Criando banco de dados e tabelas...\n');

const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

const databaseName = process.env.DB_DATABASE || 'buscapet';

async function criarBancoETabelas() {
    let connection;
    try {
        // Conectar sem especificar o banco de dados
        console.log('🔄 Conectando ao MySQL...');
        connection = await mysql.createConnection(config);
        console.log('✅ Conectado ao MySQL!\n');

        // Criar o banco de dados se não existir
        console.log(`📦 Criando banco de dados "${databaseName}"...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Banco de dados "${databaseName}" criado/verificado!\n`);

        // Usar o banco de dados
        await connection.query(`USE ${databaseName}`);
        console.log(`✅ Usando banco de dados "${databaseName}"\n`);

        // Ler e executar o script SQL
        const sqlFile = path.join(__dirname, 'criar_banco_dados.sql');
        
        if (!fs.existsSync(sqlFile)) {
            console.error('❌ Arquivo criar_banco_dados.sql não encontrado!');
            process.exit(1);
        }

        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        // Remover comentários e dividir o SQL em comandos individuais
        const commands = sql
            .replace(/--.*$/gm, '') // Remove comentários de linha
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários de bloco
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);

        console.log('📋 Criando tabelas...\n');
        
        for (const command of commands) {
            const cmdLower = command.toLowerCase();
            
            if (cmdLower.includes('create database')) {
                // Pular comandos CREATE DATABASE (já criamos)
                continue;
            }
            if (cmdLower.includes('use ')) {
                // Pular comandos USE (já estamos usando)
                continue;
            }
            
            try {
                // Para índices, verificar se já existe antes de criar
                if (cmdLower.includes('create index')) {
                    const indexMatch = command.match(/CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(\w+)/i);
                    if (indexMatch) {
                        const indexName = indexMatch[1];
                        const tableName = indexMatch[2];
                        
                        // Verificar se o índice já existe
                        try {
                            const [existingIndexes] = await connection.query(`SHOW INDEX FROM ${tableName}`);
                            const indexExists = existingIndexes.some(idx => idx.Key_name === indexName);
                            
                            if (!indexExists) {
                                // Remover IF NOT EXISTS da sintaxe (não suportado em algumas versões)
                                const createIndexCmd = command.replace(/\s+IF\s+NOT\s+EXISTS\s+/i, ' ');
                                await connection.query(createIndexCmd);
                                console.log(`   ✅ Índice ${indexName} criado`);
                            } else {
                                console.log(`   ℹ️  Índice ${indexName} já existe`);
                            }
                        } catch (tableErr) {
                            // Se a tabela não existe ainda, pular o índice (será criado depois)
                            console.log(`   ⏭️  Pulando índice ${indexName} (tabela ainda não criada)`);
                        }
                    }
                } else {
                    // Para tabelas, executar normalmente
                    await connection.query(command);
                    const tableMatch = command.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
                    if (tableMatch) {
                        console.log(`   ✅ Tabela ${tableMatch[1]} criada`);
                    }
                }
            } catch (err) {
                // Ignorar erros de "já existe" ou "duplicado"
                if (!err.message.includes('already exists') && 
                    !err.message.includes('Duplicate') &&
                    !err.message.includes('Duplicate key')) {
                    console.error(`   ⚠️  Erro: ${err.message.substring(0, 100)}`);
                }
            }
        }

        // Verificar tabelas criadas
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n✅ Tabelas criadas: ${tables.length}`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });

        await connection.end();
        console.log('\n🎉 Banco de dados e tabelas criados com sucesso!\n');
        process.exit(0);

    } catch (err) {
        console.error('❌ Erro:', err.message);
        
        if (err.code === 'ECONNREFUSED') {
            console.error('\n💡 O MySQL não está respondendo. Inicie o serviço MySQL.\n');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Credenciais incorretas. Verifique usuário e senha no .env\n');
        }
        
        if (connection) {
            await connection.end();
        }
        process.exit(1);
    }
}

criarBancoETabelas();

