
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import ChangePasswordModal from './ChangePasswordModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', roles: ['EMPLOYEE', 'MANAGER', 'RH', 'DIRECTOR', 'ADMIN'] },
        { label: 'Colaboradores', path: '/employees', roles: ['ADMIN', 'RH', 'MANAGER', 'DIRECTOR'] },
        // { label: 'Times', path: '/teams', roles: ['ADMIN', 'RH', 'DIRECTOR'] },
        // { label: 'Banco de Horas', path: '/time-bank', roles: ['EMPLOYEE', 'MANAGER', 'RH', 'DIRECTOR', 'ADMIN'] },
    ];

    const canAccess = (roles: string[]) => {
        return user && roles.includes(user.role);
    };

    return (
        <div className="flex min-h-screen bg-[#f3f3f3]">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col">
                <div className="p-6 text-center border-b border-gray-700">
                    <h1 className="text-2xl font-bold">Gestão RH</h1>
                    <p className="text-xs text-gray-400 mt-1">Gestão Inteligente</p>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            canAccess(item.roles) && (
                                <li key={item.path}>
                                    <Link 
                                        to={item.path} 
                                        className={`block px-4 py-2 rounded transition-colors ${
                                            location.pathname === item.path 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            )
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-400 truncate">{user?.role}</p>
                                <button 
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="text-xs text-yellow-500 hover:text-yellow-400 ml-2"
                                    title="Alterar Senha"
                                >
                                    🔑
                                </button>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={logout} 
                        className="w-full bg-red-600/80 hover:bg-red-600 text-white py-2 rounded text-sm transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>

            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
};

export default Layout;
