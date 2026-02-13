import { pool } from '../config/database';

export class EmployeeService {
    async getEmployees(page: number, limit: number, search: string) {
        page = Number(page);
        limit = Number(limit);

        if (!page || page < 1) page = 1;
        if (!limit || limit < 1) limit = 10;
        if (limit > 100) limit = 100;

        const offset = (page - 1) * limit;

        const connection = await pool.getConnection();

        try {
            const searchTerm = `%${search}%`;

            const [countRows]: any = await connection.execute(
                `
        SELECT COUNT(*) as total
        FROM users u
        LEFT JOIN teams t ON u.team_id = t.id
        LEFT JOIN positions p ON u.position_id = p.id
        WHERE (u.name LIKE ? OR u.email LIKE ?)
        `,
                [searchTerm, searchTerm]
            );

            const total = countRows[0].total;
            const totalPages = Math.ceil(total / limit);

            const [rows]: any = await connection.execute(
                `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.team_id,
          u.position_id,
          u.contract_type_id,
          u.manager_id,
          u.salary,
          u.admission_date,
          u.is_active,
          t.name AS team_name,
          p.title AS position_title
        FROM users u
        LEFT JOIN teams t ON u.team_id = t.id
        LEFT JOIN positions p ON u.position_id = p.id
        WHERE (u.name LIKE ? OR u.email LIKE ?)
        ORDER BY u.name ASC
        LIMIT ${limit} OFFSET ${offset}
        `,
                [searchTerm, searchTerm]
            );

            return {
                data: rows,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            };
        } finally {
            connection.release();
        }
    }

    async getEmployeeById(id: number) {
        const connection = await pool.getConnection();

        try {
            const [rows]: any = await connection.execute(
                `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.team_id,
          u.position_id,
          u.contract_type_id,
          u.manager_id,
          u.salary,
          u.admission_date,
          u.is_active,
          t.name AS team_name,
          p.title AS position_title
        FROM users u
        LEFT JOIN teams t ON u.team_id = t.id
        LEFT JOIN positions p ON u.position_id = p.id
        WHERE u.id = ?
        LIMIT 1
        `,
                [id]
            );

            return rows.length > 0 ? rows[0] : null;
        } finally {
            connection.release();
        }
    }

    async deleteEmployee(id: number) {
        const connection = await pool.getConnection();

        try {
            const [result]: any = await connection.execute(
                `
        UPDATE users 
        SET is_active = 0
        WHERE id = ?
        `,
                [id]
            );

            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }
}
