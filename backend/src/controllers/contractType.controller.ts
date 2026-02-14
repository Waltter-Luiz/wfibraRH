import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getContractTypes = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.execute(`
      SELECT id, name
      FROM contract_types
      ORDER BY name ASC
    `);

        return res.json(rows);
    } catch (error) {
        console.error('Erro ao listar tipos de contrato:', error);
        return res.status(500).json({ message: 'Erro ao listar tipos de contrato.' });
    } finally {
        connection.release();
    }
};

export const getContractTypeById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.execute(
            `SELECT id, name FROM contract_types WHERE id = ? LIMIT 1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de contrato não encontrado.' });
        }

        return res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar tipo de contrato:', error);
        return res.status(500).json({ message: 'Erro ao buscar tipo de contrato.' });
    } finally {
        connection.release();
    }
};

export const createContractType = async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: 'Nome inválido.' });
    }

    const connection = await pool.getConnection();

    try {
        const [exists]: any = await connection.execute(
            `SELECT id FROM contract_types WHERE name = ? LIMIT 1`,
            [name.trim()]
        );

        if (exists.length > 0) {
            return res.status(400).json({ message: 'Já existe um tipo de contrato com este nome.' });
        }

        await connection.execute(
            `INSERT INTO contract_types (name) VALUES (?)`,
            [name.trim()]
        );

        return res.status(201).json({ message: 'Tipo de contrato cadastrado com sucesso.' });
    } catch (error) {
        console.error('Erro ao criar tipo de contrato:', error);
        return res.status(500).json({ message: 'Erro ao criar tipo de contrato.' });
    } finally {
        connection.release();
    }
};

export const updateContractType = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: 'Nome inválido.' });
    }

    const connection = await pool.getConnection();

    try {
        const [exists]: any = await connection.execute(
            `SELECT id FROM contract_types WHERE id = ? LIMIT 1`,
            [id]
        );

        if (exists.length === 0) {
            return res.status(404).json({ message: 'Tipo de contrato não encontrado.' });
        }

        await connection.execute(
            `UPDATE contract_types SET name = ? WHERE id = ?`,
            [name.trim(), id]
        );

        return res.json({ message: 'Tipo de contrato atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar tipo de contrato:', error);
        return res.status(500).json({ message: 'Erro ao atualizar tipo de contrato.' });
    } finally {
        connection.release();
    }
};

export const deleteContractType = async (req: Request, res: Response) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        const [exists]: any = await connection.execute(
            `SELECT id FROM contract_types WHERE id = ? LIMIT 1`,
            [id]
        );

        if (exists.length === 0) {
            return res.status(404).json({ message: 'Tipo de contrato não encontrado.' });
        }

        await connection.execute(`DELETE FROM contract_types WHERE id = ?`, [id]);

        return res.json({ message: 'Tipo de contrato removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir tipo de contrato:', error);
        return res.status(500).json({ message: 'Erro ao excluir tipo de contrato.' });
    } finally {
        connection.release();
    }
};
