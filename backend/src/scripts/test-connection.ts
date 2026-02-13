
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const baseConfig = {
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'wfibra',
};

const variations = [
    { name: 'Config Atual (.env)', host: process.env.DB_HOST, password: process.env.DB_PASSWORD, port: parseInt(process.env.DB_PORT || '3306') },
    { name: 'Host localhost (com senha)', host: 'localhost', password: process.env.DB_PASSWORD, port: 3306 },
    { name: 'Host 127.0.0.1 (sem senha)', host: '127.0.0.1', password: '', port: 3306 },
    { name: 'Host localhost (sem senha)', host: 'localhost', password: '', port: 3306 },
];

async function runTests() {
    console.log('--- TESTANDO VARIAÇÕES DE CONEXÃO ---');

    for (const test of variations) {
        try {
            console.log(`\nTestando: ${test.name}`);
            console.log(`  > ${baseConfig.user}@${test.host}:${test.port} (Senha: ${test.password ? 'SIM' : 'NÃO'})`);

            const conn = await mysql.createConnection({
                host: test.host,
                port: test.port,
                user: baseConfig.user,
                password: test.password,
                database: baseConfig.user === 'root' ? undefined : baseConfig.database // Conectar sem DB primeiro se for root
            });

            console.log('✅ CONECTADO COM SUCESSO!');
            await conn.end();
            return; // Para no primeiro sucesso
        } catch (err: any) {
            console.error(`❌ Falha: ${err.message}`);
        }
    }

    console.log('\nNenhuma combinação funcionou. Verifique se o MySQL está rodando e se o usuário root tem permissão.');
}

runTests();
