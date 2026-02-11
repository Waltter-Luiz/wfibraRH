USE wfibra;

-- TEAMS
INSERT IGNORE INTO teams (name) VALUES 
('Administração Geral'), 
('Almoxarifado'), 
('CAP'), 
('Cobrança'), 
('Departamento Pessoal'),
('Frente de Loja'),
('Torre de Controle'),
('RH'),
('Vendas');

-- CONTRACT TYPES
INSERT IGNORE INTO contract_types (name) VALUES ('CLT'), ('PJ');

-- POSITIONS (Exemplos)
INSERT IGNORE INTO positions (title) VALUES ('Administrativo'), ('Analista'), ('Auxiliar'), ('Diretor'), ('Gerente'), ('Supervisor'), ('Vendedor');

-- USUÁRIO ADMIN 
-- Senha: 'admin' (hash bcrypt gerado para fins de desenvolvimento apenas)
-- Hash: $2a$12$Jk/sWd6D.1jWqB6e8r2eOu.q8jDq0u7H.1jWqB6e8r2eOu.q8jDq (fictício, vou gerar no script seed.ts)
-- Vamos criar via script TS para garantir o hash correto da senha.
