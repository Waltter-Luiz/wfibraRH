
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const EmployeeForm: React.FC = () => {
    const { id } = useParams(); // If id exists, it's edit mode
    const isEditMode = !!id;
    const { token } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        team_id: '',
        position_id: '',
        contract_type_id: '',
        salary: '',
        admission_date: '',
        is_active: 1
    });

    const [options, setOptions] = useState({
        teams: [],
        positions: [],
        contractTypes: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch dropdown options
        const fetchOptions = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const [teamsRes, positionsRes, contractsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/options/teams`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/options/positions`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/options/contract-types`, { headers })
                ]);

                setOptions({
                    teams: await teamsRes.json(),
                    positions: await positionsRes.json(),
                    contractTypes: await contractsRes.json()
                });
            } catch (err) {
                console.error('Failed to load options', err);
            }
        };

        fetchOptions();

        // If Edit Mode, fetch employee data
        if (isEditMode) {
            const fetchEmployee = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();

                    // Format date for input type="date"
                    const date = data.admission_date ? new Date(data.admission_date).toISOString().split('T')[0] : '';

                    setFormData({
                        ...data,
                        admission_date: date,
                        password: '', // Don't show password
                        team_id: data.team_id || '',
                        position_id: data.position_id || '',
                        contract_type_id: data.contract_type_id || ''
                    });
                } catch (err) {
                    setError('Erro ao carregar dados do colaborador');
                }
            };
            fetchEmployee();
        }
    }, [id, token, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode
                ? `${import.meta.env.VITE_API_URL}/employees/${id}`
                : `${import.meta.env.VITE_API_URL}/employees`;

            const payload = { ...formData };
            if (isEditMode && !payload.password) delete (payload as any).password; // Don't send empty password on edit
            if (!payload.team_id) payload.team_id = null as any;
            if (!payload.position_id) payload.position_id = null as any;
            if (!payload.contract_type_id) payload.contract_type_id = null as any;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao salvar');
            }

            navigate('/employees');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Editar Colaborador' : 'Novo Colaborador'}</h1>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Personal Info */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Dados Pessoais</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input name="name" type="text" required className="w-full border rounded px-3 py-2" value={formData.name} onChange={handleChange} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
                    <input name="email" type="email" required className="w-full border rounded px-3 py-2" value={formData.email} onChange={handleChange} />
                </div>

                {!isEditMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha Inicial</label>
                        <input name="password" type="password" required={!isEditMode} className="w-full border rounded px-3 py-2" value={formData.password} onChange={handleChange} />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
                    <input name="admission_date" type="date" required className="w-full border rounded px-3 py-2" value={formData.admission_date} onChange={handleChange} />
                </div>

                {/* Contract Info */}
                <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Contrato e Função</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de Acesso</label>
                    <select name="role" className="w-full border rounded px-3 py-2" value={formData.role} onChange={handleChange}>
                        <option value="EMPLOYEE">Colaborador</option>
                        <option value="MANAGER">Gestor</option>
                        <option value="RH">RH</option>
                        <option value="DIRECTOR">Diretoria</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time / Setor</label>
                    <select name="team_id" className="w-full border rounded px-3 py-2" value={formData.team_id} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {options.teams.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                    <select name="position_id" className="w-full border rounded px-3 py-2" value={formData.position_id} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {options.positions.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de Contrato</label>
                    <select name="contract_type_id" className="w-full border rounded px-3 py-2" value={formData.contract_type_id} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {options.contractTypes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
                    <input name="salary" type="number" step="0.01" className="w-full border rounded px-3 py-2" value={formData.salary} onChange={handleChange} />
                </div>

                {isEditMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="is_active" className="w-full border rounded px-3 py-2" value={formData.is_active} onChange={handleChange as any}>
                            <option value={1}>Ativo</option>
                            <option value={0}>Inativo</option>
                        </select>
                    </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/employees')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Colaborador'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;
