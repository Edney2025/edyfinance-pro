import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // Ouve mudanças no estado de autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpa a inscrição quando o componente for desmontado
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <p className="text-white text-xl">Carregando...</p>
        </div>
    );
  }

  if (!session) {
    // Se não há sessão (usuário não logado), redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se há sessão, renderiza o componente filho (a página do Dashboard)
  return children;
};

export default ProtectedRoute;