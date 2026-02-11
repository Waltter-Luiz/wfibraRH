-- ========================================
-- SCRIPT COMPLETO DE INSTALAÇÃO - WFIBRA RH
-- ========================================
-- Este script cria TUDO do zero:
-- 1. Banco de dados
-- 2. Tabelas
-- 3. Dados iniciais
-- 4. Melhorias (manager_id, views, procedures, triggers)
-- 5. Usuário admin padrão
-- ========================================
-- DROP DATABASE IF EXISTS wfibra;
-- PASSO 1: CRIAR E USAR O BANCO
CREATE DATABASE IF NOT EXISTS wfibra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wfibra;

-- ========================================
-- PASSO 2: CRIAR TABELAS
-- ========================================

-- Tabelas de estrutura
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
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('EMPLOYEE', 'MANAGER', 'RH', 'DIRECTOR', 'ADMIN') DEFAULT 'EMPLOYEE',
    
    team_id INT,
    position_id INT,
    contract_type_id INT,
    manager_id INT,
    
    salary DECIMAL(10, 2),
    admission_date DATE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (position_id) REFERENCES positions(id),
    FOREIGN KEY (contract_type_id) REFERENCES contract_types(id),
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_salary CHECK (salary >= 0)
);

-- Tabela de saldos mensais
CREATE TABLE IF NOT EXISTS monthly_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reference_date DATE NOT NULL,
    
    balance_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
    balance_amount DECIMAL(10, 2) DEFAULT 0,
    
    is_closed BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (user_id, reference_date),
    CONSTRAINT chk_balance_hours CHECK (balance_hours BETWEEN -500 AND 500)
);

-- Tabela de registros de ponto (EM PORTUGUÊS)
CREATE TABLE IF NOT EXISTS time_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    
    entry_time TIME,
    exit_time TIME,
    break_start TIME,
    break_end TIME,
    
    total_minutes_worked INT,
    balance_minutes_daily INT,
    
    status ENUM('PENDENTE', 'APROVADO', 'REJEITADO') DEFAULT 'PENDENTE',
    adjustment_type ENUM(
        'TRABALHO', 
        'HORA_EXTRA', 
        'COMPENSACAO', 
        'FALTA_JUSTIFICADA', 
        'FALTA_INJUSTIFICADA', 
        'FERIADO', 
        'FERIAS', 
        'ATESTADO_MEDICO'
    ) DEFAULT 'TRABALHO',
    
    notes TEXT,
    approved_by_user_id INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by_user_id INT NOT NULL,
    target_id INT,
    target_table VARCHAR(50),
    details JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (performed_by_user_id) REFERENCES users(id)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- PASSO 3: CRIAR ÍNDICES
-- ========================================

-- Nota: MySQL não suporta IF NOT EXISTS para índices
-- Se o índice já existir, o erro será ignorado

