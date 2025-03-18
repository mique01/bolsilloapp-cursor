'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Filter, Search, BarChart3, ArrowDown, ArrowUp, Trash, Eye, FileText, SlidersHorizontal, Paperclip, X, Folder, Download } from 'lucide-react';
import { useSupabaseAuth } from '@/lib/contexts/SupabaseAuthContext';
import * as supabaseDB from '@/lib/services/supabaseDatabase';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  paymentMethod: string;
  person?: string;
  receipt?: string;
  owner?: string;
  attachmentId?: string;
};

type Receipt = {
  id: string;
  name: string;
  date: string;
  folder: string;
  file: string; // Base64 o URL
  transactionId?: string;
};

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const receiptIdParam = searchParams.get('receiptId');
  const { user } = useSupabaseAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [viewReceipt, setViewReceipt] = useState<Receipt | null>(null);
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [showComprobantesModal, setShowComprobantesModal] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions and comprobantes from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabaseDB.getTransactions(user.id);
        
        if (transactionsError) {
          throw new Error(transactionsError.message);
        }

        if (transactionsData) {
          // Convert Supabase format to app format
          const formattedTransactions = transactionsData.map(t => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
            date: t.date,
            category: t.category,
            type: t.type,
            paymentMethod: t.payment_method,
            person: t.person,
            attachmentId: t.attachment_id
          }));
          
          setTransactions(formattedTransactions);
          setFilteredTransactions(formattedTransactions);
        } else {
          setTransactions([]);
          setFilteredTransactions([]);
        }

        // Fetch comprobantes
        const { data: comprobantesData, error: comprobantesError } = await supabaseDB.getComprobantes(user.id);
        
        if (comprobantesError) {
          throw new Error(comprobantesError.message);
        }

        if (comprobantesData) {
          setComprobantes(comprobantesData.map(c => ({
            id: c.id,
            fileName: c.file_name,
            description: c.description,
            fileType: c.file_type,
            fileUrl: c.file_url,
            folderId: c.folder_id,
            uploadDate: c.created_at
          })));
        } else {
          setComprobantes([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
        console.error(err);
        
        // Use localStorage as fallback if Supabase fails
        const savedTransactions = localStorage.getItem('transactions');
        const savedReceipts = localStorage.getItem('receipts');
        const savedComprobantes = localStorage.getItem('comprobantes');
        
        if (savedTransactions) {
          const parsedTransactions = JSON.parse(savedTransactions);
          setTransactions(parsedTransactions);
          setFilteredTransactions(parsedTransactions);
        }

        if (savedReceipts) {
          setReceipts(JSON.parse(savedReceipts));
        }

        if (savedComprobantes) {
          try {
            setComprobantes(JSON.parse(savedComprobantes));
          } catch (error) {
            console.error('Error parsing comprobantes:', error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter transactions when filter or search changes
  useEffect(() => {
    let result = transactions;
    
    // Filter by type
    if (filter === 'income') {
      result = result.filter(t => t.type === 'income');
    } else if (filter === 'expense') {
      result = result.filter(t => t.type === 'expense');
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.paymentMethod.toLowerCase().includes(term)
      );
    }
    
    // Sort by date (most recent first)
    result = [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredTransactions(result);
  }, [transactions, filter, searchTerm]);

  // Handle receipt ID from URL parameter
  useEffect(() => {
    if (receiptIdParam && transactions.length > 0) {
      setShowReceiptModal(true);
    }
  }, [receiptIdParam, transactions]);

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    
    try {
      // Find transaction to delete to check for linked comprobante
      const transaction = transactions.find(t => t.id === id);
      
      // Delete from Supabase
      const { error } = await supabaseDB.deleteTransaction(id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
      
      // If there's a linked comprobante, update it
      if (transaction?.attachmentId) {
        const comprobanteToUpdate = comprobantes.find(c => c.id === transaction.attachmentId);
        
        if (comprobanteToUpdate) {
          // Update the comprobante in Supabase to remove the transaction link
          await supabaseDB.updateComprobante({
            id: comprobanteToUpdate.id,
            transaction_id: null
          });
        }
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar la transacción');
      
      // Fallback to localStorage if Supabase fails
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    }
  };

  // Link comprobante to transaction
  const handleLinkReceipt = async (transactionId: string, comprobanteId: string) => {
    if (!user || !transactionId || !comprobanteId) return;
    
    try {
      // Update the transaction to link the comprobante
      const { error: transactionError } = await supabaseDB.updateTransaction({
        id: transactionId,
        attachmentId: comprobanteId
      });
      
      if (transactionError) {
        throw new Error(transactionError.message);
      }
      
      // Update the comprobante to link the transaction
      const { error: comprobanteError } = await supabaseDB.updateComprobante({
        id: comprobanteId,
        transactionId
      });
      
      if (comprobanteError) {
        throw new Error(comprobanteError.message);
      }
      
      // Update local state
      setTransactions(prevTransactions => 
        prevTransactions.map(t => 
          t.id === transactionId 
            ? { ...t, attachmentId: comprobanteId } 
            : t
        )
      );
      
      setComprobantes(prevComprobantes => 
        prevComprobantes.map(c => 
          c.id === comprobanteId 
            ? { ...c, transactionId } 
            : c
        )
      );
      
      // Close the modal
      setShowReceiptModal(false);
      setSelectedTransaction(null);
      
      // Clean up URL parameter
      if (receiptIdParam && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('receiptId');
        window.history.replaceState({}, '', url);
      }
    } catch (err) {
      console.error('Error linking comprobante:', err);
      setError(err instanceof Error ? err.message : 'Error al vincular el comprobante');
    }
  };

  // View comprobante details
  const viewComprobante = (id: string | undefined) => {
    if (!id) return;
    const comprobante = getComprobanteById(id);
    if (comprobante) {
      setSelectedComprobante(comprobante);
      setShowComprobantesModal(true);
    }
  };

  // Get comprobante by ID
  const getComprobanteById = (id: string | undefined) => {
    if (!id) return null;
    return comprobantes.find(comp => comp.id === id) || null;
  };

  // Close comprobante modal
  const closeComprobantesModal = () => {
    setShowComprobantesModal(false);
    setSelectedComprobante(null);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get unlinked comprobantes or specific one from URL
  const unlinkedComprobantes = comprobantes.filter(c => {
    // If there's a specific comprobante ID in the URL, show only that one
    if (receiptIdParam) {
      return c.id === receiptIdParam;
    }
    // Otherwise, show all unlinked comprobantes
    return !c.transactionId;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full dark-theme">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark-theme p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <div className="flex gap-2">
          <Link 
            href="/transacciones/nueva?type=expense"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <ArrowDown size={18} />
            <span>Nuevo Gasto</span>
          </Link>
          <Link 
            href="/transacciones/nueva?type=income"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <ArrowUp size={18} />
            <span>Nuevo Ingreso</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-500 text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar transacciones..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-md ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-3 py-2 rounded-md ${
              filter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400'
            }`}
          >
            <ArrowUp size={18} className="inline-block mr-1" />
            Ingresos
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-3 py-2 rounded-md ${
              filter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400'
            }`}
          >
            <ArrowDown size={18} className="inline-block mr-1" />
            Gastos
          </button>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-hidden bg-gray-800 rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Método de pago</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No hay transacciones que coincidan con los filtros.
                  <div className="mt-2">
                    <Link 
                      href="/transacciones/nueva"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                    >
                      <Plus size={16} />
                      <span>Agregar una nueva transacción</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                      }`}>
                        {transaction.type === 'income' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      </div>
                      <span className="text-sm">{transaction.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{transaction.category}</td>
                  <td className="px-4 py-3 text-sm">{transaction.date}</td>
                  <td className="px-4 py-3 text-sm">{transaction.paymentMethod}</td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {transaction.attachmentId && getComprobanteById(transaction.attachmentId) && (
                        <button
                          onClick={() => viewComprobante(transaction.attachmentId)}
                          className="p-1.5 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                          title="Ver comprobante"
                        >
                          <FileText size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        title="Eliminar transacción"
                        className="p-1.5 text-gray-400 hover:text-red-400"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
            No hay transacciones que coincidan con los filtros.
            <div className="mt-2">
              <Link 
                href="/transacciones/nueva"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                <Plus size={16} />
                <span>Agregar una nueva transacción</span>
              </Link>
            </div>
          </div>
        ) : (
          filteredTransactions.map(transaction => transaction && (
            <div className="bg-gray-800 rounded-lg p-4 mb-3" key={transaction.id}>
              <div className="flex justify-between mb-2">
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`flex-shrink-0 p-1.5 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'income' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    </div>
                    <span className="font-medium text-gray-200 truncate">{transaction.description}</span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    {transaction.date} · {transaction.category} · {transaction.paymentMethod || '-'}
                    {transaction.person && ` · ${transaction.person}`}
                  </div>
                  
                  <div className="mt-1 flex items-center">
                    <span 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </div>
                  
                  {/* Comprobante adjunto en vista móvil */}
                  {transaction.attachmentId && getComprobanteById(transaction.attachmentId) && (
                    <button
                      onClick={() => viewComprobante(transaction.attachmentId)}
                      className="mt-2 flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Paperclip size={14} className="mr-1" />
                      <span className="truncate">
                        {getComprobanteById(transaction.attachmentId)?.fileName || 'Comprobante adjunto'}
                      </span>
                    </button>
                  )}
                </div>
                
                <div className={`text-right font-medium text-lg ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </div>
              </div>
              
              <div className="flex justify-end mt-3 border-t border-gray-700 pt-3">
                <button 
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  className="p-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para vincular comprobante */}
      {showReceiptModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {selectedTransaction 
                  ? "Vincular comprobante a transacción" 
                  : receiptIdParam 
                    ? "Seleccionar transacción para vincular comprobante" 
                    : "Vincular comprobante"}
              </h3>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedTransaction(null);
                  // Limpiar parámetro de URL si existe
                  if (receiptIdParam && window.history.replaceState) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('receiptId');
                    window.history.replaceState({}, '', url);
                  }
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Show transaction selection if we have a receipt ID but no selected transaction */}
            {receiptIdParam && !selectedTransaction ? (
              <>
                <p className="text-gray-300 mb-4">Selecciona la transacción a la que deseas adjuntar el comprobante:</p>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No hay transacciones disponibles.</p>
                    <Link 
                      href="/transacciones/nueva"
                      className="mt-3 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                    >
                      <Plus size={16} />
                      <span>Crear una nueva transacción</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {transactions.map(transaction => (
                      <button
                        key={transaction.id}
                        onClick={() => setSelectedTransaction(transaction.id)}
                        className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'income' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                          }`}>
                            {transaction.type === 'income' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{transaction.description}</div>
                            <div className="text-sm text-gray-400">
                              {transaction.date} · {transaction.category} · {transaction.paymentMethod}
                            </div>
                          </div>
                          <div className={`text-right font-medium ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : unlinkedComprobantes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No hay comprobantes disponibles para vincular.</p>
                <Link
                  href="/comprobantes"
                  className="mt-3 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  <FileText size={16} />
                  <span>Ir a la sección de comprobantes</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {unlinkedComprobantes.map(comprobante => (
                  <div key={comprobante.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-blue-400" />
                      <div>
                        <div className="font-medium">{comprobante.name}</div>
                        <div className="text-xs text-gray-400">{comprobante.date}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLinkReceipt(selectedTransaction || "", comprobante.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Vincular
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para visualizar comprobante */}
      {showComprobantesModal && selectedComprobante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1e293b] w-full max-w-lg rounded-xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100">Detalle del comprobante</h2>
              <button 
                onClick={closeComprobantesModal}
                className="p-1.5 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="bg-[#0f172a] rounded-lg border border-gray-800 p-4 mb-4">
                <div className="flex items-center mb-3">
                  <FileText size={24} className="text-purple-400 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-100">{selectedComprobante.name}</h3>
                    <p className="text-sm text-gray-400">Subido el {new Date(selectedComprobante.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-gray-300">{selectedComprobante.description}</p>
              </div>
              
              <div className="text-center">
                <a
                  href={selectedComprobante.file}
                  download={selectedComprobante.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white rounded-lg transition-colors"
                >
                  <Download size={16} />
                  <span>Descargar archivo</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 