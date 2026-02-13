import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { employeeApi, Employee } from '../services/api.service';

const EmployeeList = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await employeeApi.getAll(page, search);

            setEmployees(response.data || []);
            setTotalPages(response.meta?.totalPages || 1);
        } catch (err: any) {
            console.error(err);

            setEmployees([]);
            setTotalPages(1);

            setError(err.message || 'Erro ao buscar colaboradores.');
            toast.error(err.message || 'Erro ao buscar colaboradores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchEmployees();
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = confirm('Tem certeza que deseja desativar este colaborador?');
        if (!confirmDelete) return;

        try {
            await employeeApi.delete(id);
            toast.success('Colaborador desativado com sucesso!');
            fetchEmployees();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao desativar colaborador.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Colaboradores</h1>

                <Link
                    to="/colaboradores/novo"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                >
                    + Novo colaborador
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        className="flex-1 border rounded px-3 py-2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button type="submit" className="bg-slate-700 text-white px-4 py-2 rounded">
                        Buscar
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">E-mail</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cargo</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Equipe</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">
                                    Carregando...
                                </td>
                            </tr>
                        ) : employees.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    Nenhum colaborador encontrado.
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{emp.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                                    <td className="px-6 py-4 text-gray-500">{emp.position_title || '-'}</td>

                                    <td className="px-6 py-4 text-gray-500">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            {emp.team_name || 'Sem equipe'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        {emp.is_active ? (
                                            <span className="text-green-600 text-sm font-semibold">Ativo</span>
                                        ) : (
                                            <span className="text-red-500 text-sm">Inativo</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Link
                                            to={`/colaboradores/${emp.id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Editar
                                        </Link>

                                        {emp.is_active === 1 && (
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Desativar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                    >
                        Anterior
                    </button>

                    <span className="text-sm text-gray-600">
                        Página {page} de {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeList;
