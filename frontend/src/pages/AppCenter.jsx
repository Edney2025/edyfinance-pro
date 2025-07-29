import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { appSections } from '../data/appsData'; 
import StyledAppCard from '../components/StyledAppCard'; 

import { FaSun, FaMoon, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';

const AppCardSkeleton = () => (
  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl animate-pulse">
    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4"></div>
    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
  </div>
);

const AppCenter = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const fetchSessionData = async (currentSession) => {
      if (!currentSession) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const { data: cliente, error } = await supabase
          .from('clientes').select('is_admin').eq('id', currentSession.user.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        setIsAdmin(cliente?.is_admin || false);
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
      } finally {
        setLoading(false);
      }
    };
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchSessionData(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchSessionData(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  
  const handleAppClick = (app) => {
    if (!session && app.requiresAuth) navigate('/login');
    else if (app.path && !app.isComingSoon) navigate(app.path);
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Erro ao sair:", error);
    else navigate('/');
  };

  const visibleSections = useMemo(() => {
    return Object.entries(appSections).map(([title, apps]) => {
      const filteredApps = apps.filter(app => {
        if (app.isAdmin && !isAdmin) return false;
        if (session && app.isPublic) return false;
        if (!session && app.requiresAuth && !app.isPublic) return false;
        return true;
      });
      return { title, apps: filteredApps };
    }).filter(section => section.apps.length > 0);
  }, [session, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="space-y-12 w-full container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {[...Array(6)].map((_, j) => <AppCardSkeleton key={j} />)}
            </div>
            <div className="h-8 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {[...Array(6)].map((_, j) => <AppCardSkeleton key={j} />)}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-cyan-400">
            Portal Financeiro
          </h1>
          <div className="flex items-center space-x-4">
            <button 
                onClick={toggleTheme} 
                className="p-2 text-2xl bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Alternar tema"
            >
              {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>
            {session && (
              <div className="flex items-center space-x-2">
                {isAdmin && 
                    <button 
                        onClick={() => navigate('/admin/dashboard')} 
                        className="p-2 text-xl bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors" 
                        title="Painel Administrativo"
                        aria-label="Painel Administrativo"
                    >
                        <FaCog />
                    </button>
                }
                <FaUserCircle className="text-3xl text-gray-500 dark:text-gray-400" />
                <button 
                    onClick={handleLogout} 
                    className="p-2 text-xl bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors" 
                    title="Sair"
                    aria-label="Sair"
                >
                    <FaSignOutAlt />
                </button>
              </div>
            )}
          </div>
        </header>

        {visibleSections.map(({ title, apps }) => (
            <section key={title} className="mb-12">
              <h2 className="text-2xl font-semibold border-b-2 border-cyan-500 pb-2 mb-6 text-gray-700 dark:text-gray-300">
                {title}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {apps.map(app => (
                  <StyledAppCard 
                    key={app.id}
                    icon={app.icon}
                    title={app.title}
                    bgColor={app.bgColor}
                    isComingSoon={app.isComingSoon}
                    onClick={() => handleAppClick(app)}
                  />
                ))}
              </div>
            </section>
        ))}
      </div>
    </div>
  );
};

export default AppCenter;