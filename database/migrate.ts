/**
 * Script para rodar as migrações do banco de dados (schema.sql).
 * Uso: ts-node database/migrate.ts
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
    
    console.log('Lendo schema.sql...');
    const schemaPath = path.resolve(__dirname, 'schema.sql');
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
