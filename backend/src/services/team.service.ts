import { pool } from '../config/database';

export class TeamService {
    async getAll() {
        const connection = await pool.getConnection();

        try {
            const [rows]: any = await connection.execute(`
        SELECT id, name
        FROM teams
        ORDER BY name ASC
      `);

            return rows;
        } finally {
            connection.release();
        }
    }

    async getById(id: number) {
        const connection = await pool.getConnection();

        try {
            const [rows]: any = await connection.execute(
                `
        SELECT id, name
        FROM teams
        WHERE id = ?
        LIMIT 1
        `,
                [id]
            );

            return rows.length > 0 ? rows[0] : null;
        } finally {
            connection.release();
        }
    }

    async create(name: string) {
        const connection = await pool.getConnection();

        try {
            const [result]: any = await connection.execute(
                `
        INSERT INTO teams (name)
        VALUES (?)
        `,
                [name]
            );

            return result.insertId;
        } finally {
            connection.release();
        }
    }

    async update(id: number, name: string) {
        const connection = await pool.getConnection();

        try {
            const [result]: any = await connection.execute(
                `
        UPDATE teams
        SET name = ?
        WHERE id = ?
        `,
                [name, id]
            );

            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }

    async delete(id: number) {
        const connection = await pool.getConnection();

        try {
            const [result]: any = await connection.execute(
                `
        DELETE FROM teams
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
