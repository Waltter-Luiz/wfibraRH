import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não definido no .env');
}

if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET não definido no .env');
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.execute(
            `
      SELECT 
        id, name, email, role, team_id, is_active, password_hash
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
            [normalizedEmail]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = rows[0];

        if (!user.is_active) {
            return res.status(403).json({ message: 'Usuário desativado.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            token,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                team_id: user.team_id
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    } finally {
        connection.release();
    }
};

export const changePassword = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.execute(
            `
      SELECT password_hash
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const user = rows[0];

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha atual incorreta.' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await connection.execute(
            `
      UPDATE users 
      SET password_hash = ?
      WHERE id = ?
      `,
            [newHash, userId]
        );

        return res.json({ message: 'Senha alterada com sucesso.' });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    } finally {
        connection.release();
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token não fornecido.' });
    }

    const connection = await pool.getConnection();

    try {
        const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        const userId = decoded.id;

        const [rows]: any = await connection.execute(
            `
      SELECT id, name, role, is_active
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(403).json({ message: 'Refresh token inválido.' });
        }

        const user = rows[0];

        if (!user.is_active) {
            return res.status(403).json({ message: 'Usuário desativado.' });
        }

        const newAccessToken = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({ token: newAccessToken });

    } catch (error) {
        return res.status(403).json({ message: 'Refresh token inválido.' });
    } finally {
        connection.release();
    }
};
