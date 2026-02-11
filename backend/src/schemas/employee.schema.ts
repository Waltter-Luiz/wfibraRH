/**
 * Schemas de validação Zod para funcionários
 */

import { z } from 'zod';

export const createEmployeeSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
    role: z.enum(['EMPLOYEE', 'MANAGER', 'RH', 'DIRECTOR', 'ADMIN']).default('EMPLOYEE'),
    team_id: z.number().int().positive().optional().nullable(),
    position_id: z.number().int().positive().optional().nullable(),
    contract_type_id: z.number().int().positive().optional().nullable(),
    manager_id: z.number().int().positive().optional().nullable(),
    salary: z.number().min(0, 'Salário deve ser positivo').optional().nullable(),
    admission_date: z.string().optional().nullable()
});

export const updateEmployeeSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
    email: z.string().email('Email inválido').optional(),
    role: z.enum(['EMPLOYEE', 'MANAGER', 'RH', 'DIRECTOR', 'ADMIN']).optional(),
    team_id: z.number().int().positive().optional().nullable(),
    position_id: z.number().int().positive().optional().nullable(),
    contract_type_id: z.number().int().positive().optional().nullable(),
    manager_id: z.number().int().positive().optional().nullable(),
    salary: z.number().min(0, 'Salário deve ser positivo').optional().nullable(),
    admission_date: z.string().optional().nullable(),
    is_active: z.boolean().optional()
});
