/**
 * Controller para dashboards e relatórios
 */

import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export const getMyBalance = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const balance = await dashboardService.getEmployeeTotalBalance(userId);
        res.json(balance);
    } catch (error: any) {
        console.error('Erro ao buscar saldo:', error);
        res.status(500).json({ message: 'Erro ao buscar saldo', error: error.message });
    }
};

export const getEmployeeBalance = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const balance = await dashboardService.getEmployeeTotalBalance(userId);
        res.json(balance);
    } catch (error: any) {
        console.error('Erro ao buscar saldo:', error);
        res.status(500).json({ message: 'Erro ao buscar saldo', error: error.message });
    }
};

export const getMyEvolution = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const limit = parseInt(req.query.limit as string) || 12;
        const evolution = await dashboardService.getMonthlyEvolution(userId, limit);
        res.json(evolution);
    } catch (error: any) {
        console.error('Erro ao buscar evolução:', error);
        res.status(500).json({ message: 'Erro ao buscar evolução', error: error.message });
    }
};

export const getEmployeeEvolution = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const limit = parseInt(req.query.limit as string) || 12;
        const evolution = await dashboardService.getMonthlyEvolution(userId, limit);
        res.json(evolution);
    } catch (error: any) {
        console.error('Erro ao buscar evolução:', error);
        res.status(500).json({ message: 'Erro ao buscar evolução', error: error.message });
    }
};

export const getTeamSummary = async (req: Request, res: Response) => {
    try {
        const teamId = parseInt(req.params.teamId);
        const summary = await dashboardService.getTeamSummary(teamId);
        res.json(summary);
    } catch (error: any) {
        console.error('Erro ao buscar resumo da equipe:', error);
        res.status(500).json({ message: 'Erro ao buscar resumo da equipe', error: error.message });
    }
};

export const getDirectorDashboard = async (req: Request, res: Response) => {
    try {
        const dashboard = await dashboardService.getDirectorDashboard();
        res.json(dashboard);
    } catch (error: any) {
        console.error('Erro ao buscar dashboard da diretoria:', error);
        res.status(500).json({ message: 'Erro ao buscar dashboard da diretoria', error: error.message });
    }
};

export const getManagerDashboard = async (req: Request, res: Response) => {
    try {
        const managerId = (req as any).user.id;
        const dashboard = await dashboardService.getManagerDashboard(managerId);
        res.json(dashboard);
    } catch (error: any) {
        console.error('Erro ao buscar dashboard do gestor:', error);
        res.status(500).json({ message: 'Erro ao buscar dashboard do gestor', error: error.message });
    }
};

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

        const logs = await dashboardService.getAuditLogs(limit, userId);
        res.json(logs);
    } catch (error: any) {
        console.error('Erro ao buscar logs de auditoria:', error);
        res.status(500).json({ message: 'Erro ao buscar logs de auditoria', error: error.message });
    }
};
