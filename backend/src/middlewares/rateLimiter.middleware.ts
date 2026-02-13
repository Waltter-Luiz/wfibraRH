import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request, Response } from 'express';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? 'unknown'),

    handler: (req: Request, res: Response) => {
        return res.status(429).json({
            message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        });
    },
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? 'unknown'),

    handler: (req: Request, res: Response) => {
        return res.status(429).json({
            message: 'Muitas requisições. Tente novamente em alguns minutos.',
        });
    },
});
