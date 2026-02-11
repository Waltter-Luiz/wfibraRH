/**
 * Service para gerenciamento de registros de ponto e banco de horas
 */

import { pool } from '../config/database';

export class TimeRecordService {
    async createTimeRecord(data: any) {
        const connection = await pool.getConnection();
        try {
            const [result]: any = await connection.execute(
                `INSERT INTO time_records (user_id, date, entry_time, exit_time, break_start, break_end, adjustment_type, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.user_id,
                    data.date,
                    data.entry_time || null,
                    data.exit_time || null,
                    data.break_start || null,
                    data.break_end || null,
                    data.adjustment_type || 'WORK',
                    data.notes || null
                ]
            );

            // Calcular saldo automaticamente se houver horários
            if (data.entry_time && data.exit_time) {
                await connection.execute('CALL sp_calculate_daily_balance(?)', [result.insertId]);
            }

            return { id: result.insertId, ...data };
        } finally {
            connection.release();
        }
    }

    async approveTimeRecord(id: number, approvedByUserId: number) {
        const connection = await pool.getConnection();
        try {
            // Setar variável de sessão para auditoria
            await connection.execute('SET @current_user_id = ?', [approvedByUserId]);

            await connection.execute(
                `UPDATE time_records SET status = 'APPROVED', approved_by_user_id = ? WHERE id = ?`,
                [approvedByUserId, id]
            );

            return { success: true };
        } finally {
            connection.release();
        }
    }

    async rejectTimeRecord(id: number, approvedByUserId: number, reason?: string) {
        const connection = await pool.getConnection();
        try {
            // Setar variável de sessão para auditoria
            await connection.execute('SET @current_user_id = ?', [approvedByUserId]);

            const notes = reason ? `REJEITADO: ${reason}` : 'REJEITADO';

            await connection.execute(
                `UPDATE time_records 
                 SET status = 'REJECTED', approved_by_user_id = ?, notes = CONCAT(IFNULL(notes, ''), '\n', ?)
                 WHERE id = ?`,
                [approvedByUserId, notes, id]
            );

            return { success: true };
        } finally {
            connection.release();
        }
    }

    async getTimeRecordsByUser(userId: number, month?: string) {
        const connection = await pool.getConnection();
        try {
            let query = `
                SELECT tr.*, u.name AS employee_name, a.name AS approver_name
                FROM time_records tr
                JOIN users u ON tr.user_id = u.id
                LEFT JOIN users a ON tr.approved_by_user_id = a.id
                WHERE tr.user_id = ?
            `;

            const params: any[] = [userId];

            if (month) {
                query += ` AND DATE_FORMAT(tr.date, '%Y-%m') = ?`;
                params.push(month);
            }

            query += ` ORDER BY tr.date DESC`;

            const [rows] = await connection.execute(query, params);
            return rows;
        } finally {
            connection.release();
        }
    }

    async getPendingApprovals(managerId: number) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT tr.*, u.name AS employee_name, u.team_id
                 FROM time_records tr
                 JOIN users u ON tr.user_id = u.id
                 WHERE u.manager_id = ? AND tr.status = 'PENDING'
                 ORDER BY tr.date DESC`,
                [managerId]
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    async getAllPendingApprovals() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT tr.*, u.name AS employee_name, u.team_id, t.name AS team_name
                 FROM time_records tr
                 JOIN users u ON tr.user_id = u.id
                 LEFT JOIN teams t ON u.team_id = t.id
                 WHERE tr.status = 'PENDING'
                 ORDER BY tr.date DESC`
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    async closeMonthlyBalance(userId: number, referenceDate: string) {
        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'CALL sp_close_monthly_balance(?, ?)',
                [userId, referenceDate]
            );
            return { success: true };
        } finally {
            connection.release();
        }
    }

    async closeAllMonthlyBalances(referenceDate: string) {
        const connection = await pool.getConnection();
        try {
            // Buscar todos os usuários ativos
            const [users]: any = await connection.execute(
                'SELECT id FROM users WHERE is_active = TRUE'
            );

            for (const user of users) {
                await connection.execute(
                    'CALL sp_close_monthly_balance(?, ?)',
                    [user.id, referenceDate]
                );
            }

            return { success: true, processed: users.length };
        } finally {
            connection.release();
        }
    }
}
