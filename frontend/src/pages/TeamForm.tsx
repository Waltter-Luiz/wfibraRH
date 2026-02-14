import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { teamApi } from '../services/api.service';

const TeamForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            if (!isEditMode) {
                setLoadingData(false);
                return;
            }

            try {
                const team = await teamApi.getById(Number(id));
                setName(team.name);
            } catch (err: any) {
                console.error(err);
                toast.error(err.message || 'Erro ao carregar equipe.');
                navigate('/equipes');
            } finally {
                setLoadingData(false);
            }
        };

        fetchTeam();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('O nome da equipe é obrigatório.');
            return;
        }

        setLoading(true);

        try {
            if (isEditMode && id) {
                await teamApi.update(Number(id), { name });
                toast.success('Equipe atualizada com sucesso!');
            } else {
                await teamApi.create({ name });
                toast.success('Equipe cadastrada com sucesso!');
            }

            navigate('/equipes');
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao salvar equipe.');
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
                {isEditMode ? 'Editar equipe' : 'Nova equipe'}
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md space-y-6"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da equipe
                    </label>

                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Comercial"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/equipes')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-medium"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar equipe'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeamForm;
