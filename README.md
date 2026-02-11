# FibraRH - Sistema de Banco de Horas

Sistema corporativo completo para gestão de banco de horas, desenvolvido com React, Node.js, TypeScript e MySQL.

## 🎯 Funcionalidades

### ✅ Implementado

- **Autenticação e Autorização**
  - Login com JWT + Refresh Token
  - Controle de acesso por perfil (EMPLOYEE, MANAGER, RH, DIRECTOR, ADMIN)
  - Troca de senha
  - Rate limiting para proteção contra brute force

- **Gestão de Funcionários**
  - CRUD completo de funcionários
  - Hierarquia (gestor → funcionário)
  - Equipes, cargos e tipos de contrato
  - Paginação e busca

- **Banco de Horas**
  - Registro de ponto (entrada, saída, intervalos)
  - Cálculo automático de saldo diário
  - Tipos de lançamento (trabalho, hora extra, compensação, férias, etc.)
  - Fluxo de aprovação (PENDING → APPROVED/REJECTED)
  - Fechamento mensal automático
  - Importação de histórico desde 2022 via Excel

- **Dashboards e Relatórios**
  - Dashboard do Funcionário (saldo, evolução mensal)
  - Dashboard do Gestor (equipe, aprovações pendentes)
  - Dashboard da Diretoria (visão geral, rankings, gráficos)
  - Logs de auditoria completos

- **Segurança**
  - Pool de conexões MySQL
  - Validação de input com Zod
  - CORS configurado
  - Helmet para headers de segurança
  - Tratamento de erros centralizado
  - Auditoria automática via triggers

## 📁 Estrutura do Projeto

```
wfibraRH-main/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # Pool de conexões MySQL
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── employee.controller.ts
│   │   │   ├── timeRecord.controller.ts
│   │   │   └── dashboard.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── schemas/
│   │   │   ├── auth.schema.ts
│   │   │   ├── employee.schema.ts
│   │   │   └── timeRecord.schema.ts
│   │   ├── services/
│   │   │   ├── employee.service.ts
│   │   │   ├── timeRecord.service.ts
│   │   │   └── dashboard.service.ts
│   │   ├── routes.ts
│   │   └── server.ts
│   └── package.json
├── database/
│   ├── migrations/
│   │   └── 001_add_missing_fields_and_tables.sql
│   ├── schema.sql
│   ├── seed.sql
│   ├── migrate.ts
│   ├── run-migrations.ts
│   ├── import-excel-history.ts      # Importador de histórico
│   ├── generate-excel-template.ts   # Gerador de template
│   └── IMPORTACAO_EXCEL.md          # Documentação de importação
├── frontend/
│   └── src/
└── .env.example

```

## 🚀 Como Rodar

### Pré-requisitos

- Node.js (v18+)
- MySQL Server 8.0+
- npm ou yarn

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar .env.example para .env
cp .env.example .env

# Editar .env e configurar:
# - Credenciais do MySQL
# - Gerar JWT_SECRET forte: openssl rand -base64 64
# - Gerar JWT_REFRESH_SECRET forte: openssl rand -base64 64
```

### 2. Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurar Banco de Dados

```bash
# Criar banco e tabelas
npx ts-node database/migrate.ts

# Executar migrações (adiciona campos, views, procedures, triggers)
npx ts-node database/run-migrations.ts

# Popular dados iniciais (equipes, cargos, admin)
npx ts-node database/seed.ts
```

### 4. Importar Histórico (Opcional)

Se você tem dados históricos de banco de horas desde 2022 em Excel:

```bash
# Gerar template de exemplo
npx ts-node database/generate-excel-template.ts

# Importar dados reais
npx ts-node database/import-excel-history.ts "caminho/para/historico.xlsx"
```

Veja [IMPORTACAO_EXCEL.md](database/IMPORTACAO_EXCEL.md) para detalhes.

### 5. Iniciar Servidores

```bash
# Backend (porta 3006)
cd backend
npm run dev

