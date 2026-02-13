import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { EmployeeService } from '../services/employee.service';

const employeeService = new EmployeeService();

export const getEmployees = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = String(req.query.search || '');

        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : limit > 100 ? 100 : limit;

        const result = await employeeService.getEmployees(safePage, safeLimit, search);

        return res.json(result);
    } catch (error) {
        console.error('Erro ao listar colaboradores:', error);
        return res.status(500).json({ message: 'Erro ao listar colaboradores.' });
    }
};

export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || id <= 0) {
            return res.status(400).json({ message: 'ID inválido.' });
        }

        const employee = await employeeService.getEmployeeById(id);

        if (!employee) {
            return res.status(404).json({ message: 'Colaborador não encontrado.' });
        }

        return res.json(employee);
    } catch (error) {
        console.error('Erro ao buscar colaborador:', error);
        return res.status(500).json({ message: 'Erro ao buscar colaborador.' });
    }
};

export const createEmployee = async (req: Request, res: Response) => {
    const {
        name,
        email,
        password,
        role,
        team_id,
        position_id,
        contract_type_id,
        manager_id,
        salary,
        admission_date,
        is_active
    } = req.body;

    const connection = await pool.getConnection();

    try {
        const normalizedEmail = String(email).trim().toLowerCase();

        // Verifica duplicidade de email
        const [existing]: any = await connection.execute(
            `SELECT id FROM users WHERE email = ? LIMIT 1`,
            [normalizedEmail]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Senha é obrigatória.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result]: any = await connection.execute(
            `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        team_id,
        position_id,
        contract_type_id,
        manager_id,
        salary,
        admission_date,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                name,
                normalizedEmail,
                hashedPassword,
                role,
                team_id ?? null,
                position_id ?? null,
                contract_type_id ?? null,
                manager_id ?? null,
                salary ?? null,
                admission_date ?? null,
                is_active !== undefined ? (is_active ? 1 : 0) : 1
            ]
        );

        return res.status(201).json({
            message: 'Colaborador criado com sucesso.',
            employee: {
                id: result.insertId,
                name,
                email: normalizedEmail,
                role,
                team_id: team_id ?? null,
                position_id: position_id ?? null,
                contract_type_id: contract_type_id ?? null,
                manager_id: manager_id ?? null,
                salary: salary ?? null,
                admission_date: admission_date ?? null,
                is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1
            }
        });

    } catch (error) {
        console.error('Erro ao criar colaborador:', error);
        return res.status(500).json({ message: 'Erro ao criar colaborador.' });
    } finally {
        connection.release();
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!id || id <= 0) {
        return res.status(400).json({ message: 'ID inválido.' });
    }

    const {
        name,
        email,
        password,
        role,
        team_id,
        position_id,
        contract_type_id,
        manager_id,
        salary,
        admission_date,
        is_active
    } = req.body;

    const connection = await pool.getConnection();

    try {
        const fields: string[] = [];
        const values: any[] = [];

        // Normaliza email e valida duplicidade
        if (email !== undefined) {
            const normalizedEmail = String(email).trim().toLowerCase();

            const [existing]: any = await connection.execute(
                `SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1`,
                [normalizedEmail, id]
            );

            if (existing.length > 0) {
                return res.status(400).json({ message: 'Este e-mail já está em uso por outro colaborador.' });
            }

            fields.push('email = ?');
            values.push(normalizedEmail);
        }

        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name);
        }

        if (role !== undefined) {
            fields.push('role = ?');
            values.push(role);
        }

        if (team_id !== undefined) {
            fields.push('team_id = ?');
            values.push(team_id);
        }

        if (position_id !== undefined) {
            fields.push('position_id = ?');
            values.push(position_id);
        }

        if (contract_type_id !== undefined) {
            fields.push('contract_type_id = ?');
            values.push(contract_type_id);
        }

        if (manager_id !== undefined) {
            fields.push('manager_id = ?');
            values.push(manager_id);
        }

        if (salary !== undefined) {
            fields.push('salary = ?');
            values.push(salary);
        }

        if (admission_date !== undefined) {
            fields.push('admission_date = ?');
            values.push(admission_date);
        }

        if (is_active !== undefined) {
            fields.push('is_active = ?');
            values.push(is_active ? 1 : 0);
        }

        // Se senha vier, criptografa
        if (password !== undefined && String(password).trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push('password_hash = ?');
            values.push(hashedPassword);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'Nenhum dado enviado para atualização.' });
        }

        values.push(id);

        const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

        const [result]: any = await connection.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Colaborador não encontrado.' });
        }

        // Retorna atualizado
        const [updatedRows]: any = await connection.execute(
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

        return res.json({
            message: 'Colaborador atualizado com sucesso.',
            employee: updatedRows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar colaborador:', error);
        return res.status(500).json({ message: 'Erro ao atualizar colaborador.' });
    } finally {
        connection.release();
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || id <= 0) {
            return res.status(400).json({ message: 'ID inválido.' });
        }

        const success = await employeeService.deleteEmployee(id);

        if (!success) {
            return res.status(404).json({ message: 'Colaborador não encontrado.' });
        }

        return res.json({ message: 'Colaborador desativado com sucesso.' });

    } catch (error) {
        console.error('Erro ao desativar colaborador:', error);
        return res.status(500).json({ message: 'Erro ao desativar colaborador.' });
    }
};
