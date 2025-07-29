import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from '../../supabaseClient'; // Importe para pegar o ID do admin

const AdminDashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para o formulário de nova venda
  const [showForm, setShowForm] = useState(false);
  const [newVenda, setNewVenda] = useState({
      cliente_id: '',
      produto_descricao: '',
      valor_total: '',
      tipo_pagamento: 'a_prazo',
      quantidade_parcelas: 12,
  });

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/admin/clientes');
        setClientes(response.data);
      } catch (err) { setError(err.message); } 
      finally { setLoading(false); }
    };
    fetchClientes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVenda(prevState => ({ ...prevState, [name]: value }));
  };

  const handleVendaSubmit = async (e) => {
      e.preventDefault();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
          alert("Sua sessão expirou. Por favor, faça login novamente.");
          return;
      }

      const vendaData = {
          ...newVenda,
          admin_id: session.user.id, // Adiciona o ID do admin logado
          valor_total: parseFloat(newVenda.valor_total),
          quantidade_parcelas: parseInt(newVenda.quantidade_parcelas)
      };

      try {
          const response = await axios.post('http://127.0.0.1:5000/api/admin/vendas', vendaData);
          alert(response.data.message);
          setShowForm(false); // Esconde o formulário após o sucesso
      } catch (err) {
          alert(`Erro ao cadastrar venda: ${err.response?.data?.error || err.message}`);
      }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-cyan-400">Painel Administrativo</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          {showForm ? 'Cancelar Venda' : '+ Nova Venda'}
        </button>
      </div>
      
      {/* Formulário de Nova Venda */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <form onSubmit={handleVendaSubmit} className="space-y-4">
            <h2 className="text-xl text-cyan-400">Registrar Nova Venda</h2>
            <div>
              <label>Cliente:</label>
              <select name="cliente_id" onChange={handleInputChange} required className="w-full p-2 bg-gray-700 rounded">
                <option value="">Selecione um cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome_completo}</option>)}
              </select>
            </div>
            <div><label>Descrição do Produto/Serviço:</label><input type="text" name="produto_descricao" onChange={handleInputChange} required className="w-full p-2 bg-gray-700 rounded" /></div>
            <div><label>Valor Total:</label><input type="number" step="0.01" name="valor_total" onChange={handleInputChange} required className="w-full p-2 bg-gray-700 rounded" /></div>
            <div>
              <label>Tipo de Pagamento:</label>
              <select name="tipo_pagamento" value={newVenda.tipo_pagamento} onChange={handleInputChange} className="w-full p-2 bg-gray-700 rounded">
                <option value="a_prazo">A Prazo</option><option value="a_vista">À Vista</option>
              </select>
            </div>
            {newVenda.tipo_pagamento === 'a_prazo' && (
              <div><label>Quantidade de Parcelas:</label><input type="number" name="quantidade_parcelas" value={newVenda.quantidade_parcelas} onChange={handleInputChange} className="w-full p-2 bg-gray-700 rounded" /></div>
            )}
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 p-2 rounded">Salvar Venda</button>
          </form>
        </div>
      )}

      {/* Tabela de Clientes (código existente) */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* ... sua tabela de clientes ... */}
      </div>
    </div>
  );
};

export default AdminDashboard;