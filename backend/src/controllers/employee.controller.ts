
import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';

const employeeService = new EmployeeService();

export const getEmployees = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';

        const result = await employeeService.getEmployees(page, limit, search);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao listar colaboradores' });
    }
};

export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const employee = await employeeService.getEmployeeById(id);
        
        if (!employee) {
            return res.status(404).json({ message: 'Colaborador não encontrado' });
        }
        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar colaborador' });
    }
};

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const newEmployee = await employeeService.createEmployee(req.body);
        res.status(201).json(newEmployee);
    } catch (error: any) {
        console.error(error);
        if (error.message === 'Email já cadastrado') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro ao criar colaborador' });
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const updated = await employeeService.updateEmployee(id, req.body);
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar colaborador' });
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await employeeService.deleteEmployee(id);
        res.json({ message: 'Colaborador desativado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao desativar colaborador' });
    }
};
