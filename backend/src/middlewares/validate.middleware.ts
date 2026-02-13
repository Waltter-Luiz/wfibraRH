/**
 * Middleware de validação usando Zod
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req.body);

            // 🔥 Importantíssimo: salvar os dados validados/coagidos no req.body
            req.body = parsed;

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.errors.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }

            next(error);
        }
    };
};
