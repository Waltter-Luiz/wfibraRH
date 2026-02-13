/**
 * Configuração centralizada do banco de dados com pool de conexões
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

// Carregar .env - CAMINHO CORRIGIDO
const envPath = path.resolve(__dirname, '../../../.env');
console.log('🔍 Tentando carregar .env de:', envPath);

if (fs.existsSync(envPath)) {
    console.log('✅ Arquivo .env encontrado.');
    dotenv.config({ path: envPath });
} else {
    console.error('❌ Arquivo .env NÃO encontrado no caminho:', envPath);
}

console.log('📊 Configuração do Banco detectada:');
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Port: ${process.env.DB_PORT}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   DB: ${process.env.DB_NAME}`);
console.log(`   Password Length: ${process.env.DB_PASSWORD?.length || 0}`);

// Configuração do pool de conexões - DATABASE DESCOMENTADO
export const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'wfibra', // ✅ DESCOMENTADO - CRÍTICO!
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Função helper para executar queries com tratamento de erro
export async function executeQuery<T = any>(
    query: string,
    params?: any[]
): Promise<T> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(query, params);
        return rows as T;
    } finally {
        connection.release();
    }
}

// Função helper para transações
export async function executeTransaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Testar conexão ao iniciar
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexão com MySQL estabelecida com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MySQL:', err);
        process.exit(1);
    });
