import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import ProposalModal from '../components/ProposalModal';

// CORREÇÃO 1: A variável da URL da API é definida AQUI, no topo do arquivo.
// Assim, ela fica disponível para TODAS as funções dentro do componente.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const MyLoansPage = () => {
  const navigate = useNavigate();
  const [emprestimosInfo, setEmprestimosInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoans, setSelectedLoans] = useState({});
  const [proposalData, setProposalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }
        const clienteId = session.user.id;
        
        const { data: clienteData } = await supabase.from('clientes').select('nome_completo').eq('id', clienteId).single();
        setUser(clienteData);
        
        // Usa a variável de ambiente corretamente
        const apiUrl = `${API_BASE_URL}/api/cliente/analise/${clienteId}`;
        const response = await axios.get(apiUrl);
        setEmprestimosInfo(response.data);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [navigate]);

  const handleCheckboxChange = (loanId) => {
    setSelectedLoans(prev => ({ ...prev, [loanId]: !prev[loanId] }));
  };

  const totalSelecionado = useMemo(() => {
    return emprestimosInfo?.emprestimos
      .filter(emp => selectedLoans[emp.id])
      .reduce((sum, emp) => sum + (emp.valor_a_vencer || 0), 0) || 0;
  }, [selectedLoans, emprestimosInfo]);

  const handleMultiRenegotiate = async () => {
    const loanIds = Object.keys(selectedLoans).filter(id => selectedLoans[id]);
    if (loanIds.length === 0) {
      alert("Por favor, selecione pelo menos um empréstimo.");
      return;
    }
    setIsNegotiating(true);
    try {
      // CORREÇÃO 2: Usa a variável de ambiente aqui também.
      const apiUrl = `${API_BASE_URL}/api/proposta/renegociar-multiplos`;
      const response = await axios.post(apiUrl, { loan_ids: loanIds });
      setProposalData(response.data);
      setIsModalOpen(true);
    } catch (err) {
      alert(`Erro ao gerar proposta: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsNegotiating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const cleanDescription = (desc) => {
    return desc?.replace(/Empréstimo: \d+ - Empréstimo [\d,.]+ /i, '').replace('Ref. ', '') || '';
  };

  if (loading) return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-800 dark:text-white"><p>Carregando seus empréstimos...</p></div>;
  if (error) return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-800 dark:text-white"><p>Erro ao carregar dados: {error}</p></div>;

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300 p-4 md:p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-cyan-400">Meus Empréstimos</h1>
          <div><Link to="/" className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold">Voltar ao Portal</Link></div>
        </header>

        <main>
          {/* ... (O restante do JSX continua o mesmo) ... */}
          <div className="sticky top-4 z-10 ...">
            {/* ... */}
            <button 
                onClick={handleMultiRenegotiate} 
                // ...
            >
                {/* ... */}
            </button>
          </div>

          <div className="space-y-4">
            {emprestimosInfo?.emprestimos?.map((emp) => (
              <label key={emp.id} htmlFor={`loan-${emp.id}`} className="...">
                {/* ... */}
              </label>
            ))}
          </div>
        </main>
      </div>

      <ProposalModal 
        proposal={proposalData} 
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default MyLoansPage;