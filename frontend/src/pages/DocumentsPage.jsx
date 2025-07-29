import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // Instale com: npm install uuid

const DocumentsPage = () => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);

  // Função para pegar a URL pública de um arquivo no Supabase Storage
  const getPublicUrl = (filePath) => {
      const { data } = supabase.storage.from('documentos').getPublicUrl(filePath);
      return data.publicUrl;
  };

  // Efeito para buscar o usuário e os arquivos já enviados
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUser(session.user);

      // Lista os arquivos do usuário no bucket 'documentos'
      const { data: fileList, error } = await supabase.storage
        .from('documentos')
        .list(session.user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });
      
      if (error) {
        console.error('Erro ao listar arquivos:', error);
      } else {
        // Adiciona a URL pública a cada arquivo
        const filesWithUrls = fileList.map(file => ({
          ...file,
          publicUrl: getPublicUrl(`${session.user.id}/${file.name}`)
        }));
        setFiles(filesWithUrls);
      }
    };
    fetchData();
  }, []);

  // Função para lidar com o upload do arquivo
  const handleUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) {
        throw new Error('Você precisa selecionar um arquivo para upload.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`; // Gera um nome de arquivo único
      const filePath = `${user.id}/${fileName}`; // Cria um caminho tipo: 'user_id/nome_unico.pdf'

      // Faz o upload para o Supabase Storage
      let { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Após o upload, atualiza a lista de arquivos na tela
      const newFile = { 
        name: fileName, 
        id: uuidv4(), 
        publicUrl: getPublicUrl(filePath) 
      };
      setFiles([...files, newFile]);

      alert('Arquivo enviado com sucesso!');
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300 p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">Meus Documentos</h1>
      
      {/* Formulário de Upload */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Enviar Novo Documento</h2>
        <p className="text-gray-400 mb-4">Selecione um arquivo (PDF, JPG, PNG).</p>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-cyan-50 file:text-cyan-700
                     hover:file:bg-cyan-100"
        />
        {uploading && <p className="mt-4 text-yellow-400">Enviando...</p>}
      </div>

      {/* Lista de Documentos Enviados */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Documentos Enviados</h2>
        {files.length > 0 ? (
          <ul className="space-y-3">
            {files.map((file) => (
              <li key={file.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                <span className="truncate">{file.name}</span>
                <a
                  href={file.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Visualizar
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">Nenhum documento enviado ainda.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;