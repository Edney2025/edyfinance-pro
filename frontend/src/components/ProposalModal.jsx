import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

// O componente agora só precisa da proposta e da função para fechar (onClose)
const ProposalModal = ({ proposal, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  if (!proposal) return null;

  const handleShareClick = () => {
    if (!selectedOption) {
      alert("Por favor, selecione uma opção de parcelamento para compartilhar.");
      return;
    }
    
    const message = `*Proposta de Renegociação*%0A%0A` +
                    `Olá! Segue a simulação da minha renegociação:%0A%0A` +
                    `*Saldo Devedor Total:* ${formatCurrency(proposal.saldo_devedor_total)}%0A` +
                    `*Opção de Parcelamento Escolhida:*%0A` +
                    `*- Parcelas:* ${selectedOption.numero_parcelas}x%0A` +
                    `*- Valor da Parcela:* ${formatCurrency(selectedOption.valor_parcela)}%0A%0A` +
                    `_Simulação gerada pelo Portal Financeiro._`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-none sm:rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl flex flex-col animate-fade-in-up">
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-cyan-400 text-center">Proposta de Refinanciamento</h2>
          <div className="text-center mt-2">
            <p className="text-gray-600 dark:text-gray-400">Saldo a Refinanciar:</p>
            <p className="text-2xl font-bold">{formatCurrency(proposal.saldo_devedor_total)}</p>
          </div>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-700 dark:text-gray-300">Selecione uma Opção de Parcelamento:</h3>
          <div className="space-y-2">
            {proposal.opcoes_parcelamento?.map((opcao) => (
              <div
                key={opcao.numero_parcelas}
                onClick={() => setSelectedOption(opcao)}
                className={`p-3 rounded-lg flex justify-between items-center cursor-pointer transition-all 
                           ${selectedOption?.numero_parcelas === opcao.numero_parcelas 
                             ? 'bg-cyan-500 text-white scale-105 shadow-lg' 
                             : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                <span className="font-bold">{opcao.numero_parcelas}x</span>
                <span className={`font-semibold ${selectedOption?.numero_parcelas === opcao.numero_parcelas ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'}`}>
                  {formatCurrency(opcao.valor_parcela)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex gap-4 shrink-0 rounded-b-lg">
          <button onClick={onClose} className="w-1/2 px-6 py-3 bg-gray-500 hover:bg-gray-400 text-white font-semibold rounded-lg">Fechar</button>
          <button 
            onClick={handleShareClick} 
            disabled={!selectedOption} 
            className="w-1/2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaWhatsapp />
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;