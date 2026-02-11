# Importação de Histórico do Excel

Este documento explica como importar o histórico de banco de horas desde 2022 do Excel para o sistema.

## 📋 Formato do Excel

O arquivo Excel deve ter as seguintes colunas (a primeira linha pode ser cabeçalho):

| Coluna | Nome | Descrição | Exemplo |
|--------|------|-----------|---------|
| A | Nome do Funcionário | Nome completo | João Silva |
| B | Email do Funcionário | Email cadastrado no sistema | joao.silva@wfibra.com |
| C | Mês/Ano | Formato MM/YYYY ou YYYY-MM | 06/2022 ou 2022-06 |
| D | Saldo em Horas | Número decimal (positivo ou negativo) | 15.5 ou -2.0 |
| E | Salário na Época | Opcional - salário do funcionário naquele mês | 3500.00 |

### Exemplo de Planilha:

```
Nome                Email                    Mês/Ano    Saldo Horas    Salário
João Silva          joao@wfibra.com          06/2022    15.5           3500.00
Maria Santos        maria@wfibra.com         06/2022    -2.0           4200.00
João Silva          joao@wfibra.com          07/2022    20.0           3500.00
```

## 🚀 Como Importar

### 1. Preparar o arquivo Excel

- Certifique-se de que todos os funcionários já estão cadastrados no sistema
- O email na planilha deve corresponder exatamente ao email cadastrado
- Saldos positivos = banco de horas a favor do funcionário
- Saldos negativos = horas devidas pelo funcionário

### 2. Executar o script de importação

```bash
# Navegar até a pasta do projeto
cd e:\Projetos\RH\wfibraRH-main

# Executar o script (substitua pelo caminho do seu arquivo)
npx ts-node database/import-excel-history.ts "caminho/para/historico.xlsx"
```

### Exemplo:
```bash
npx ts-node database/import-excel-history.ts "C:\Users\backlog\Desktop\historico_banco_horas.xlsx"
```

## 📊 O que o script faz

1. **Lê o arquivo Excel** e valida os dados
2. **Busca cada funcionário** pelo email no banco de dados
3. **Calcula o valor em R$** baseado no salário (fornecido ou atual)
4. **Insere ou atualiza** os registros em `monthly_balances`
5. **Marca como fechado** (`is_closed = TRUE`) para evitar alterações
6. **Gera relatório** com resumo da importação

## ⚠️ Observações Importantes

### Funcionários não encontrados
Se um email não existir no sistema, a linha será **pulada** e aparecerá no relatório como "skipped".

**Solução:** Cadastre o funcionário primeiro via sistema ou API.

### Meses duplicados
Se já existir um registro para aquele funcionário naquele mês, ele será **atualizado** com os novos valores.

### Salário não informado
Se a coluna E (salário) estiver vazia, o script usará o salário atual do funcionário no sistema.

### Formato de data
Aceita dois formatos:
- `MM/YYYY` (ex: 06/2022)
- `YYYY-MM` (ex: 2022-06)

## 📝 Exemplo de Saída

```
📂 Lendo arquivo: C:\Users\backlog\Desktop\historico.xlsx
📊 Encontradas 150 linhas de dados

✅ Conectado ao MySQL

✅ Linha 2: João Silva - 06/2022 - 15.5h importado
✅ Linha 3: Maria Santos - 06/2022 - -2h importado
⚠️  Linha 4: Pedro Costa - 06/2022 - Funcionário não encontrado, pulando...
✅ Linha 5: João Silva - 07/2022 - 20h importado
...

============================================================
📊 RESUMO DA IMPORTAÇÃO
============================================================
✅ Importados com sucesso: 145
⚠️  Pulados: 4
❌ Erros: 1
📝 Total processado: 150
============================================================
```

## 🔄 Reimportação

Se precisar reimportar os dados:
1. O script **atualizará** os registros existentes
2. Adicionará uma nota: "Atualizado via importação Excel"
3. Manterá o histórico de auditoria

## 🆘 Problemas Comuns

### "Arquivo não encontrado"
- Verifique o caminho completo do arquivo
- Use aspas se o caminho tiver espaços

### "Funcionário não encontrado"
- Verifique se o email está correto
- Cadastre o funcionário antes de importar

### "Formato de data inválido"
- Use MM/YYYY ou YYYY-MM
- Não use outros separadores

### "Dados incompletos"
- Verifique se todas as colunas obrigatórias (A, B, C, D) estão preenchidas

## 📞 Suporte

Em caso de dúvidas ou problemas, entre em contato com o administrador do sistema.
