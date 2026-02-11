/**
 * Schemas de validação Zod para registros de ponto
 */

import { z } from 'zod';

export const createTimeRecordSchema = z.object({
    user_id: z.number().int().positive('ID do usuário inválido'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    entry_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário de entrada inválido').optional().nullable(),
    exit_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário de saída inválido').optional().nullable(),
    break_start: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário de início do intervalo inválido').optional().nullable(),
    break_end: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário de fim do intervalo inválido').optional().nullable(),
    adjustment_type: z.enum(['WORK', 'OVERTIME', 'COMPENSATORY', 'ABSENCE_JUSTIFIED', 'ABSENCE_UNJUSTIFIED', 'HOLIDAY', 'VACATION', 'MEDICAL_LEAVE']).default('WORK'),
    notes: z.string().max(500, 'Observação muito longa').optional().nullable()
});

export const approveRejectSchema = z.object({
    reason: z.string().max(500, 'Motivo muito longo').optional()
});

export const closeMonthlyBalanceSchema = z.object({
    user_id: z.number().int().positive('ID do usuário inválido').optional(),
    reference_date: z.string().regex(/^\d{4}-\d{2}-01$/, 'Data de referência deve estar no formato YYYY-MM-01')
});
