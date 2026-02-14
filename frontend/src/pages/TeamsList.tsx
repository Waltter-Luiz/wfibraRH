import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Pencil, Trash2 } from 'lucide-react';

import { teamApi, Team } from '../services/api.service';

const TeamsList = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTeams = async () => {
        setLoading(true);

        try {
            const data = await teamApi.getAll();
            setTeams(data || []);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao carregar equipes.');
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleDelete = async (id: number) => {
        const confirmDelete = confirm('Tem certeza que deseja excluir esta equipe?');
        if (!confirmDelete) return;

        try {
            await teamApi.delete(id);
            toast.success('Equipe excluída com sucesso!');
            fetchTeams();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao excluir equipe.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Equipes</h1>

                <Link
                    to="/equipes/nova"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
                >
                    + Nova equipe
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                Nome da equipe
                            </th>

                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">
                                Ações
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-center">
                                    Carregando...
                                </td>
                            </tr>
                        ) : teams.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                                    Nenhuma equipe encontrada.
                                </td>
                            </tr>
                        ) : (
                            teams.map((team) => (
                                <tr key={team.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {team.name}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/equipes/${team.id}`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                                   bg-blue-50 text-blue-700 border border-blue-200
                                   hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                                                title="Editar equipe"
                                            >
                                                <Pencil size={16} />
                                                Editar
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(team.id)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                                   bg-red-50 text-red-700 border border-red-200
                                   hover:bg-red-100 hover:border-red-300 transition-all shadow-sm hover:shadow-md"
                                                title="Excluir equipe"
                                            >
                                                <Trash2 size={16} />
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamsList;
