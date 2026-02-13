
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Load .env
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

async function fixAdmin() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3006'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'wfibra'
    };

    console.log('Conectando ao banco para corrigir senha do admin...');
    const connection = await mysql.createConnection(config);

    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        console.log(`Atualizando senha para admin@wfibra.com...`);
        const [result]: any = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hash, 'admin@wfibra.com']
        );

        if (result.affectedRows > 0) {
            console.log('✅ Senha do administrador atualizada com sucesso para: admin123');
        } else {
            console.log('❌ Usuário admin@wfibra.com não encontrado no banco.');
        }

    } catch (error) {
        console.error('❌ Erro ao atualizar senha:', error);
    } finally {
        await connection.end();
    }
}

fixAdmin();
