import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import ChangePasswordModal from './ChangePasswordModal';

import { useTheme } from '../hooks/useTheme';

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
    Moon
} from 'lucide-react';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const { theme, toggleTheme } = useTheme();

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
        <div className="flex min-h-screen bg-[#f3f3f3] dark:bg-slate-950 transition-colors">
            {/* Sidebar */}
            <aside
                className={`bg-slate-800 dark:bg-slate-900 text-white flex flex-col shadow-lg transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
                    }`}
            >
                <div className="p-4 border-b border-gray-700 dark:border-slate-700 flex items-center justify-between">
                    {!collapsed && (
                        <div className="text-left">
                            <h1 className="text-lg font-bold tracking-wide">Gestão RH</h1>
                            <p className="text-xs text-gray-400 mt-1">Gestão Inteligente</p>
                        </div>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded hover:bg-gray-700 dark:hover:bg-slate-700 transition-colors"
                        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-3">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            if (!canAccess(item.roles)) return null;

                            const isActive = location.pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        title={collapsed ? item.label : ''}
                                        className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <span className="opacity-90">{item.icon}</span>
                                        {!collapsed && (
                                            <span className="text-sm font-medium">{item.label}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-700 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shadow">
                            {user?.name?.charAt(0) || '?'}
                        </div>

                        {!collapsed && (
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-medium truncate">{user?.name}</p>

                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400 truncate">{user?.role}</p>

                                    <button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                        title="Alterar senha"
                                    >
                                        <KeyRound size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {collapsed && (
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                title="Alterar senha"
                            >
                                <KeyRound size={18} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={logout}
                        title={collapsed ? 'Sair' : ''}
                        className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white py-2 rounded text-sm transition-colors shadow"
                    >
                        <LogOut size={18} />
                        {!collapsed && <span>Sair</span>}
                    </button>
                </div>
            </aside>

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 transition-colors">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Home size={18} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-400">/</span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {breadcrumb}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Toggle Dark Mode */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
                        >
                            {theme === "dark" ? (
                                <Sun size={20} className="text-yellow-400" />
                            ) : (
                                <Moon size={20} className="text-gray-700" />
                            )}
                        </button>

                        {/* Notificações */}
                        <button
                            className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            title="Notificações"
                            onClick={() => toast.info('Nenhuma notificação no momento.')}
                        >
                            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Usuário */}
                        <div className="flex items-center gap-3">
                            <div className="text-right leading-tight hidden sm:block">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.role}
                                </p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0) || '?'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Página */}
                <main className="flex-1 p-8 overflow-auto text-gray-900 dark:text-gray-100 transition-colors">
                    <Outlet />
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
