/**
 * Service para dashboards e relatórios
 */

import { pool } from '../config/database';

export class DashboardService {
    async getEmployeeTotalBalance(userId: number) {
        const connection = await pool.getConnection();
        try {
            const [rows]: any = await connection.execute(
                'SELECT * FROM v_employee_total_balance WHERE user_id = ?',
                [userId]
            );
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    async getMonthlyEvolution(userId: number, limit: number = 12) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT reference_date, balance_hours, balance_amount, is_closed
                 FROM monthly_balances
                 WHERE user_id = ?
                 ORDER BY reference_date DESC
                 LIMIT ?`,
                [userId, limit]
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    async getTeamSummary(teamId: number) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT * FROM v_employee_total_balance WHERE team_id = ? ORDER BY name ASC`,
                [teamId]
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    async getDirectorDashboard() {
        const connection = await pool.getConnection();
        try {
            const [totalEmployees]: any = await connection.execute(
                'SELECT COUNT(*) AS total FROM users WHERE is_active = TRUE'
            );

            const [totalTeams]: any = await connection.execute(
                'SELECT COUNT(*) AS total FROM teams'
            );

            const [pendingApprovals]: any = await connection.execute(
                'SELECT COUNT(*) AS total FROM time_records WHERE status = "PENDING"'
            );

            const [topBalances] = await connection.execute(
                `SELECT user_id, name, team_name, total_balance_hours, amount_to_receive
                 FROM v_employee_total_balance
                 ORDER BY total_balance_hours DESC
                 LIMIT 10`
            );

            const [bottomBalances] = await connection.execute(
                `SELECT user_id, name, team_name, total_balance_hours, amount_to_receive
                 FROM v_employee_total_balance
                 ORDER BY total_balance_hours ASC
                 LIMIT 10`
            );

            const [teamBalances] = await connection.execute(
                `SELECT 
                    team_id,
                    team_name,
                    COUNT(*) AS employee_count,
                    SUM(total_balance_hours) AS total_hours,
                    SUM(amount_to_receive) AS total_amount
                 FROM v_employee_total_balance
                 GROUP BY team_id, team_name
                 ORDER BY team_name`
            );

            return {
                summary: {
                    totalEmployees: totalEmployees[0].total,
                    totalTeams: totalTeams[0].total,
                    pendingApprovals: pendingApprovals[0].total
                },
                topBalances,
                bottomBalances,
                teamBalances
            };
        } finally {
            connection.release();
        }
    }

    async getManagerDashboard(managerId: number) {
        const connection = await pool.getConnection();
        try {
            // Funcionários do gestor
            const [teamMembers] = await connection.execute(
                `SELECT * FROM v_employee_total_balance WHERE user_id IN (
                    SELECT id FROM users WHERE manager_id = ? AND is_active = TRUE
                ) ORDER BY name ASC`,
                [managerId]
            );

            // Aprovações pendentes
            const [pendingApprovals]: any = await connection.execute(
                `SELECT COUNT(*) AS total FROM time_records tr
                 JOIN users u ON tr.user_id = u.id
                 WHERE u.manager_id = ? AND tr.status = 'PENDING'`,
                [managerId]
            );

            return {
                teamMembers,
                pendingApprovals: pendingApprovals[0].total
            };
        } finally {
            connection.release();
        }
    }

    async getAuditLogs(limit: number = 50, userId?: number) {
        const connection = await pool.getConnection();
        try {
            let query = `
                SELECT al.*, u.name AS performed_by_name
                FROM audit_logs al
                JOIN users u ON al.performed_by_user_id = u.id
                WHERE 1=1
            `;

            const params: any[] = [];

            if (userId) {
                query += ` AND al.performed_by_user_id = ?`;
                params.push(userId);
            }

            query += ` ORDER BY al.timestamp DESC LIMIT ?`;
            params.push(limit);

            const [rows] = await connection.execute(query, params);
            return rows;
        } finally {
            connection.release();
        }
    }
}
