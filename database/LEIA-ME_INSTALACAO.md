# 🚀 Instalação Completa do Banco de Dados

## Execute APENAS este arquivo no MySQL Workbench

### Passo a Passo:

1. **Abra o MySQL Workbench**

2. **Conecte ao MySQL** (não precisa selecionar banco, o script cria)

3. **Abra o script:**
   - File → Open SQL Script
   - Selecione: `INSTALACAO_COMPLETA.sql`

4. **Execute:**
   - Clique no raio ⚡
   - Ou: `Ctrl + Shift + Enter`

5. **Aguarde a mensagem:**
   ```
   ✅ INSTALAÇÃO COMPLETA!
   Login padrão: admin@wfibra.com | Senha: admin123
   ```

## O que este script faz:

✅ Cria o banco `wfibra`
✅ Cria todas as tabelas (users, teams, time_records, etc)
✅ Adiciona campo `manager_id` para hierarquia
✅ Cria tabela `system_settings`
✅ Popula dados iniciais (times, cargos, contratos)
✅ Cria usuário admin (email: admin@wfibra.com, senha: admin123)
✅ Cria views (v_employee_total_balance, v_monthly_evolution)
✅ Cria procedures (sp_calculate_daily_balance, sp_close_monthly_balance)
✅ Cria triggers de auditoria
✅ Cria índices para performance
✅ **TUDO EM PORTUGUÊS!** (PENDENTE, APROVADO, TRABALHO, FERIAS, etc)

## Credenciais Padrão:

- **Email:** admin@wfibra.com
- **Senha:** admin123

⚠️ **Altere a senha após o primeiro login!**

## Próximos Passos:

Após executar este script com sucesso:

1. ✅ Banco está pronto!
2. 🚀 Inicie o backend: `cd backend && npm run dev`
3. 🎨 Inicie o frontend: `cd frontend && npm run dev`
4. 🔐 Faça login com admin@wfibra.com / admin123
5. 📊 (Opcional) Importe histórico Excel se tiver

## Verificar se funcionou:

Execute no Workbench:

```sql
USE wfibra;

-- Ver tabelas criadas
SHOW TABLES;

-- Ver usuário admin
SELECT * FROM users;

-- Ver configurações
SELECT * FROM system_settings;

-- Ver times
SELECT * FROM teams;
```

---

**Qualquer erro? Me avise com o print da mensagem!**
