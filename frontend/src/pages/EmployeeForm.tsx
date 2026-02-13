import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { employeeApi, optionsApi } from '../services/api.service';

const EmployeeForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;

    const navigate = useNavigate();

    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        team_id: '',
        position_id: '',
        contract_type_id: '',
        salary: '',
        admission_date: '',
        is_active: 1,
    });

    const [options, setOptions] = useState({
        teams: [] as any[],
        positions: [] as any[],
        contractTypes: [] as any[],
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoadingData(true);

            try {
                const [teams, positions, contractTypes] = await Promise.all([
                    optionsApi.getTeams(),
                    optionsApi.getPositions(),
                    optionsApi.getContractTypes(),
                ]);

                setOptions({
                    teams,
                    positions,
                    contractTypes,
                });

                if (isEditMode && id) {
                    const employee = await employeeApi.getById(Number(id));

                    const admissionDate = employee.admission_date
                        ? new Date(employee.admission_date).toISOString().split('T')[0]
                        : '';

                    setFormData({
                        ...employee,
                        admission_date: admissionDate,
                        password: '',
                        team_id: employee.team_id ?? '',
                        position_id: employee.position_id ?? '',
                        contract_type_id: employee.contract_type_id ?? '',
                    });
                }
            } catch (err: any) {
                console.error(err);
                toast.error(err.message || 'Erro ao carregar dados do formulário.');
            } finally {
                setLoadingData(false);
            }
        };

        fetchAll();
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        try {
            const payload: any = { ...formData };

            if (isEditMode && !payload.password) {
                delete payload.password;
            }

            payload.team_id = payload.team_id || null;
            payload.position_id = payload.position_id || null;
            payload.contract_type_id = payload.contract_type_id || null;

            if (isEditMode && id) {
                await employeeApi.update(Number(id), payload);
                toast.success('Colaborador atualizado com sucesso!');
            } else {
                await employeeApi.create(payload);
                toast.success('Colaborador cadastrado com sucesso!');
            }

            navigate('/colaboradores');
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao salvar colaborador.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[300px] text-gray-600">
                Carregando...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                {isEditMode ? 'Editar colaborador' : 'Novo colaborador'}
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Dados pessoais</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="w-full border rounded px-3 py-2"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail corporativo</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full border rounded px-3 py-2"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                {!isEditMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha inicial</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full border rounded px-3 py-2"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de admissão</label>
                    <input
                        name="admission_date"
                        type="date"
                        required
                        className="w-full border rounded px-3 py-2"
                        value={formData.admission_date}
                        onChange={handleChange}
                    />
                </div>

                <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Contrato e função</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de acesso</label>
                    <select
                        name="role"
                        className="w-full border rounded px-3 py-2"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="EMPLOYEE">Colaborador</option>
                        <option value="MANAGER">Gestor</option>
                        <option value="RH">RH</option>
                        <option value="DIRECTOR">Diretoria</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipe / Setor</label>
                    <select
                        name="team_id"
                        className="w-full border rounded px-3 py-2"
                        value={formData.team_id}
                        onChange={handleChange}
                    >
                        <option value="">Selecione...</option>
                        {options.teams.map((t: any) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                    <select
                        name="position_id"
                        className="w-full border rounded px-3 py-2"
                        value={formData.position_id}
                        onChange={handleChange}
                    >
                        <option value="">Selecione...</option>
                        {options.positions.map((p: any) => (
                            <option key={p.id} value={p.id}>
                                {p.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de contrato</label>
                    <select
                        name="contract_type_id"
                        className="w-full border rounded px-3 py-2"
                        value={formData.contract_type_id}
                        onChange={handleChange}
                    >
                        <option value="">Selecione...</option>
                        {options.contractTypes.map((c: any) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salário base (R$)</label>
                    <input
                        name="salary"
                        type="number"
                        step="0.01"
                        className="w-full border rounded px-3 py-2"
                        value={formData.salary}
                        onChange={handleChange}
                    />
                </div>

                {isEditMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="is_active"
                            className="w-full border rounded px-3 py-2"
                            value={formData.is_active}
                            onChange={handleChange as any}
                        >
                            <option value={1}>Ativo</option>
                            <option value={0}>Inativo</option>
                        </select>
                    </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/colaboradores')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-medium"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar colaborador'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;
