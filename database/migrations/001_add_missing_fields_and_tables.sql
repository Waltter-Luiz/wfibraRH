-- MIGRAÇÃO: Adicionar campos e tabelas faltantes (VERSÃO PT-BR)
-- Data: 2026-02-09
-- Descrição: Adiciona manager_id, system_settings, melhora ENUMs, constraints e índices
-- IMPORTANTE: Todos os valores visíveis ao usuário estão em PORTUGUÊS

USE wfibra;

-- 1. Adicionar campo manager_id em users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS manager_id INT,
ADD CONSTRAINT fk_users_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- 2. Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('default_daily_hours', '8', 'Jornada padrão diária em horas'),
('default_monthly_hours', '220', 'Jornada padrão mensal em horas'),
('monthly_closing_day', '25', 'Dia do mês para fechamento (1-28)'),
('max_overtime_daily', '2', 'Máximo de horas extras por dia');

-- 3. Melhorar ENUM de adjustment_type (EM PORTUGUÊS)
ALTER TABLE time_records 
MODIFY COLUMN adjustment_type ENUM(
    'TRABALHO', 
    'HORA_EXTRA', 
    'COMPENSACAO', 
    'FALTA_JUSTIFICADA', 
    'FALTA_INJUSTIFICADA', 
    'FERIADO', 
    'FERIAS', 
    'ATESTADO_MEDICO'
) DEFAULT 'TRABALHO';

-- 3.1 Atualizar status para português
ALTER TABLE time_records
MODIFY COLUMN status ENUM('PENDENTE', 'APROVADO', 'REJEITADO') DEFAULT 'PENDENTE';

-- 4. Adicionar constraints de validação
ALTER TABLE users 
ADD CONSTRAINT chk_salary CHECK (salary >= 0);

ALTER TABLE monthly_balances 
ADD CONSTRAINT chk_balance_hours CHECK (balance_hours BETWEEN -500 AND 500);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_time_records_user_date ON time_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_monthly_balances_user_ref ON monthly_balances(user_id, reference_date);
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(performed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- 6. Criar VIEW de saldo total acumulado
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

-- 7. Criar VIEW de evolução mensal
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

-- 8. Criar STORED PROCEDURE para calcular saldo do dia
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
    
    -- Buscar configuração de jornada padrão
    SELECT CAST(setting_value AS UNSIGNED) * 60 INTO v_default_daily_minutes
    FROM system_settings WHERE setting_key = 'default_daily_hours';
    
    -- Buscar dados do registro
    SELECT entry_time, exit_time, break_start, break_end
    INTO v_entry, v_exit, v_break_start, v_break_end
    FROM time_records WHERE id = p_time_record_id;
    
    -- Calcular minutos trabalhados
    IF v_entry IS NOT NULL AND v_exit IS NOT NULL THEN
        SET v_total_minutes = TIMESTAMPDIFF(MINUTE, v_entry, v_exit);
        
        -- Calcular minutos de intervalo
        IF v_break_start IS NOT NULL AND v_break_end IS NOT NULL THEN
            SET v_break_minutes = TIMESTAMPDIFF(MINUTE, v_break_start, v_break_end);
        ELSE
            SET v_break_minutes = 0;
        END IF;
        
        SET v_worked_minutes = v_total_minutes - v_break_minutes;
        SET v_balance_minutes = v_worked_minutes - v_default_daily_minutes;
        
        -- Atualizar registro
        UPDATE time_records 
        SET 
            total_minutes_worked = v_worked_minutes,
            balance_minutes_daily = v_balance_minutes
        WHERE id = p_time_record_id;
    END IF;
END$$

DELIMITER ;

-- 9. Criar STORED PROCEDURE para fechamento mensal
DELIMITER $$

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
    
    -- Buscar salário do usuário
    SELECT salary INTO v_salary FROM users WHERE id = p_user_id;
    
    -- Calcular taxa horária
    SET v_hourly_rate = IFNULL(v_salary / 220, 0);
    
    -- Somar todos os saldos diários do mês (apenas APROVADOS)
    SELECT COALESCE(SUM(balance_minutes_daily), 0) INTO v_total_balance_minutes
    FROM time_records
    WHERE user_id = p_user_id
      AND DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(p_reference_date, '%Y-%m')
      AND status = 'APROVADO';
    
    -- Converter para horas
    SET v_total_balance_hours = v_total_balance_minutes / 60;
    
    -- Calcular valor em R$
    SET v_balance_amount = v_total_balance_hours * v_hourly_rate;
    
    -- Inserir ou atualizar monthly_balance
    INSERT INTO monthly_balances (user_id, reference_date, balance_hours, balance_amount, is_closed)
    VALUES (p_user_id, p_reference_date, v_total_balance_hours, v_balance_amount, TRUE)
    ON DUPLICATE KEY UPDATE
        balance_hours = v_total_balance_hours,
        balance_amount = v_balance_amount,
        is_closed = TRUE;
END$$

DELIMITER ;

-- 10. Criar TRIGGERS para auditoria
DELIMITER $$

DROP TRIGGER IF EXISTS trg_users_audit_update$$

CREATE TRIGGER trg_users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    -- Apenas registrar se houver mudanças significativas
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
            IFNULL(NEW.approved_by_user_id, @current_user_id, 1),
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

-- Finalizado
SELECT '✅ Migração concluída com sucesso!' AS status;
