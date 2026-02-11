-- CRIAÇÃO DO BANCO
CREATE DATABASE IF NOT EXISTS wfibra;
USE wfibra;

-- 1. TABELAS DE ESTRUTURA
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS contract_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE -- 'CLT', 'PJ', 'ESTÁGIO'
);

-- 2. USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('EMPLOYEE', 'MANAGER', 'RH', 'DIRECTOR', 'ADMIN') DEFAULT 'EMPLOYEE',
    
    team_id INT,
    position_id INT,
    contract_type_id INT,
    
    salary DECIMAL(10, 2), -- Acesso restrito via Backend
    admission_date DATE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (position_id) REFERENCES positions(id),
    FOREIGN KEY (contract_type_id) REFERENCES contract_types(id)
);

-- 3. BANCO DE HORAS - REGISTROS DO PASSADO (IMPORTAÇÃO 2022...) E FECHAMENTOS
CREATE TABLE IF NOT EXISTS monthly_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reference_date DATE NOT NULL, -- Primeiro dia do mês referente (ex: 2022-06-01)
    
    balance_hours DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Saldo em horas (ex: 15.5 para 15h30, -2.0 para devendo 2h)
    balance_amount DECIMAL(10, 2) DEFAULT 0, -- Saldo em Dinheiro (R$) baseado no salário da época
    
    is_closed BOOLEAN DEFAULT TRUE, -- Se já foi fechado e não deve mudar
    notes TEXT, -- Observações sobre esse fechamento
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (user_id, reference_date) -- Garante apenas um registro por mês por funcionário
);

-- 4. BANCO DE HORAS - REGISTROS DIÁRIOS (BATIDAS E AJUSTES)
CREATE TABLE IF NOT EXISTS time_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    
    entry_time TIME, -- Entrada
    exit_time TIME, -- Saída
    break_start TIME, -- Início Intervalo (Opcional)
    break_end TIME, -- Fim Intervalo (Opcional)
    
    total_minutes_worked INT, -- Calculado (ex: 480 para 8 horas)
    balance_minutes_daily INT, -- Saldo do dia (ex: +30, -15)
    
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    adjustment_type ENUM('WORK', 'ABSENCE', 'HOLIDAY', 'MEDICAL_LEAVE') DEFAULT 'WORK',
    
    notes TEXT,
    approved_by_user_id INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

-- 5. LOGS DE AUDITORIA
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by_user_id INT NOT NULL,
    target_id INT, -- ID do registro alterado
    target_table VARCHAR(50), -- Tabela alterada
    details JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (performed_by_user_id) REFERENCES users(id)
);
