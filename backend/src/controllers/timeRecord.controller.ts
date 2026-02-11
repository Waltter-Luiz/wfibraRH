/**
 * Controller para gerenciamento de registros de ponto
 */

import { Request, Response } from 'express';
import { TimeRecordService } from '../services/timeRecord.service';

const timeRecordService = new TimeRecordService();

export const createTimeRecord = async (req: Request, res: Response) => {
    try {
        const newRecord = await timeRecordService.createTimeRecord(req.body);
        res.status(201).json(newRecord);
    } catch (error: any) {
        console.error('Erro ao criar registro de ponto:', error);
        res.status(500).json({ message: 'Erro ao criar registro de ponto', error: error.message });
    }
};

export const approveTimeRecord = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const approvedByUserId = (req as any).user.id;

        await timeRecordService.approveTimeRecord(id, approvedByUserId);
        res.json({ message: 'Registro aprovado com sucesso' });
    } catch (error: any) {
        console.error('Erro ao aprovar registro:', error);
        res.status(500).json({ message: 'Erro ao aprovar registro', error: error.message });
    }
};

export const rejectTimeRecord = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const approvedByUserId = (req as any).user.id;
        const { reason } = req.body;

        await timeRecordService.rejectTimeRecord(id, approvedByUserId, reason);
        res.json({ message: 'Registro rejeitado com sucesso' });
    } catch (error: any) {
        console.error('Erro ao rejeitar registro:', error);
        res.status(500).json({ message: 'Erro ao rejeitar registro', error: error.message });
    }
};

export const getMyTimeRecords = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const month = req.query.month as string;

        const records = await timeRecordService.getTimeRecordsByUser(userId, month);
        res.json(records);
    } catch (error: any) {
        console.error('Erro ao buscar registros:', error);
        res.status(500).json({ message: 'Erro ao buscar registros', error: error.message });
    }
};

export const getEmployeeTimeRecords = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const month = req.query.month as string;

        const records = await timeRecordService.getTimeRecordsByUser(userId, month);
        res.json(records);
    } catch (error: any) {
        console.error('Erro ao buscar registros:', error);
        res.status(500).json({ message: 'Erro ao buscar registros', error: error.message });
    }
};

export const getPendingApprovals = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        let records;
        if (user.role === 'MANAGER') {
            records = await timeRecordService.getPendingApprovals(user.id);
        } else {
            // RH e ADMIN veem todas as aprovações pendentes
            records = await timeRecordService.getAllPendingApprovals();
        }

        res.json(records);
    } catch (error: any) {
        console.error('Erro ao buscar aprovações pendentes:', error);
        res.status(500).json({ message: 'Erro ao buscar aprovações pendentes', error: error.message });
    }
};

export const closeMonthlyBalance = async (req: Request, res: Response) => {
    try {
        const { user_id, reference_date } = req.body;

        if (user_id) {
            // Fechar para um usuário específico
            await timeRecordService.closeMonthlyBalance(user_id, reference_date);
            res.json({ message: 'Saldo mensal fechado com sucesso' });
        } else {
            // Fechar para todos os usuários
            const result = await timeRecordService.closeAllMonthlyBalances(reference_date);
            res.json({
                message: 'Saldos mensais fechados com sucesso',
                processed: result.processed
            });
        }
    } catch (error: any) {
        console.error('Erro ao fechar saldo mensal:', error);
        res.status(500).json({ message: 'Erro ao fechar saldo mensal', error: error.message });
    }
};
