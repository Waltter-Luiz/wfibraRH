/**
 * Middleware de tratamento de erros global
 */

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('❌ Erro capturado:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        user: (req as any).user?.id
    });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Erro não tratado
    return res.status(500).json({
        message: 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && {
            error: err.message,
            stack: err.stack
        })
    });
};

// Middleware para rotas não encontradas
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        message: `Rota ${req.method} ${req.url} não encontrada`
    });
};
