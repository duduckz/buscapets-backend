// Script para gerar uma chave JWT secreta forte
const crypto = require('crypto');

const jwtSecret = crypto.randomBytes(32).toString('base64');
console.log('\n✅ Chave JWT gerada com sucesso!');
console.log('\n📋 Copie e cole no seu arquivo .env:');
console.log(`JWT_SECRET=${jwtSecret}\n`);

