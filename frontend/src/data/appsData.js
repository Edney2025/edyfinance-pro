// frontend/src/data/appsData.js
import {
  FaHandshake, FaFileDownload, FaKey, FaUserPlus, FaCalculator, FaFileSignature,
  FaMoneyBillWave, FaExclamationTriangle, FaCheckCircle, FaTasks, FaHistory
} from 'react-icons/fa';

export const appSections = {
  "Portal do Cliente": [
    { id: 20, title: 'Solicitar Renegociação', icon: FaHandshake, bgColor: 'bg-green-500', 
      requiresAuth: true, path: '/meus-emprestimos', isComingSoon: false },
    { id: 21, title: 'Simular Pagamento', icon: FaCalculator, bgColor: 'bg-blue-500', 
      requiresAuth: true, isComingSoon: true },
    { id: 22, title: 'Ver Contrato', icon: FaFileSignature, bgColor: 'bg-purple-500', 
      requiresAuth: true, isComingSoon: true },
    { id: 30, title: 'Parcelas em Aberto', icon: FaMoneyBillWave, bgColor: 'bg-yellow-500', 
      requiresAuth: true, isComingSoon: true },
    { id: 31, title: 'Parcelas Vencidas', icon: FaExclamationTriangle, bgColor: 'bg-red-500', 
      requiresAuth: true, isComingSoon: true },
    { id: 32, title: 'Parcelas Quitadas', icon: FaCheckCircle, bgColor: 'bg-teal-500', 
      requiresAuth: true, isComingSoon: true },
    { id: 33, title: 'Propostas em Andamento', icon: FaTasks, bgColor: 'bg-indigo-500', 
      requiresAuth: true, isComingSoon: true },
    { id: 34, title: 'Histórico de Pagamentos', icon: FaHistory, bgColor: 'bg-gray-500', 
      requiresAuth: true, isComingSoon: true },
    { id: 604, title: 'Meus Documentos', icon: FaFileDownload, bgColor: 'bg-orange-700', 
      requiresAuth: true, path: '/meus-documentos', isComingSoon: false },
  ],
  "Minha Conta": [
    { id: 601, title: 'Fazer Login', icon: FaKey, bgColor: 'bg-gray-700', 
      isPublic: true, path: '/login', isComingSoon: false },
    { id: 602, title: 'Criar Nova Conta', icon: FaUserPlus, bgColor: 'bg-gray-700', 
      isPublic: true, isComingSoon: true },
  ]
};