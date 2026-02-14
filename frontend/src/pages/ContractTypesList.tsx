import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { contractTypeApi, ContractType } from '../services/api.service';

import { Pencil, Trash2, Plus } from 'lucide-react';

const ContractTypesList = () => {
    const [items, setItems] = useState<ContractType[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        setLoading(true);

        try {
            const data = await contractTypeApi.getAll();
            setItems(data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao carregar tipos de contrato.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDelete = async (id: number) => {
        const confirmDelete = confirm('Tem certeza que deseja excluir este tipo de contrato?');
        if (!confirmDelete) return;

        try {
            await contractTypeApi.delete(id);
            toast.success('Tipo de contrato excluído com sucesso!');
            fetchItems();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao excluir tipo de contrato.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Tipos de contrato</h1>

                <Link
                    to="/tipos-contrato/novo"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                >
                    <Plus size={18} />
                    Novo tipo
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
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
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                                    Nenhum tipo de contrato cadastrado.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/tipos-contrato/${item.id}`}
                                                className="flex items-center gap-2 px-3 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-sm"
                                            >
                                                <Pencil size={16} />
                                                Editar
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium text-sm"
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

export default ContractTypesList;
