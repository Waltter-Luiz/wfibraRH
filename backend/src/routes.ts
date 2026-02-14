
import { Router } from 'express';
import { login, changePassword, refreshToken } from './controllers/auth.controller';
import { authenticateToken, requireRole } from './middlewares/auth.middleware';
import { validate } from './middlewares/validate.middleware';
import { loginLimiter } from './middlewares/rateLimiter.middleware';

import {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from './controllers/employee.controller';
import {
    createTimeRecord,
    approveTimeRecord,
    rejectTimeRecord,
    getMyTimeRecords,
    getEmployeeTimeRecords,
    getPendingApprovals,
    closeMonthlyBalance
} from './controllers/timeRecord.controller';
import {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
} from './controllers/team.controller';
import {
    getPositions,
    getPositionById,
    createPosition,
    updatePosition,
    deletePosition
} from './controllers/position.controller';
import {
    getContractTypes,
    getContractTypeById,
    createContractType,
    updateContractType,
    deleteContractType
} from './controllers/contractType.controller';

import {
    getMyBalance,
    getEmployeeBalance,
    getMyEvolution,
    getEmployeeEvolution,
    getTeamSummary,
    getDirectorDashboard,
    getManagerDashboard,
    getAuditLogs
} from './controllers/dashboard.controller';

import { loginSchema, changePasswordSchema, refreshTokenSchema } from './schemas/auth.schema';
import { createEmployeeSchema, updateEmployeeSchema } from './schemas/employee.schema';
import { createTimeRecordSchema, approveRejectSchema, closeMonthlyBalanceSchema } from './schemas/timeRecord.schema';
import { pool } from './config/database';

const router = Router();

// --- Auth Routes ---
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/change-password', authenticateToken, validate(changePasswordSchema), changePassword);
router.get('/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
});

// --- Employee Routes ---
router.get('/employees', authenticateToken, requireRole(['ADMIN', 'RH', 'MANAGER', 'DIRECTOR']), getEmployees);
router.get('/employees/:id', authenticateToken, requireRole(['ADMIN', 'RH']), getEmployeeById);
router.post('/employees', authenticateToken, requireRole(['ADMIN', 'RH']), validate(createEmployeeSchema), createEmployee);
router.put('/employees/:id', authenticateToken, requireRole(['ADMIN', 'RH']), validate(updateEmployeeSchema), updateEmployee);
router.delete('/employees/:id', authenticateToken, requireRole(['ADMIN', 'RH']), deleteEmployee);

// --- Time Records Routes ---
router.post('/time-records', authenticateToken, requireRole(['EMPLOYEE', 'MANAGER', 'RH', 'ADMIN']), validate(createTimeRecordSchema), createTimeRecord);
router.get('/time-records/my', authenticateToken, getMyTimeRecords);
router.get('/time-records/employee/:userId', authenticateToken, requireRole(['MANAGER', 'RH', 'ADMIN']), getEmployeeTimeRecords);
router.get('/time-records/pending', authenticateToken, requireRole(['MANAGER', 'RH', 'ADMIN']), getPendingApprovals);
router.put('/time-records/:id/approve', authenticateToken, requireRole(['MANAGER', 'RH', 'ADMIN']), approveTimeRecord);
router.put('/time-records/:id/reject', authenticateToken, requireRole(['MANAGER', 'RH', 'ADMIN']), validate(approveRejectSchema), rejectTimeRecord);
router.post('/time-records/close-monthly', authenticateToken, requireRole(['RH', 'ADMIN']), validate(closeMonthlyBalanceSchema), closeMonthlyBalance);

// --- Dashboard Routes ---
router.get('/dashboard/my-balance', authenticateToken, getMyBalance);
router.get('/dashboard/my-evolution', authenticateToken, getMyEvolution);
router.get('/dashboard/employee/:userId/balance', authenticateToken, requireRole(['MANAGER', 'RH', 'DIRECTOR', 'ADMIN']), getEmployeeBalance);
router.get('/dashboard/employee/:userId/evolution', authenticateToken, requireRole(['MANAGER', 'RH', 'DIRECTOR', 'ADMIN']), getEmployeeEvolution);
router.get('/dashboard/team/:teamId', authenticateToken, requireRole(['MANAGER', 'RH', 'DIRECTOR', 'ADMIN']), getTeamSummary);
router.get('/dashboard/director', authenticateToken, requireRole(['DIRECTOR', 'ADMIN']), getDirectorDashboard);
router.get('/dashboard/manager', authenticateToken, requireRole(['MANAGER', 'ADMIN']), getManagerDashboard);
router.get('/dashboard/audit-logs', authenticateToken, requireRole(['RH', 'DIRECTOR', 'ADMIN']), getAuditLogs);

// --- Teams Routes ---
router.get('/teams', authenticateToken, requireRole(['ADMIN', 'RH']), getTeams);
router.get('/teams/:id', authenticateToken, requireRole(['ADMIN', 'RH']), getTeamById);
router.post('/teams', authenticateToken, requireRole(['ADMIN', 'RH']), createTeam);
router.put('/teams/:id', authenticateToken, requireRole(['ADMIN', 'RH']), updateTeam);
router.delete('/teams/:id', authenticateToken, requireRole(['ADMIN', 'RH']), deleteTeam);

// --- Positions Routes ---
router.get('/positions', authenticateToken, requireRole(['ADMIN', 'RH']), getPositions);
router.get('/positions/:id', authenticateToken, requireRole(['ADMIN', 'RH']), getPositionById);
router.post('/positions', authenticateToken, requireRole(['ADMIN', 'RH']), createPosition);
router.put('/positions/:id', authenticateToken, requireRole(['ADMIN', 'RH']), updatePosition);
router.delete('/positions/:id', authenticateToken, requireRole(['ADMIN', 'RH']), deletePosition);

// --- Contract Types Routes ---
router.get('/contract-types', authenticateToken, requireRole(['ADMIN', 'RH']), getContractTypes);
router.get('/contract-types/:id', authenticateToken, requireRole(['ADMIN', 'RH']), getContractTypeById);
router.post('/contract-types', authenticateToken, requireRole(['ADMIN', 'RH']), createContractType);
router.put('/contract-types/:id', authenticateToken, requireRole(['ADMIN', 'RH']), updateContractType);
router.delete('/contract-types/:id', authenticateToken, requireRole(['ADMIN', 'RH']), deleteContractType);




// --- Options Routes (for dropdowns) ---
router.get('/options/teams', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT id, name FROM teams ORDER BY name');
        res.json(rows);
    } finally {
        connection.release();
    }
});

router.get('/options/positions', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT id, title FROM positions ORDER BY title');
        res.json(rows);
    } finally {
        connection.release();
    }
});

router.get('/options/contract-types', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT id, name FROM contract_types ORDER BY name');
        res.json(rows);
    } finally {
        connection.release();
    }
});

export default router;
