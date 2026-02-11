/**
 * Script para importar histórico de banco de horas do Excel
 * 
 * FORMATO ESPERADO DO EXCEL:
 * - Coluna A: Nome do funcionário
 * - Coluna B: Email do funcionário
 * - Coluna C: Mês/Ano (formato: MM/YYYY ou YYYY-MM)
 * - Coluna D: Saldo em horas (número decimal, ex: 15.5 para 15h30min)
 * - Coluna E: Salário na época (opcional, para calcular valor em R$)
 * 
 * Uso: ts-node database/import-excel-history.ts caminho/para/arquivo.xlsx
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface HistoryRow {
    employeeName: string;
    employeeEmail: string;
    monthYear: string;
    balanceHours: number;
    salary?: number;
}

async function importExcelHistory(filePath: string) {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Arquivo não encontrado: ${filePath}`);
        process.exit(1);
    }

    console.log(`📂 Lendo arquivo: ${filePath}`);

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Converter para JSON
    const rawData: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    if (rawData.length < 2) {
        console.error('❌ Arquivo vazio ou sem dados');
        process.exit(1);
    }

    console.log(`📊 Encontradas ${rawData.length - 1} linhas de dados\n`);

    // Conectar ao banco
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'wfibra'
    });

    console.log('✅ Conectado ao MySQL\n');

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Pular cabeçalho (linha 0)
    for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];

        // Validar se a linha tem dados suficientes
        if (!row[0] || !row[1] || !row[2] || row[3] === undefined) {
            console.log(`⚠️  Linha ${i + 1}: Dados incompletos, pulando...`);
            skipped++;
            continue;
        }

        const employeeName = String(row[0]).trim();
        const employeeEmail = String(row[1]).trim();
        const monthYearRaw = String(row[2]).trim();
        const balanceHours = parseFloat(String(row[3]));
        const salary = row[4] ? parseFloat(String(row[4])) : null;

        // Converter mês/ano para formato YYYY-MM-01
        let referenceDate: string;
        try {
            if (monthYearRaw.includes('/')) {
                // Formato MM/YYYY
                const [month, year] = monthYearRaw.split('/');
                referenceDate = `${year}-${month.padStart(2, '0')}-01`;
            } else if (monthYearRaw.includes('-')) {
                // Formato YYYY-MM
                referenceDate = `${monthYearRaw}-01`;
            } else {
                throw new Error('Formato de data inválido');
            }
        } catch (error) {
            console.log(`❌ Linha ${i + 1}: Formato de data inválido (${monthYearRaw})`);
            errors++;
            continue;
        }

        try {
            // Buscar usuário pelo email
            const [users]: any = await connection.execute(
                'SELECT id, salary FROM users WHERE email = ?',
                [employeeEmail]
            );

            if (users.length === 0) {
                console.log(`⚠️  Linha ${i + 1}: Funcionário não encontrado (${employeeEmail}), pulando...`);
                skipped++;
                continue;
            }

            const userId = users[0].id;
            const currentSalary = users[0].salary;

            // Calcular valor em R$ (usar salário fornecido ou salário atual)
            const salaryToUse = salary || currentSalary || 0;
            const hourlyRate = salaryToUse / 220;
            const balanceAmount = balanceHours * hourlyRate;

            // Inserir ou atualizar monthly_balance
            await connection.execute(
                `INSERT INTO monthly_balances (user_id, reference_date, balance_hours, balance_amount, is_closed, notes)
                 VALUES (?, ?, ?, ?, TRUE, 'Importado do Excel')
                 ON DUPLICATE KEY UPDATE
                    balance_hours = VALUES(balance_hours),
                    balance_amount = VALUES(balance_amount),
                    notes = CONCAT(IFNULL(notes, ''), ' | Atualizado via importação Excel')`,
                [userId, referenceDate, balanceHours, balanceAmount]
            );

            console.log(`✅ Linha ${i + 1}: ${employeeName} - ${monthYearRaw} - ${balanceHours}h importado`);
            imported++;

        } catch (error: any) {
            console.log(`❌ Linha ${i + 1}: Erro ao importar - ${error.message}`);
            errors++;
        }
    }

    await connection.end();

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA IMPORTAÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Importados com sucesso: ${imported}`);
    console.log(`⚠️  Pulados: ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📝 Total processado: ${rawData.length - 1}`);
    console.log('='.repeat(60));
}

// Executar
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('❌ Uso: ts-node database/import-excel-history.ts caminho/para/arquivo.xlsx');
    console.log('\n📋 Formato esperado do Excel:');
    console.log('   Coluna A: Nome do funcionário');
    console.log('   Coluna B: Email do funcionário');
    console.log('   Coluna C: Mês/Ano (MM/YYYY ou YYYY-MM)');
    console.log('   Coluna D: Saldo em horas (ex: 15.5)');
    console.log('   Coluna E: Salário na época (opcional)');
    process.exit(1);
}

const filePath = path.resolve(args[0]);
importExcelHistory(filePath);