# Frontend (porta 5173)
cd frontend
npm run dev
```

## 🔐 Credenciais Padrão

Após rodar o seed:

- **Email**: admin@wfibra.com
- **Senha**: admin123

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

## 📡 API Endpoints

### Autenticação
- `POST /api/login` - Login
- `POST /api/refresh-token` - Renovar token
- `POST /api/change-password` - Trocar senha
- `GET /api/me` - Dados do usuário logado

### Funcionários
- `GET /api/employees` - Listar funcionários
- `GET /api/employees/:id` - Buscar funcionário
- `POST /api/employees` - Criar funcionário
- `PUT /api/employees/:id` - Atualizar funcionário
- `DELETE /api/employees/:id` - Desativar funcionário

### Registros de Ponto
- `POST /api/time-records` - Criar registro
- `GET /api/time-records/my` - Meus registros
- `GET /api/time-records/employee/:userId` - Registros de funcionário
- `GET /api/time-records/pending` - Aprovações pendentes
- `PUT /api/time-records/:id/approve` - Aprovar registro
- `PUT /api/time-records/:id/reject` - Rejeitar registro
- `POST /api/time-records/close-monthly` - Fechar mês

### Dashboards
- `GET /api/dashboard/my-balance` - Meu saldo
- `GET /api/dashboard/my-evolution` - Minha evolução
- `GET /api/dashboard/employee/:userId/balance` - Saldo de funcionário
- `GET /api/dashboard/employee/:userId/evolution` - Evolução de funcionário
- `GET /api/dashboard/team/:teamId` - Resumo da equipe
- `GET /api/dashboard/director` - Dashboard diretoria
- `GET /api/dashboard/manager` - Dashboard gestor
- `GET /api/dashboard/audit-logs` - Logs de auditoria

### Opções (Dropdowns)
- `GET /api/options/teams` - Listar equipes
- `GET /api/options/positions` - Listar cargos
- `GET /api/options/contract-types` - Listar tipos de contrato

## 🗄️ Banco de Dados

### Tabelas Principais

- `users` - Funcionários e usuários
- `teams` - Equipes
- `positions` - Cargos
- `contract_types` - Tipos de contrato (CLT, PJ)
- `time_records` - Registros de ponto diários
- `monthly_balances` - Saldos mensais fechados
- `audit_logs` - Logs de auditoria
- `system_settings` - Configurações do sistema

### Views

- `v_employee_total_balance` - Saldo total acumulado por funcionário
- `v_monthly_evolution` - Evolução mensal de banco de horas

### Stored Procedures

- `sp_calculate_daily_balance(time_record_id)` - Calcula saldo do dia
- `sp_close_monthly_balance(user_id, reference_date)` - Fecha saldo mensal

### Triggers

- `trg_users_audit_update` - Auditoria de alterações em usuários
- `trg_time_records_audit_update` - Auditoria de aprovações/rejeições

## 🔒 Segurança

- ✅ JWT com expiração (8h) + Refresh Token (7 dias)
- ✅ Senhas com bcrypt (10 rounds)
- ✅ Rate limiting (5 tentativas de login / 15min)
- ✅ Validação de input com Zod
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Pool de conexões MySQL (evita esgotamento)
- ✅ Prepared statements (proteção SQL Injection)
- ✅ Auditoria automática via triggers

## 📊 Regras de Negócio

- Jornada padrão: 8h/dia, 220h/mês (configurável em `system_settings`)
- Saldo positivo = horas a favor do funcionário
- Saldo negativo = horas devidas pelo funcionário
- Valor a receber = saldo_horas × (salário / 220)
- Registros precisam de aprovação do gestor/RH
- Meses fechados não podem ser alterados

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- TypeScript
- MySQL2 (pool de conexões)
- JWT (jsonwebtoken)
- Bcrypt
- Zod (validação)
- Helmet (segurança)
- CORS
- Express Rate Limit
- XLSX (importação Excel)

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Axios
- React Router
- Recharts (gráficos)
- Lucide React (ícones)

## 📝 Scripts Úteis

```bash
# Backend
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start            # Rodar produção

# Banco de Dados
npx ts-node database/migrate.ts                    # Criar banco
npx ts-node database/run-migrations.ts             # Rodar migrações
npx ts-node database/seed.ts                       # Popular dados
npx ts-node database/generate-excel-template.ts    # Gerar template Excel
npx ts-node database/import-excel-history.ts <arquivo>  # Importar histórico
```

## 🐛 Troubleshooting

### Erro de conexão MySQL
- Verifique se o MySQL está rodando
- Confira credenciais no `.env`
- Teste conexão: `mysql -u root -p`

### Erro "Cannot find module"
- Rode `npm install` no backend e frontend
- Verifique se está na pasta correta

### Erro de permissão no MySQL
- Garanta que o usuário tem permissões:
```sql
GRANT ALL PRIVILEGES ON wfibra.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Frontend não conecta na API
- Verifique `VITE_API_URL` no `.env` do frontend
- Confirme que backend está rodando na porta correta

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação de Importação](database/IMPORTACAO_EXCEL.md)
- [Análise de Erros e Correções](../brain/analise_erros_correcoes.md)

## 📄 Licença

Uso interno - Wfibra RH

---

**Desenvolvido com ❤️ para modernizar a gestão de banco de horas**
