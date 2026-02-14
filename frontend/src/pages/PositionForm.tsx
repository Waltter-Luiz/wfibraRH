import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { positionApi } from '../services/api.service';

const PositionForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;

    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchPosition = async () => {
            if (!isEditMode) {
                setLoadingData(false);
                return;
            }

            try {
                const position = await positionApi.getById(Number(id));
                setTitle(position.title);
            } catch (err: any) {
                console.error(err);
                toast.error(err.message || 'Erro ao carregar cargo.');
                navigate('/cargos');
            } finally {
                setLoadingData(false);
            }
        };

        fetchPosition();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('O nome do cargo é obrigatório.');
            return;
        }

        setLoading(true);

        try {
            if (isEditMode && id) {
                await positionApi.update(Number(id), { title });
                toast.success('Cargo atualizado com sucesso!');
            } else {
                await positionApi.create({ title });
                toast.success('Cargo cadastrado com sucesso!');
            }

            navigate('/cargos');
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao salvar cargo.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[250px] text-gray-600">
                Carregando...
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                {isEditMode ? 'Editar cargo' : 'Novo cargo'}
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md space-y-6"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do cargo
                    </label>

                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Supervisor"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/cargos')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-medium"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar cargo'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PositionForm;
