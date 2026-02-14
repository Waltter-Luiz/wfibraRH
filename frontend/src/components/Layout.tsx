import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import ChangePasswordModal from './ChangePasswordModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';


import logo from '/logo.png';

import {
    LayoutDashboard,
    Users,
    LogOut,
    KeyRound,
    ChevronLeft,
    ChevronRight,
    Bell,
    Home,
    Sun,
    Moon,
    Rows,
    Building2,
    Briefcase,
    FileSignature
} from 'lucide-react';

/**
 * Tooltip simples e elegante (sem libs externas)
 */
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
    return (
        <div className="relative group flex justify-center">
            {children}

            <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1 transition-all duration-200 z-50">
                <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-md shadow-lg whitespace-nowrap">
                    {text}
                </div>

                {/* Setinha */}
                <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-black/80" />
            </div>
        </div>
    );
};

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const { theme, toggleTheme } = useTheme();

    const [compactMode, setCompactMode] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('compactMode');
        if (stored === 'true') {
            setCompactMode(true);
            document.documentElement.classList.add('compact');
        }
    }, []);

    const toggleCompactMode = () => {
        const newValue = !compactMode;
        setCompactMode(newValue);

        localStorage.setItem('compactMode', String(newValue));

        if (newValue) {
            document.documentElement.classList.add('compact');
            toast.info('Modo compacto ativado');
        } else {
            document.documentElement.classList.remove('compact');
            toast.info('Modo compacto desativado');
        }
    };

    const menuItems = [
        {
            label: 'Painel',
            path: '/dashboard',
            icon: <LayoutDashboard size={20} />,
            roles: ['EMPLOYEE', 'MANAGER', 'RH', 'DIRECTOR', 'ADMIN'],
        },
        {
            label: 'Colaboradores',
            path: '/colaboradores',
            icon: <Users size={20} />,
            roles: ['ADMIN', 'RH', 'MANAGER', 'DIRECTOR'],
        },
        {
            label: 'Equipes',
            path: '/equipes',
            roles: ['ADMIN', 'RH', 'DIRECTOR'],
            icon: <Building2 size={18} />,
        },
        {
            label: 'Cargos',
            path: '/cargos',
            roles: ['ADMIN', 'RH', 'DIRECTOR'],
            icon: <Briefcase size={18} />
        },
        {
            label: 'Tipos de contrato',
            path: '/tipos-contrato',
            roles: ['ADMIN', 'RH'],
            icon: <FileSignature size={18} />
        },

    ];

    const canAccess = (roles: string[]) => {
        return user && roles.includes(user.role);
    };

    const breadcrumb = useMemo(() => {
        const pathname = location.pathname;

        const map: Record<string, string> = {
            '/dashboard': 'Painel',
            '/colaboradores': 'Colaboradores',
            '/colaboradores/novo': 'Novo colaborador',
        };

        if (pathname.startsWith('/colaboradores/') && pathname !== '/colaboradores/novo') {
            return 'Editar colaborador';
        }

        return map[pathname] || 'Página';
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-[#f3f3f3] dark:bg-slate-950 transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`relative bg-slate-800 dark:bg-slate-900 text-white flex flex-col shadow-lg
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}`}
            >
                {/* Header Sidebar */}
                <div className="h-16 px-4 border-b border-gray-700 dark:border-slate-700 flex items-center justify-between">
                    {/* Logo + Nome (fade + slide) */}
                    <div
                        className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out ${collapsed
                            ? 'opacity-0 translate-x-[-10px] w-0'
                            : 'opacity-100 translate-x-0 w-full'
                            }`}
                    >
                        {/* LOGO MAIOR e com destaque */}
                        <div className="w-16 h-16 flex items-center justify-center shadow-md">
                            <img
                                src={logo}
                                alt="Wfibra"
                                className="w-16 h-16 object-contain"
                            />
                        </div>

                        {/* Labels menores */}
                        <div className="leading-tight">
                            <h1 className="text-sm font-semibold tracking-wide text-white">
                                Gestão RH
                            </h1>
                            <p className="text-[11px] text-gray-300 mt-1">Wfibra</p>
                        </div>
                    </div>

                    {/* Botão recolher */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-600 hover:bg-gray-700 dark:hover:bg-slate-700 transition-colors"
                        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-3">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            if (!canAccess(item.roles)) return null;

                            const isActive =
                                location.pathname === item.path ||
                                location.pathname.startsWith(item.path + '/');

                            const linkElement = (
                                <Link
                                    to={item.path}
                                    className={`flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'
                                        } py-3 rounded-lg transition-all duration-200 ease-in-out ${isActive
                                            ? 'bg-red-600 text-white shadow'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <span className="opacity-90">{item.icon}</span>

                                    <span
                                        className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${collapsed
                                            ? 'opacity-0 -translate-x-2 w-0 overflow-hidden'
                                            : 'opacity-100 translate-x-0 w-auto'
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );

                            return (
                                <li key={item.path}>
                                    {collapsed ? (
                                        <Tooltip text={item.label}>{linkElement}</Tooltip>
                                    ) : (
                                        linkElement
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 dark:border-slate-700">
                    {/* Quando expandido */}
                    {!collapsed ? (
                        <div className="flex items-center gap-3 mb-4 transition-all duration-300 ease-in-out">
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold shadow">
                                {user?.name?.charAt(0) || '?'}
                            </div>

                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-medium truncate">{user?.name}</p>

                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-xs font-medium mt-1"
                                    title="Trocar senha"
                                >
                                    <KeyRound size={16} />
                                    <span>Trocar senha</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Quando colapsado (somente chave)
                        <div className="flex justify-center mb-4">
                            <Tooltip text="Trocar senha">
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-700 transition-colors text-yellow-400 hover:text-yellow-300"
                                >
                                    <KeyRound size={18} />
                                </button>
                            </Tooltip>
                        </div>
                    )}

                    {/* Botão sair */}
                    {collapsed ? (
                        <Tooltip text="Sair">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center bg-red-600/80 hover:bg-red-600 text-white py-2 rounded-lg text-sm transition-all duration-200 shadow"
                            >
                                <LogOut size={18} />
                            </button>
                        </Tooltip>
                    ) : (
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white py-2 rounded-lg text-sm transition-all duration-200 shadow"
                        >
                            <LogOut size={18} />
                            <span>Sair</span>
                        </button>
                    )}
                </div>
            </aside>

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 transition-colors duration-300">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Home size={18} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-400">/</span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {breadcrumb}
                        </span>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                        {/* Compact mode */}
                        <button
                            onClick={toggleCompactMode}
                            className={`p-2 rounded-lg transition-colors ${compactMode
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                            title="Modo compacto"
                        >
                            <Rows size={20} />
                        </button>

                        {/* Toggle Dark Mode */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                        >
                            {theme === 'dark' ? (
                                <Sun size={20} className="text-yellow-400" />
                            ) : (
                                <Moon size={20} className="text-gray-700 dark:text-gray-200" />
                            )}
                        </button>

                        {/* Notificações */}
                        <button
                            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            title="Notificações"
                            onClick={() => toast.info('Nenhuma notificação no momento.')}
                        >
                            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Usuário */}
                        <div className="flex items-center gap-3 ml-2">
                            <div className="text-right leading-tight hidden sm:block">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {user?.name}
                                </p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0) || '?'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Página */}
                <main className="flex-1 p-8 overflow-auto text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    <div className="animate-fadeIn">
                        <Outlet />
                    </div>
                </main>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};

export default Layout;
