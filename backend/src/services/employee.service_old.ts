
import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

export class EmployeeService {
    async createEmployee(data: any) {
        const connection = await pool.getConnection();
        try {
            // Check if email already exists
            const [existing]: any = await connection.execute('SELECT id FROM users WHERE email = ?', [data.email]);
            if (existing.length > 0) {
                throw new Error('Email já cadastrado');
            }

            const passwordHash = await bcrypt.hash(data.password || 'mudar123', 10);

            const [result]: any = await connection.execute(
                `INSERT INTO users (name, email, password_hash, role, team_id, position_id, contract_type_id, manager_id, salary, admission_date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.name,
                    data.email,
                    passwordHash,
                    data.role || 'EMPLOYEE',
                    data.team_id || null,
                    data.position_id || null,
                    data.contract_type_id || null,
                    data.manager_id || null,
                    data.salary || 0,
                    data.admission_date || new Date()
                ]
            );

            return { id: result.insertId, ...data };
        } finally {
            connection.release();
        }
    }

    async getEmployees(page: number = 1, limit: number = 10, search: string = '') {
        const connection = await pool.getConnection();
        const offset = (page - 1) * limit;

        try {
            let query = `
                SELECT u.id, u.name, u.email, u.role, u.is_active, u.admission_date,
                       t.name as team_name, p.title as position_title, c.name as contract_type_name,
                       m.name as manager_name
                FROM users u
                LEFT JOIN teams t ON u.team_id = t.id
                LEFT JOIN positions p ON u.position_id = p.id
                LEFT JOIN contract_types c ON u.contract_type_id = c.id
                LEFT JOIN users m ON u.manager_id = m.id
                WHERE 1=1
            `;

            const params: any[] = [];

            if (search) {
                query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }

            // Count total for pagination
            const countQuery = query.replace(
                'SELECT u.id, u.name, u.email, u.role, u.is_active, u.admission_date, t.name as team_name, p.title as position_title, c.name as contract_type_name, m.name as manager_name',
                'SELECT COUNT(*) as total'
            );
            const [countRows]: any = await connection.execute(countQuery, params);
            const total = countRows[0].total;

            query += ` ORDER BY u.name ASC LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            const [rows] = await connection.execute(query, params);

            return {
                data: rows,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } finally {
            connection.release();
        }
    }

    async getEmployeeById(id: number) {
        const connection = await pool.getConnection();
        try {
            const [rows]: any = await connection.execute(
                `SELECT id, name, email, role, team_id, position_id, contract_type_id, manager_id, salary, admission_date, is_active 
                 FROM users WHERE id = ?`,
                [id]
            );
            return rows[0];
        } finally {
            connection.release();
        }
    }

    async updateEmployee(id: number, data: any) {
        const connection = await pool.getConnection();
        try {
            // Dynamic update query
            const fields = [];
            const values = [];

            if (data.name) { fields.push('name = ?'); values.push(data.name); }
            if (data.email) { fields.push('email = ?'); values.push(data.email); }
            if (data.role) { fields.push('role = ?'); values.push(data.role); }
            if (data.team_id !== undefined) { fields.push('team_id = ?'); values.push(data.team_id); }
            if (data.position_id !== undefined) { fields.push('position_id = ?'); values.push(data.position_id); }
            if (data.contract_type_id !== undefined) { fields.push('contract_type_id = ?'); values.push(data.contract_type_id); }
            if (data.manager_id !== undefined) { fields.push('manager_id = ?'); values.push(data.manager_id); }
            if (data.salary !== undefined) { fields.push('salary = ?'); values.push(data.salary); }
            if (data.admission_date) { fields.push('admission_date = ?'); values.push(data.admission_date); }
            if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

            if (fields.length === 0) return null;

            values.push(id);
            await connection.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

            return this.getEmployeeById(id);
        } finally {
            connection.release();
        }
    }

    async deleteEmployee(id: number) {
        // Soft delete
        return this.updateEmployee(id, { is_active: false });
    }
}
