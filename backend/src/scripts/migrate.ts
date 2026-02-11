/**
 * Script para rodar as migrações do banco de dados (schema.sql).
 * Uso: ts-node src/scripts/migrate.ts (dentro da pasta backend)
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Tenta carregar .env da pasta backend (../../.env) ou da raiz (../../../.env)
const envPathBackend = path.resolve(__dirname, '../../.env');
const envPathRoot = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(envPathBackend)) {
    console.log(`Carregando .env de: ${envPathBackend}`);
    dotenv.config({ path: envPathBackend });
} else if (fs.existsSync(envPathRoot)) {
    console.log(`Carregando .env de: ${envPathRoot}`);
    dotenv.config({ path: envPathRoot });
} else {
    console.warn('⚠️ Arquivo .env não encontrado!');
}

async function runMigration() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true, // Permite rodar vários comandos SQL de uma vez
  };

  console.log('Conectando ao MySQL...');
  
  try {
    const connection = await mysql.createConnection(connectionConfig);
    
    // Caminho para o schema.sql que está em c:/projetos/RH/database/schema.sql
    // De: c:/projetos/RH/backend/src/scripts
    // Para: c:/projetos/RH/database
    // ../../../database/schema.sql
    console.log('Lendo schema.sql...');
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
        throw new Error(`Arquivo schema.sql não encontrado em: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executando migração...');
    await connection.query(schemaSql);
    
    console.log('✅ Banco de dados configurado com sucesso!');
    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao rodar migração:', error);
    process.exit(1);
  }
}

runMigration();
