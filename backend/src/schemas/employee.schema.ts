import { z } from 'zod';

export const createEmployeeSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),

    role: z.enum(['EMPLOYEE', 'MANAGER', 'RH', 'DIRECTOR', 'ADMIN']).default('EMPLOYEE'),

    team_id: z.coerce.number().int().positive().nullable().optional(),
    position_id: z.coerce.number().int().positive().nullable().optional(),
    contract_type_id: z.coerce.number().int().positive().nullable().optional(),
    manager_id: z.coerce.number().int().positive().nullable().optional(),

    salary: z.coerce.number().min(0, 'Salário deve ser positivo').nullable().optional(),

    admission_date: z.string().nullable().optional(),

    // no create pode vir omitido
    is_active: z.coerce.boolean().optional(),
});

export const updateEmployeeSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
    email: z.string().email('Email inválido').optional(),
    role: z.enum(['EMPLOYEE', 'MANAGER', 'RH', 'DIRECTOR', 'ADMIN']).optional(),

    team_id: z.coerce.number().int().positive().nullable().optional(),
    position_id: z.coerce.number().int().positive().nullable().optional(),
    contract_type_id: z.coerce.number().int().positive().nullable().optional(),
    manager_id: z.coerce.number().int().positive().nullable().optional(),

    salary: z.coerce.number().min(0, 'Salário deve ser positivo').nullable().optional(),

    admission_date: z.string().nullable().optional(),

    // 🔥 agora aceita 1/0, "true"/"false", true/false
    is_active: z.coerce.boolean().optional(),
});
