import { useState } from 'react';
import { toast } from 'react-toastify';

import { authApi } from '../services/api.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: Props) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            toast.error('Preencha todos os campos.');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('A confirmação da senha não confere.');
            return;
        }

        setLoading(true);

        try {
            await authApi.changePassword(currentPassword, newPassword);

            toast.success('Senha alterada com sucesso!');
            resetForm();
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Erro ao alterar senha.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Alterar senha</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Informe sua senha atual e defina uma nova senha.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Senha atual
                        </label>
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nova senha
                        </label>
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar nova senha
                        </label>
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded font-medium"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
