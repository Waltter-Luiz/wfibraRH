import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getPositions = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.execute(
            `SELECT id, title FROM positions ORDER BY title ASC`
        );

        return res.json(rows);
    } catch (err) {
        console.error('Erro ao listar cargos:', err);
        return res.status(500).json({ message: 'Erro ao listar cargos.' });
    } finally {
        connection.release();
    }
};

export const getPositionById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.execute(
            `SELECT id, title FROM positions WHERE id = ? LIMIT 1`,
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: 'Cargo não encontrado.' });
        }

        return res.json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar cargo:', err);
        return res.status(500).json({ message: 'Erro ao buscar cargo.' });
    } finally {
        connection.release();
    }
};

export const createPosition = async (req: Request, res: Response) => {
    const { title } = req.body;

    if (!title || title.trim().length < 2) {
        return res.status(400).json({ message: 'Título do cargo inválido.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.execute(
            `INSERT INTO positions (title) VALUES (?)`,
            [title.trim()]
        );

        return res.status(201).json({ message: 'Cargo cadastrado com sucesso!' });
    } catch (err: any) {
        console.error('Erro ao criar cargo:', err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Já existe um cargo com esse nome.' });
        }

        return res.status(500).json({ message: 'Erro ao criar cargo.' });
    } finally {
        connection.release();
    }
};

export const updatePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim().length < 2) {
        return res.status(400).json({ message: 'Título do cargo inválido.' });
    }

    const connection = await pool.getConnection();

    try {
        const [result]: any = await connection.execute(
            `UPDATE positions SET title = ? WHERE id = ?`,
            [title.trim(), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cargo não encontrado.' });
        }

        return res.json({ message: 'Cargo atualizado com sucesso!' });
    } catch (err: any) {
        console.error('Erro ao atualizar cargo:', err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Já existe um cargo com esse nome.' });
        }

        return res.status(500).json({ message: 'Erro ao atualizar cargo.' });
    } finally {
        connection.release();
    }
};

export const deletePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        const [result]: any = await connection.execute(
            `DELETE FROM positions WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cargo não encontrado.' });
        }

        return res.json({ message: 'Cargo excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir cargo:', err);
        return res.status(500).json({ message: 'Erro ao excluir cargo.' });
    } finally {
        connection.release();
    }
};
