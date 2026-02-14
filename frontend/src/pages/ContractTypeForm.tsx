import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { contractTypeApi } from '../services/api.service';

const ContractTypeForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);

            try {
                if (isEditMode && id) {
                    const data = await contractTypeApi.getById(Number(id));
                    setName(data.name);
                }
            } catch (err: any) {
                console.error(err);
                toast.error(err.message || 'Erro ao carregar tipo de contrato.');
                navigate('/tipos-contrato');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [id, isEditMode, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || name.trim().length < 2) {
            toast.error('Informe um nome válido.');
            return;
        }

        setLoading(true);

        try {
            if (isEditMode && id) {
                await contractTypeApi.update(Number(id), { name });
                toast.success('Tipo de contrato atualizado com sucesso!');
            } else {
                await contractTypeApi.create({ name });
                toast.success('Tipo de contrato cadastrado com sucesso!');
            }

            navigate('/tipos-contrato');
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao salvar tipo de contrato.');
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
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                {isEditMode ? 'Editar tipo de contrato' : 'Novo tipo de contrato'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do tipo de contrato
                    </label>

                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: CLT, PJ, Estágio..."
                        required
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/tipos-contrato')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-medium"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContractTypeForm;
