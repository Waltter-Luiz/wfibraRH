import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    console.log('🔐 Tentativa de login:', { email, passwordLength: password?.length });

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();
    try {
        const [rows]: any = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

        console.log('🔍 Usuários encontrados:', rows.length);

        if (rows.length === 0) {
            console.log('❌ Nenhum usuário encontrado com email:', email);
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const user = rows[0];
        console.log('👤 Usuário encontrado:', {
            id: user.id,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            hash_preview: user.password_hash?.substring(0, 20) + '...'
        });

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log('🔑 Senha válida?', isPasswordValid);

        if (!isPasswordValid) {
            console.log('❌ Senha incorreta para:', email);
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        if (!user.is_active) {
            console.log('⚠️ Usuário desativado:', email);
            return res.status(403).json({ message: 'Usuário desativado' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '8h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
            { expiresIn: '7d' }
        );

        console.log('✅ Login bem-sucedido:', { email, role: user.role });

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
        console.error('❌ Erro no login:', error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    } finally {
        connection.release();
    }
};

export const changePassword = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    const connection = await pool.getConnection();
    try {
        // 1. Verify current password
        const [rows]: any = await connection.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha atual incorreta' });
        }

        // 2. Hash new password and update
        const newHash = await bcrypt.hash(newPassword, 10);
        await connection.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

        return res.json({ message: 'Senha alterada com sucesso' });

    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    } finally {
        connection.release();
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token não fornecido' });
    }

    try {
        const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');

        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role, name: decoded.name },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '8h' }
        );

        res.json({ token: newAccessToken });
    } catch (error) {
        return res.status(403).json({ message: 'Refresh token inválido' });
    }
};