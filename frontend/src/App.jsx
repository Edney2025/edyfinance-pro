import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Páginas e Componentes
import AppCenter from './pages/AppCenter';
import Login from './pages/Login';
import MyLoansPage from './pages/MyLoansPage';
import DocumentsPage from './pages/DocumentsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

const LoginPage = () => {
    const navigate = useNavigate();
    const handleLoginSuccess = () => {
        navigate('/'); // Redireciona para a home após o login
    };
    return <Login onLoginSuccess={handleLoginSuccess} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppCenter />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/meus-emprestimos" element={<ProtectedRoute><MyLoansPage /></ProtectedRoute>} />
      <Route path="/meus-documentos" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;