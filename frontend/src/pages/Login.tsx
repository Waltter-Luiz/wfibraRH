import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { authApi } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error('Informe e-mail e senha.');
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.login(email, password);

            if (!response?.token || !response?.user) {
                toast.error('Resposta inválida do servidor.');
                return;
            }

            login(response.token, response.user);

            toast.success('Login realizado com sucesso!');
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);

            toast.error(err.message || 'Erro ao realizar login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] px-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                    Gestão RH
                </h1>

                <p className="text-gray-500 text-sm text-center mb-6">
                    Faça login para acessar o sistema
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            E-mail
                        </label>
                        <input
                            type="email"
                            placeholder="Digite seu e-mail"
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition disabled:opacity-60"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-6">
                    Wfibra RH © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default Login;
