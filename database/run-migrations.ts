/**
 * Script para rodar migrações do banco de dados
 * Uso: ts-node database/run-migrations.ts
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runMigrations() {
    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        multipleStatements: true,
    };

    console.log('🔄 Conectando ao MySQL...');

    try {
        const connection = await mysql.createConnection(connectionConfig);

        const migrationsDir = path.resolve(__dirname, 'migrations');

        if (!fs.existsSync(migrationsDir)) {
            console.log('⚠️  Pasta de migrações não encontrada');
            await connection.end();
            return;
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Executar em ordem alfabética

        console.log(`📁 Encontradas ${files.length} migrações\n`);

        for (const file of files) {
            console.log(`▶️  Executando: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            await connection.query(sql);
            console.log(`✅ ${file} - Concluída\n`);
        }

        console.log('✅ Todas as migrações foram executadas com sucesso!');
        await connection.end();
    } catch (error) {
        console.error('❌ Erro ao rodar migrações:', error);
        process.exit(1);
    }
}

runMigrations();
