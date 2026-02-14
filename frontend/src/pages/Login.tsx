import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { authApi } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';

import { Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';

import logo from '/logo.png';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Tema do login (dark por padrão)
    const [isDark, setIsDark] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Informe o e-mail e a senha.');
            return;
        }

        setLoading(true);

        try {
            const data = await authApi.login(email, password);

            login(data.token, data.user);

            toast.success('Login realizado com sucesso!');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Erro ao realizar login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`relative min-h-screen flex items-center justify-center overflow-hidden ${isDark ? 'bg-[#050b18]' : 'bg-gray-100'
                }`}
        >
            {/* Glow no fundo */}
            <div className="absolute inset-0">
                <div
                    className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[160px] ${isDark ? 'bg-red-600/30' : 'bg-red-500/20'
                        }`}
                />
                <div
                    className={`absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[160px] ${isDark ? 'bg-blue-600/20' : 'bg-blue-500/15'
                        }`}
                />
            </div>

            {/* Marca d’água */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.10]">
                <img
                    src={logo}
                    alt="Wfibra"
                    className="w-[720px] h-[720px] object-contain"
                />
            </div>

            {/* Ondas (duas camadas) */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                <svg
                    viewBox="0 0 1440 320"
                    className="w-full h-[280px] opacity-45"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="#dc2626"
                        fillOpacity="0.95"
                        d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,250.7C672,267,768,277,864,256C960,235,1056,181,1152,154.7C1248,128,1344,128,1392,128L1440,128L1440,320L0,320Z"
                    />
                </svg>

                <svg
                    viewBox="0 0 1440 320"
                    className="w-full h-[240px] opacity-30 absolute bottom-0 left-0"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="#ffffff"
                        fillOpacity="0.14"
                        d="M0,224L48,213.3C96,203,192,181,288,160C384,139,480,117,576,133.3C672,149,768,203,864,208C960,213,1056,171,1152,154.7C1248,139,1344,149,1392,154.7L1440,160L1440,320L0,320Z"
                    />
                </svg>
            </div>

            {/* Card */}
            <div
                className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                    } backdrop-blur-xl animate-fadeIn`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white rounded-xl p-3 shadow-lg">
                            <img src={logo} alt="Wfibra" className="w-14 h-14 object-contain" />
                        </div>
                    </div>

                    <h1 className="text-white text-xl font-bold tracking-wide">
                        Gestão RH
                    </h1>

                    <p className="text-white/80 text-sm mt-1">
                        Acesso ao sistema corporativo
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {/* Top */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Entrar
                        </h2>

                        <button
                            onClick={() => setIsDark(!isDark)}
                            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition ${isDark
                                ? 'border-white/20 text-white hover:bg-white/10'
                                : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                                }`}
                            title="Alternar tema"
                        >
                            {isDark ? <Sun size={14} /> : <Moon size={14} />}
                            {isDark ? 'Claro' : 'Escuro'}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className={`block text-sm mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                E-mail
                            </label>

                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={18} />

                                <input
                                    type="email"
                                    placeholder="Digite seu e-mail"
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition ${isDark
                                        ? 'bg-black/30 border-white/10 text-white placeholder:text-white/40 focus:border-red-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-red-500'
                                        }`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className={`block text-sm mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                Senha
                            </label>

                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={18} />

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite sua senha"
                                    className={`password-input w-full pl-10 pr-12 py-3 rounded-lg border outline-none transition ${isDark
                                        ? 'bg-black/30 border-white/10 text-white placeholder:text-white/40 focus:border-red-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-red-500'
                                        }`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => toast.info('Solicite sua senha ao administrador do sistema.')}
                                className="text-sm text-red-400 hover:text-red-300 transition"
                            >
                                Esqueceu a senha?
                            </button>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>

                        {/* Footer */}
                        <p className={`text-xs text-center mt-4 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            Seu primeiro acesso? Solicite suas credenciais ao administrador.
                        </p>
                    </form>
                </div>
            </div>

            {/* Fade in animation */}
            <style>
                {`
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0px);
            }
          }
        `}
            </style>
        </div>
    );
};

export default Login;
