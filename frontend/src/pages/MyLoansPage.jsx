import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import ProposalModal from '../components/ProposalModal';

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
        
        const apiUrl = `http://127.0.0.1:5000/api/cliente/analise/${clienteId}`;
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
      const apiUrl = `http://127.0.0.1:5000/api/proposta/renegociar-multiplos`;
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
          <div className="sticky top-4 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Renegociação Agrupada</h2>
                <p className="text-gray-600 dark:text-gray-400">Selecione as pendências que deseja incluir na renegociação.</p>
                <p className="text-xl mt-2 text-gray-800 dark:text-white">Total Selecionado: 
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 ml-2">{formatCurrency(totalSelecionado)}</span>
                </p>
              </div>
              <button 
                onClick={handleMultiRenegotiate} 
                disabled={totalSelecionado === 0 || isNegotiating}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all w-full md:w-auto disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isNegotiating ? 'Calculando...' : 'Renegociar Selecionados'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {emprestimosInfo?.emprestimos?.map((emp) => (
              <label key={emp.id} htmlFor={`loan-${emp.id}`} className={`block bg-white dark:bg-gray-800 p-4 rounded-lg cursor-pointer border-2 transition-all 
                                                                         ${selectedLoans[emp.id] ? 'border-cyan-500 bg-cyan-50 dark:bg-gray-700/50' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id={`loan-${emp.id}`}
                    checked={!!selectedLoans[emp.id]}
                    onChange={() => handleCheckboxChange(emp.id)}
                    className="h-6 w-6 mt-1 rounded text-cyan-600 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-cyan-500 focus:ring-2 shrink-0"
                  />
                  <div className="ml-4 w-full">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-cyan-400">{`EMPRÉSTIMO ${emp.id}: ${cleanDescription(emp.descricao)}`}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2 text-sm border-t border-gray-300 dark:border-gray-700 pt-2">
                        <div><span className="text-gray-500 dark:text-gray-400">Valor Original: </span>{formatCurrency(emp.valor_total_emprestimo)}</div>
                        <div><span className="text-gray-500 dark:text-gray-400">Total Parcelas: </span>{emp.quantidade_parcelas}</div>
                        <div><span className="text-gray-500 dark:text-gray-400">Valor Parcela: </span>{formatCurrency(emp.valor_parcela)}</div>
                        <div><span className="text-gray-500 dark:text-gray-400">Primeira Parcela: </span>{emp.primeira_parcela}</div>
                        <div><span className="text-gray-500 dark:text-gray-400">Última Parcela: </span>{emp.data_ultima_parcela}</div>
                        <div><span className="text-gray-500 dark:text-gray-400">Parcelas Pagas: </span>{emp.parcelas_pagas}</div>
                        <div><span className="text-gray-500 dark:text-gray-400">A Vencer: </span>{emp.a_vencer}</div>
                        <div><span className="text-gray-500 dark:text-gray-400">Próxima Parcela: </span>{emp.proxima_parcela}</div>
                        <div className="col-span-2 sm:col-span-1 mt-2 font-bold"><span className="text-red-600 dark:text-red-400">Saldo Devedor: </span><span className="text-red-600 dark:text-red-400">{formatCurrency(emp.valor_a_vencer)}</span></div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </main>
      </div>

      <ProposalModal 
  proposal={proposalData} 
  onClose={() => setIsModalOpen(false)}
  onAccept={() => alert('Função de aceitar a ser implementada')} // Adicione uma função placeholder
/>
    </>
  );
};

export default MyLoansPage;