// frontend/src/components/StyledAppCard.jsx
import React from 'react';

const StyledAppCard = ({ icon: Icon, title, bgColor, onClick, isComingSoon = false }) => {
  const handleClick = () => {
    if (isComingSoon) {
      alert(`Funcionalidade "${title}" será implementada em breve!`);
    } else {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col items-center justify-center p-4 rounded-xl 
                 bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-xl dark:shadow-black/20
                 transition-all duration-300 overflow-hidden cursor-pointer
                 ${isComingSoon ? 'opacity-60 hover:opacity-100' : ''}`}
    >
      <div className={`relative w-24 h-24 rounded-full flex items-center justify-center 
                     transition-transform duration-300 ${!isComingSoon && 'group-hover:scale-110'} ${bgColor}`}>
        <Icon className="text-white text-4xl z-10" />
        <div className="absolute top-1/2 left-1/2 w-full h-full bg-black/20 origin-top-left 
                       -translate-x-[2px] transform skew-x-[-45deg] skew-y-[0] scale-y-150 scale-x-125"
          style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}>
        </div>
      </div>
      <h3 className="mt-4 font-bold text-center text-gray-800 dark:text-gray-200">{title}</h3>
      
      {isComingSoon && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          Em Breve
        </div>
      )}
    </div>
  );
};

export default StyledAppCard;