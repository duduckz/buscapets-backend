// Script para ajustar a porta do frontend no .env
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function ajustarPortaFrontend() {
    console.log('\n🔌 Configuracao de Porta do Frontend\n');
    console.log('O backend esta configurado para rodar na porta 3000.');
    console.log('O frontend precisa rodar em uma porta diferente.\n');
    
    console.log('Portas recomendadas:');
    console.log('  1. Vite (React/Vue): 5173 (padrao)');
    console.log('  2. React (Create React App): 3001');
    console.log('  3. Next.js: 3001');
    console.log('  4. Outra (especifique)\n');
    
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
        console.error('❌ Arquivo .env nao encontrado!');
        console.error('   Execute primeiro: node create-env.js\n');
        rl.close();
        process.exit(1);
    }
    
    // Ler .env atual
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Perguntar qual porta usar
    const resposta = await question('Qual porta seu frontend vai usar? [1-4 ou URL completa]: ');
    
    let frontendUrl = '';
    
    if (resposta.trim() === '1') {
        frontendUrl = 'http://localhost:5173';
        console.log('\n✅ Configurado para Vite (porta 5173)');
    } else if (resposta.trim() === '2') {
        frontendUrl = 'http://localhost:3001';
        console.log('\n✅ Configurado para React CRA (porta 3001)');
    } else if (resposta.trim() === '3') {
        frontendUrl = 'http://localhost:3001';
        console.log('\n✅ Configurado para Next.js (porta 3001)');
    } else if (resposta.trim() === '4') {
        const portaCustom = await question('Digite a porta (ex: 3002, 8080): ');
        frontendUrl = `http://localhost:${portaCustom.trim()}`;
        console.log(`\n✅ Configurado para porta customizada: ${portaCustom.trim()}`);
    } else if (resposta.trim().startsWith('http://') || resposta.trim().startsWith('https://')) {
        frontendUrl = resposta.trim();
        console.log(`\n✅ Configurado para URL: ${frontendUrl}`);
    } else {
        // Tentar interpretar como número de porta
        const porta = resposta.trim();
        if (/^\d+$/.test(porta)) {
            frontendUrl = `http://localhost:${porta}`;
            console.log(`\n✅ Configurado para porta: ${porta}`);
        } else {
            console.error('\n❌ Entrada invalida!');
            rl.close();
            process.exit(1);
        }
    }
    
    // Atualizar FRONTEND_URL no .env
    const lines = content.split('\n');
    const updatedLines = lines.map(line => {
        if (line.trim().startsWith('FRONTEND_URL=')) {
            return `FRONTEND_URL=${frontendUrl}`;
        }
        return line;
    });
    
    // Se FRONTEND_URL não existir, adicionar
    if (!content.includes('FRONTEND_URL=')) {
        // Encontrar onde adicionar (depois de DB_DATABASE ou JWT_SECRET)
        const insertIndex = updatedLines.findIndex(line => 
            line.includes('DB_DATABASE=') || line.includes('JWT_SECRET=')
        );
        if (insertIndex !== -1) {
            updatedLines.splice(insertIndex + 1, 0, `FRONTEND_URL=${frontendUrl}`);
        } else {
            updatedLines.push(`FRONTEND_URL=${frontendUrl}`);
        }
    }
    
    // Salvar
    fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');
    
    console.log('\n📋 Configuracao atualizada no arquivo .env');
    console.log(`   FRONTEND_URL=${frontendUrl}`);
    console.log('\n⚠️  IMPORTANTE: Reinicie o backend para aplicar as mudancas!');
    console.log('   npm start\n');
    
    rl.close();
}

ajustarPortaFrontend().catch(err => {
    console.error('❌ Erro:', err.message);
    rl.close();
    process.exit(1);
});

