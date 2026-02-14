import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import { PrivateRoute } from './components/PrivateRoute';
import Layout from './components/Layout';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import TeamsList from './pages/TeamsList';
import TeamForm from './pages/TeamForm';
import PositionsList from './pages/PositionsList';
import PositionForm from './pages/PositionForm';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContractTypesList from './pages/ContractTypesList';
import ContractTypeForm from './pages/ContractTypeForm';


const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Painel</h1>
      <p className="text-gray-600">
        Bem-vindo ao sistema Wfibra RH. Utilize o menu lateral para navegar.
      </p>
    </div>
  );
};

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Rota inicial */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="colaboradores" element={<EmployeeList />} />
            <Route path="colaboradores/novo" element={<EmployeeForm />} />
            <Route path="colaboradores/:id" element={<EmployeeForm />} />
            <Route path="equipes" element={<TeamsList />} />
            <Route path="equipes/nova" element={<TeamForm />} />
            <Route path="equipes/:id" element={<TeamForm />} />
            <Route path="cargos" element={<PositionsList />} />
            <Route path="cargos/novo" element={<PositionForm />} />
            <Route path="cargos/:id" element={<PositionForm />} />
            <Route path="tipos-contrato" element={<ContractTypesList />} />
            <Route path="tipos-contrato/novo" element={<ContractTypeForm />} />
            <Route path="tipos-contrato/:id" element={<ContractTypeForm />} />


          </Route>

          {/* Qualquer rota inválida */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

    </AuthProvider>
  );
}

export default App;
