import React from 'react';

const StyledAppCard = ({ icon: Icon, title, bgColor, onClick }) => {
  // O truque da "sombra longa" é um elemento ::after ou, neste caso, um span posicionado
  // atrás do ícone, esticado e rotacionado.
  
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-4 rounded-xl 
                 bg-gray-100 dark:bg-gray-800 
                 shadow-md hover:shadow-xl dark:shadow-black/20
                 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Círculo Colorido */}
      <div 
        className={`relative w-24 h-24 rounded-full flex items-center justify-center 
                    transition-transform duration-300 group-hover:scale-110 ${bgColor}`}
      >
        {/* Ícone */}
        <Icon className="text-white text-4xl z-10" />
        
        {/* A "Sombra Longa" do Ícone */}
        <div 
          className="absolute top-1/2 left-1/2 w-full h-full 
                     bg-black/20 origin-top-left -translate-x-[2px] 
                     transform skew-x-[-45deg] skew-y-[0] scale-y-150 scale-x-125"
          style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}
        ></div>
      </div>
      
      {/* Título */}
      <h3 className="mt-4 font-bold text-center text-gray-800 dark:text-gray-200">
        {title}
      </h3>
      
      {/* Etiqueta "Em Breve" (opcional, pode ser adicionada depois) */}
      <div 
        className="absolute top-2 right-2 bg-yellow-500 text-white text-xs 
                   font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 
                   transition-opacity duration-300"
      >
        Em Breve
      </div>
    </div>
  );
};

export default StyledAppCard;