import { Request, Response } from 'express';
import { TeamService } from '../services/team.service';

const teamService = new TeamService();

export const getTeams = async (req: Request, res: Response) => {
    try {
        const teams = await teamService.getAll();
        return res.json(teams);
    } catch (error) {
        console.error('Erro ao listar equipes:', error);
        return res.status(500).json({ message: 'Erro ao listar equipes' });
    }
};

export const getTeamById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const team = await teamService.getById(id);

        if (!team) {
            return res.status(404).json({ message: 'Equipe não encontrada' });
        }

        return res.json(team);
    } catch (error) {
        console.error('Erro ao buscar equipe:', error);
        return res.status(500).json({ message: 'Erro ao buscar equipe' });
    }
};

export const createTeam = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ message: 'Nome inválido' });
        }

        const newId = await teamService.create(name.trim());

        return res.status(201).json({
            message: 'Equipe cadastrada com sucesso',
            id: newId,
        });
    } catch (error: any) {
        console.error('Erro ao criar equipe:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'Já existe uma equipe com esse nome',
            });
        }

        return res.status(500).json({ message: 'Erro ao cadastrar equipe' });
    }
};

export const updateTeam = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { name } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ message: 'Nome inválido' });
        }

        const updated = await teamService.update(id, name.trim());

        if (!updated) {
            return res.status(404).json({ message: 'Equipe não encontrada' });
        }

        return res.json({ message: 'Equipe atualizada com sucesso' });
    } catch (error: any) {
        console.error('Erro ao atualizar equipe:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'Já existe uma equipe com esse nome',
            });
        }

        return res.status(500).json({ message: 'Erro ao atualizar equipe' });
    }
};

export const deleteTeam = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const deleted = await teamService.delete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Equipe não encontrada' });
        }

        return res.json({ message: 'Equipe removida com sucesso' });
    } catch (error: any) {
        console.error('Erro ao deletar equipe:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                message: 'Não é possível excluir esta equipe pois existem colaboradores vinculados.',
            });
        }

        return res.status(500).json({ message: 'Erro ao remover equipe' });
    }
};
