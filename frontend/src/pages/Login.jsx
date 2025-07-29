import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Login = ({ onLoginSuccess }) => {
  const [cpf, setCpf] = useState(''); // Agora o estado é 'cpf'
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // --- O "TRUQUE" ESTÁ AQUI ---
  const DOMINIO_FICTICIO = '@portalcliente.com'; // Use um domínio que faça sentido para seu projeto

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    // Limpa o CPF de pontos e traços antes de usar
    const cpfLimpo = cpf.replace(/[.-]/g, '');

    // Transforma o CPF limpo em um e-mail para o Supabase
    const emailParaSupabase = `${cpfLimpo}${DOMINIO_FICTICIO}`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailParaSupabase, // Enviamos o e-mail formatado
      password: password,
    });

    if (error) {
      setError('CPF ou senha inválidos. Por favor, tente novamente.');
      console.error('Erro no login:', error.message);
    } else {
      setMessage('Login realizado com sucesso! Redirecionando...');
      console.log('Usuário logado:', data.user);
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-cyan-400 mb-8">
          Acessar Portal
        </h2>
        {error && <p className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">{error}</p>}
        {message && <p className="bg-green-500 text-white p-3 rounded-md mb-4 text-center">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="cpf" className="block text-gray-400 mb-2">CPF</label>
            <input
              type="text"
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)} // Atualiza o estado 'cpf'
              placeholder="Digite seu CPF"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-400 mb-2">Senha (PIM)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha de 4 dígitos"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;