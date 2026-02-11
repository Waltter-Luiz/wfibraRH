
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
    team_name: string;
    position_title: string;
    is_active: number;
}

const EmployeeList: React.FC = () => {
    const { token } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/employees?page=${page}&search=${search}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setEmployees(data.data);
            setTotalPages(data.meta.totalPages);
        } catch (error) {
            console.error('Erro ao buscar colaboradores', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [page, token]); // Reload when page changes

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page
        fetchEmployees();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja desativar este colaborador?')) return;

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchEmployees(); // Refresh list
        } catch (error) {
            alert('Erro ao desativar');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Colaboradores</h1>
                <Link to="/employees/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
                    + Novo Colaborador
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
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
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cargo</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">Carregando...</td></tr>
                        ) : employees.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Nenhum colaborador encontrado.</td></tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{emp.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                                    <td className="px-6 py-4 text-gray-500">{emp.position_title || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            {emp.team_name || 'Sem Time'}
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
                                        <Link to={`/employees/${emp.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
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

                {/* Pagination */}
                <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
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
