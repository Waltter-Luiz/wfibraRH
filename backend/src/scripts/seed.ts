/**
 * Script para rodar as seeds do banco de dados (seed.sql + admin user).
 * Uso: ts-node src/scripts/seed.ts (dentro da pasta backend)
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Tenta carregar .env da pasta backend (../../.env) ou da raiz (../../../.env)
const envPathBackend = path.resolve(__dirname, '../../.env');
const envPathRoot = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(envPathBackend)) {
  dotenv.config({ path: envPathBackend });
} else if (fs.existsSync(envPathRoot)) {
  dotenv.config({ path: envPathRoot });
}

async function runSeed() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3006'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  };

  console.log('Conectando ao MySQL...');

  try {
    const connection = await mysql.createConnection(connectionConfig);

    console.log('Lendo seed.sql...');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    if (!fs.existsSync(seedPath)) {
      throw new Error(`Arquivo seed.sql não encontrado em: ${seedPath}`);
    }

    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Executando seed SQL básico...');
    await connection.query(seedSql);

    // Criar usuário Admin se não existir
    console.log('Verificando usuário Admin...');
    const [rows]: any = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@wfibra.com']);

    if (rows.length === 0) {
      console.log('Criando usuário Admin (senha: admin123)...');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Precisamos de IDs de team, position, contract_type
      // Assumindo que o seed.sql rodou, vamos pegar os primeiros
      const [teams]: any = await connection.query('SELECT id FROM teams LIMIT 1');
      const [positions]: any = await connection.query('SELECT id FROM positions LIMIT 1');
      const [contracts]: any = await connection.query('SELECT id FROM contract_types LIMIT 1');

      await connection.query(`
            INSERT INTO users (name, email, password_hash, role, team_id, position_id, contract_type_id, salary, admission_date)
            VALUES (?, ?, ?, 'ADMIN', ?, ?, ?, 5000.00, CURDATE())
        `, [
        'Administrador do Sistema',
        'admin@wfibra.com',
        hashedPassword,
        teams[0]?.id || null,
        positions[0]?.id || null,
        contracts[0]?.id || null
      ]);
      console.log('✅ Usuário Admin criado!');
    } else {
      console.log('ℹ️ Usuário Admin já existe.');
    }

    console.log('✅ Seed finalizado com sucesso!');
    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao rodar seed:', error);
    process.exit(1);
  }
}

runSeed();