CREATE INDEX idx_time_records_user_date ON time_records(user_id, date);
CREATE INDEX idx_monthly_balances_user_ref ON monthly_balances(user_id, reference_date);
CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_audit_logs_user ON audit_logs(performed_by_user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ========================================
-- PASSO 4: POPULAR DADOS INICIAIS
-- ========================================

-- Times
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

-- Tipos de contrato
INSERT IGNORE INTO contract_types (name) VALUES ('CLT'), ('PJ');

-- Cargos
INSERT IGNORE INTO positions (title) VALUES 
('Administrativo'), 
('Analista'), 
('Auxiliar'), 
('Diretor'), 
('Gerente'), 
('Supervisor'), 
('Vendedor');

-- Configurações do sistema
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('default_daily_hours', '8', 'Jornada padrão diária em horas'),
('default_monthly_hours', '220', 'Jornada padrão mensal em horas'),
('monthly_closing_day', '25', 'Dia do mês para fechamento (1-28)'),
('max_overtime_daily', '2', 'Máximo de horas extras por dia');

-- Usuário ADMIN padrão
-- Email: admin@wfibra.com
-- Senha: admin123
-- ATENÇÃO: Se o login falhar, execute o script seed no backend para gerar um hash válido:
-- npx ts-node src/scripts/seed.ts
INSERT IGNORE INTO users (name, email, password_hash, role, is_active) VALUES
('Administrador', 'admin@wfibra.com', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgNI9RPrxELhqi8.O.64wE.J9p6u', 'ADMIN', TRUE);

-- ========================================
-- PASSO 5: CRIAR VIEWS
-- ========================================

CREATE OR REPLACE VIEW v_employee_total_balance AS
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    u.team_id,
    t.name AS team_name,
    u.salary,
    COALESCE(SUM(mb.balance_hours), 0) AS total_balance_hours,
    COALESCE(SUM(mb.balance_amount), 0) AS total_balance_amount,
    ROUND(IFNULL(u.salary / 220, 0), 2) AS hourly_rate,
    ROUND((COALESCE(SUM(mb.balance_hours), 0) * IFNULL(u.salary / 220, 0)), 2) AS amount_to_receive
FROM users u
LEFT JOIN teams t ON u.team_id = t.id
LEFT JOIN monthly_balances mb ON u.id = mb.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email, u.team_id, t.name, u.salary;

CREATE OR REPLACE VIEW v_monthly_evolution AS
SELECT 
    mb.user_id,
    u.name,
    u.team_id,
    t.name AS team_name,
    mb.reference_date,
    mb.balance_hours,
    mb.balance_amount,
    mb.is_closed
FROM monthly_balances mb
JOIN users u ON mb.user_id = u.id
LEFT JOIN teams t ON u.team_id = t.id
ORDER BY mb.user_id, mb.reference_date;

-- ========================================
-- PASSO 6: CRIAR STORED PROCEDURES
-- ========================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_calculate_daily_balance$$

CREATE PROCEDURE sp_calculate_daily_balance(
    IN p_time_record_id INT
)
BEGIN
    DECLARE v_entry TIME;
    DECLARE v_exit TIME;
    DECLARE v_break_start TIME;
    DECLARE v_break_end TIME;
    DECLARE v_total_minutes INT;
    DECLARE v_break_minutes INT;
    DECLARE v_worked_minutes INT;
    DECLARE v_default_daily_minutes INT;
    DECLARE v_balance_minutes INT;
    
    SELECT CAST(setting_value AS UNSIGNED) * 60 INTO v_default_daily_minutes
    FROM system_settings WHERE setting_key = 'default_daily_hours';
    
    SELECT entry_time, exit_time, break_start, break_end
    INTO v_entry, v_exit, v_break_start, v_break_end
    FROM time_records WHERE id = p_time_record_id;
    
    IF v_entry IS NOT NULL AND v_exit IS NOT NULL THEN
        SET v_total_minutes = TIMESTAMPDIFF(MINUTE, v_entry, v_exit);
        
        IF v_break_start IS NOT NULL AND v_break_end IS NOT NULL THEN
            SET v_break_minutes = TIMESTAMPDIFF(MINUTE, v_break_start, v_break_end);
        ELSE
            SET v_break_minutes = 0;
        END IF;
        
        SET v_worked_minutes = v_total_minutes - v_break_minutes;
        SET v_balance_minutes = v_worked_minutes - v_default_daily_minutes;
        
        UPDATE time_records 
        SET 
            total_minutes_worked = v_worked_minutes,
            balance_minutes_daily = v_balance_minutes
        WHERE id = p_time_record_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_close_monthly_balance$$

CREATE PROCEDURE sp_close_monthly_balance(
    IN p_user_id INT,
    IN p_reference_date DATE
)
BEGIN
    DECLARE v_total_balance_minutes INT;
    DECLARE v_total_balance_hours DECIMAL(10,2);
    DECLARE v_salary DECIMAL(10,2);
    DECLARE v_hourly_rate DECIMAL(10,2);
    DECLARE v_balance_amount DECIMAL(10,2);
    
    SELECT salary INTO v_salary FROM users WHERE id = p_user_id;
    SET v_hourly_rate = IFNULL(v_salary / 220, 0);
    
    SELECT COALESCE(SUM(balance_minutes_daily), 0) INTO v_total_balance_minutes
    FROM time_records
    WHERE user_id = p_user_id
      AND DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(p_reference_date, '%Y-%m')
      AND status = 'APROVADO';
    
    SET v_total_balance_hours = v_total_balance_minutes / 60;
    SET v_balance_amount = v_total_balance_hours * v_hourly_rate;
    
    INSERT INTO monthly_balances (user_id, reference_date, balance_hours, balance_amount, is_closed)
    VALUES (p_user_id, p_reference_date, v_total_balance_hours, v_balance_amount, TRUE)
    ON DUPLICATE KEY UPDATE
        balance_hours = v_total_balance_hours,
        balance_amount = v_balance_amount,
        is_closed = TRUE;
END$$

DELIMITER ;

-- ========================================
-- PASSO 7: CRIAR TRIGGERS
-- ========================================

DELIMITER $$

DROP TRIGGER IF EXISTS trg_users_audit_update$$

CREATE TRIGGER trg_users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.name != NEW.name OR OLD.salary != NEW.salary OR OLD.role != NEW.role OR OLD.is_active != NEW.is_active THEN
        INSERT INTO audit_logs (action, performed_by_user_id, target_id, target_table, details)
        VALUES (
            'UPDATE',
            IFNULL(@current_user_id, 1),
            NEW.id,
            'users',
            JSON_OBJECT(
                'old_name', OLD.name,
                'new_name', NEW.name,
                'old_salary', OLD.salary,
                'new_salary', NEW.salary,
                'old_role', OLD.role,
                'new_role', NEW.role,
                'old_is_active', OLD.is_active,
                'new_is_active', NEW.is_active
            )
        );
    END IF;
END$$

DROP TRIGGER IF EXISTS trg_time_records_audit_update$$

CREATE TRIGGER trg_time_records_audit_update
AFTER UPDATE ON time_records
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO audit_logs (action, performed_by_user_id, target_id, target_table, details)
        VALUES (
            'UPDATE',
            COALESCE(NEW.approved_by_user_id, @current_user_id, 1),
            NEW.id,
            'time_records',
            JSON_OBJECT(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'user_id', NEW.user_id,
                'date', NEW.date
            )
        );
    END IF;
END$$

DELIMITER ;

-- ========================================
-- FINALIZADO!
-- ========================================

SELECT '✅ INSTALAÇÃO COMPLETA!' AS status;
SELECT 'Banco de dados criado e configurado com sucesso!' AS mensagem;
SELECT 'Login padrão: admin@wfibra.com | Senha: admin123' AS credenciais;
SELECT '⚠️ IMPORTANTE: Altere a senha do admin após o primeiro login!' AS aviso;
