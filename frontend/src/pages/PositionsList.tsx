import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Pencil, Trash2 } from 'lucide-react';

import { positionApi, Position } from '../services/api.service';

const PositionsList = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPositions = async () => {
        setLoading(true);

        try {
            const data = await positionApi.getAll();
            setPositions(data || []);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao carregar cargos.');
            setPositions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    const handleDelete = async (id: number) => {
        const confirmDelete = confirm('Tem certeza que deseja excluir este cargo?');
        if (!confirmDelete) return;

        try {
            await positionApi.delete(id);
            toast.success('Cargo excluído com sucesso!');
            fetchPositions();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao excluir cargo.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Cargos</h1>

                <Link
                    to="/cargos/novo"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
                >
                    + Novo cargo
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                Cargo
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
                        ) : positions.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                                    Nenhum cargo encontrado.
                                </td>
                            </tr>
                        ) : (
                            positions.map((pos) => (
                                <tr key={pos.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {pos.title}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/cargos/${pos.id}`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                                   bg-blue-50 text-blue-700 border border-blue-200
                                   hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                                                title="Editar cargo"
                                            >
                                                <Pencil size={16} />
                                                Editar
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(pos.id)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                                   bg-red-50 text-red-700 border border-red-200
                                   hover:bg-red-100 hover:border-red-300 transition-all shadow-sm hover:shadow-md"
                                                title="Excluir cargo"
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

export default PositionsList;
