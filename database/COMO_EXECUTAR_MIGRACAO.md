# 🇧🇷 Como Executar a Migração no MySQL Workbench

## Passo a Passo

1. **Abra o MySQL Workbench** (você já está com ele aberto!)

2. **Conecte ao banco `wfibra`**
   - Clique na conexão no painel inicial
   - Ou use: Server → Connect to Database

3. **Abra o arquivo SQL**
   - File → Open SQL Script
   - Navegue até: `e:\Projetos\RH\wfibraRH-main\database\migrations\001_add_missing_fields_and_tables.sql`

4. **Execute o script**
   - Clique no ícone do raio ⚡ (Execute)
   - Ou pressione: `Ctrl + Shift + Enter`

5. **Verifique o resultado**
   - No painel "Output" você verá: `✅ Migração concluída com sucesso!`
   - Se houver erros, eles aparecerão em vermelho

## ✅ O que foi corrigido

### Tradução para Português:
- `PENDING` → `PENDENTE`
- `APPROVED` → `APROVADO`
- `REJECTED` → `REJEITADO`
- `WORK` → `TRABALHO`
- `OVERTIME` → `HORA_EXTRA`
- `COMPENSATORY` → `COMPENSACAO`
- `ABSENCE_JUSTIFIED` → `FALTA_JUSTIFICADA`
- `ABSENCE_UNJUSTIFIED` → `FALTA_INJUSTIFICADA`
- `HOLIDAY` → `FERIADO`
- `VACATION` → `FERIAS`
- `MEDICAL_LEAVE` → `ATESTADO_MEDICO`

## 🔍 Verificar se funcionou

Após executar, rode este comando no Workbench:

```sql
-- Ver as novas tabelas e campos
SHOW TABLES;

-- Ver se manager_id foi adicionado
DESCRIBE users;

-- Ver configurações do sistema
SELECT * FROM system_settings;

-- Ver as views criadas
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

## ⚠️ Problemas Comuns

### Erro: "Duplicate column name 'manager_id'"
**Solução:** A coluna já existe, pode ignorar ou comentar essa linha

### Erro: "Table 'system_settings' already exists"
**Solução:** A tabela já existe, pode ignorar ou comentar essa linha

### Erro de sintaxe no DELIMITER
**Solução:** Execute o script completo de uma vez (não linha por linha)

---

**Depois de executar com sucesso, me avise para atualizarmos os controllers/services!**
