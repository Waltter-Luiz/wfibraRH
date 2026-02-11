import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import { PrivateRoute } from './components/PrivateRoute';
import ChangePasswordModal from './components/ChangePasswordModal';
import Layout from './components/Layout';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';

const Dashboard = () => {
    const { user } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                {/* <div className="flex gap-2">
                    Button removed as requested. Moved to Sidebar/Profile.
                </div> */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Total Colaboradores</h3>
                    <p className="text-3xl font-bold text-gray-800">12</p> {/* Mock data for now */}
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Equipes Ativas</h3>
                    <p className="text-3xl font-bold text-gray-800">4</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Solicitações Pendentes</h3>
                    <p className="text-3xl font-bold text-gray-800">3</p>
                </div>
            </div>

            <p className="text-gray-600">Bem-vindo ao sistema Wfibra RH. Utilize o menu lateral para navegar.</p>
            
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <Layout>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/employees" element={<EmployeeList />} />
                        <Route path="/employees/new" element={<EmployeeForm />} />
                        <Route path="/employees/:id" element={<EmployeeForm />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Layout>
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
