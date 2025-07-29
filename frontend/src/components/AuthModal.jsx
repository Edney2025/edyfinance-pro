import React from 'react';
import Login from '../pages/Login'; // Vamos reutilizar o nosso componente de Login!

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Botão de Fechar */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">×</button>
        
        {/* Conteúdo do Modal */}
        <div className="p-2">
            {/* Reutilizamos o formulário de login, passando a função de sucesso */}
            <Login onLoginSuccess={onLoginSuccess} />
        </div>
        <div className="text-center pb-6">
            <p className="text-gray-400">Novo por aqui? <a href="#" className="text-cyan-400 hover:underline">Crie sua conta</a></p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;