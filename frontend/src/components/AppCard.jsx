import React from 'react';

// O 'icon: Icon' permite passar um componente de ícone como propriedade
const AppCard = ({ icon: Icon, title, status, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 
                 rounded-lg p-6 flex flex-col items-center justify-center text-center 
                 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
    >
      {/* Ícone */}
      <Icon className="text-cyan-400 dark:text-cyan-300 text-5xl mb-4" />
      
      {/* Título */}
      <h3 className="font-bold text-white dark:text-gray-100 text-lg mb-2">{title}</h3>
      
      {/* Status */}
      <span className="text-sm font-semibold bg-yellow-500 text-white px-3 py-1 rounded-full">
        {status}
      </span>
    </div>
  );
};

export default AppCard;