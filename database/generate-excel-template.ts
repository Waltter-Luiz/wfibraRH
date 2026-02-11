/**
 * Script para gerar um template de Excel para importação de histórico
 * Uso: ts-node database/generate-excel-template.ts
 */

import xlsx from 'xlsx';
import path from 'path';

// Dados de exemplo
const templateData = [
    ['Nome do Funcionário', 'Email do Funcionário', 'Mês/Ano', 'Saldo em Horas', 'Salário na Época (Opcional)'],
    ['João Silva', 'joao.silva@wfibra.com', '06/2022', 15.5, 3500.00],
    ['Maria Santos', 'maria.santos@wfibra.com', '06/2022', -2.0, 4200.00],
    ['Pedro Costa', 'pedro.costa@wfibra.com', '06/2022', 8.0, 3800.00],
    ['João Silva', 'joao.silva@wfibra.com', '07/2022', 20.0, 3500.00],
    ['Maria Santos', 'maria.santos@wfibra.com', '07/2022', 5.5, 4200.00],
    ['', '', '', '', ''],
    ['INSTRUÇÕES:', '', '', '', ''],
    ['1. Preencha os dados dos funcionários', '', '', '', ''],
    ['2. Email deve corresponder ao cadastrado no sistema', '', '', '', ''],
    ['3. Mês/Ano pode ser MM/YYYY ou YYYY-MM', '', '', '', ''],
    ['4. Saldo positivo = horas a favor do funcionário', '', '', '', ''],
    ['5. Saldo negativo = horas devidas pelo funcionário', '', '', '', ''],
    ['6. Salário é opcional (usará o salário atual se vazio)', '', '', '', ''],
];

// Criar workbook
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.aoa_to_sheet(templateData);

// Ajustar largura das colunas
ws['!cols'] = [
    { wch: 25 }, // Nome
    { wch: 30 }, // Email
    { wch: 12 }, // Mês/Ano
    { wch: 18 }, // Saldo
    { wch: 30 }, // Salário
];

xlsx.utils.book_append_sheet(wb, ws, 'Histórico Banco de Horas');

// Salvar arquivo
const outputPath = path.resolve(__dirname, 'template_importacao_historico.xlsx');
xlsx.writeFile(wb, outputPath);

console.log(`✅ Template criado com sucesso!`);
console.log(`📁 Arquivo: ${outputPath}`);
console.log(`\n📋 Próximos passos:`);
console.log(`1. Abra o arquivo Excel gerado`);
console.log(`2. Preencha com os dados reais do histórico`);
console.log(`3. Execute: npx ts-node database/import-excel-history.ts "${outputPath}"`);
