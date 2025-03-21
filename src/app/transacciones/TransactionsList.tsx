'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Search, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  FileText, 
  Edit, 
  Trash2, 
  Receipt,
  Plus,
  ChevronDown,
  Trash
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useSupabaseAuth } from '@/lib/contexts/SupabaseAuthContext';
import { deleteTransaction } from '@/lib/services/supabaseDatabase';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  payment_method: string;
  date: string;
  type: 'income' | 'expense';
  person?: string;
  receipt_id?: string | null;
  created_at: string;
}

export default function TransactionsList() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  // Estados para listas únicas
  const [categories, setCategories] = useState<string[]>([]);
  const [persons, setPersons] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  
  // Actualizar listas únicas cuando cambian las transacciones
  useEffect(() => {
    // Extraer categorías únicas
    const uniqueCategories = new Set<string>();
    transactions
      .filter(t => t.category)
      .forEach(t => {
        if (t.category) uniqueCategories.add(t.category);
      });
    setCategories(Array.from(uniqueCategories).sort());
    
    // Extraer personas únicas
    const uniquePeople = new Set<string>();
    transactions
      .filter(t => t.person)
      .forEach(t => {
        if (t.person) uniquePeople.add(t.person);
      });
    setPersons(Array.from(uniquePeople).sort());
    
    // Extraer métodos de pago únicos
    const uniqueMethods = new Set<string>();
    transactions
      .filter(t => t.payment_method)
      .forEach(t => {
        if (t.payment_method) uniqueMethods.add(t.payment_method);
      });
    setPaymentMethods(Array.from(uniqueMethods).sort());
  }, [transactions]);
  
  // Cargar transacciones
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      
      try {
        if (typeof window !== 'undefined') {
          const storedTransactions = localStorage.getItem('transactions');
          
          if (storedTransactions) {
            const parsedTransactions = JSON.parse(storedTransactions);
            setTransactions(parsedTransactions);
            setFilteredTransactions(parsedTransactions);
          } else {
            setTransactions([]);
            setFilteredTransactions([]);
          }
        }
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError('Error al cargar las transacciones');
      } finally {
        setLoading(false);
      }
    };
    
    loadTransactions();
  }, []);

  // Filtrar transacciones cuando cambien los filtros
  useEffect(() => {
    let filtered = [...transactions];
    
    // Filtro por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }
    
    // Filtro por categoría
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    // Filtro por persona
    if (selectedPerson) {
      filtered = filtered.filter(t => t.person === selectedPerson);
    }
    
    // Filtro por fecha
    if (dateRange) {
      filtered = filtered.filter(t => t.date.startsWith(dateRange));
    }
    
    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(term) ||
        (t.category && t.category.toLowerCase().includes(term)) ||
        (t.person && t.person.toLowerCase().includes(term)) ||
        t.payment_method.toLowerCase().includes(term)
      );
    }
    
    // Ordenar por fecha (más reciente primero)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredTransactions(filtered);
  }, [transactions, selectedType, selectedCategory, selectedPerson, dateRange, searchTerm]);

  // Manejar eliminación de transacción
  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      // Eliminar de localStorage (desarrollo)
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        const updatedTransactions = parsedTransactions.filter((t: Transaction) => t.id !== transactionToDelete);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        
        // Actualizar el estado local
        setTransactions(updatedTransactions);
        setFilteredTransactions(applyFilters(updatedTransactions));
      }
      
      // Aquí se llamaría a la API para eliminar en producción
      // await deleteTransaction(transactionToDelete);
      
      setDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la transacción:', error);
    }
  };

  // Calcular totales
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [filteredTransactions]);

  // Aplicar filtros a las transacciones
  const applyFilters = (transactionsToFilter: Transaction[]): Transaction[] => {
    return transactionsToFilter.filter((transaction) => {
      // Filtrar por término de búsqueda
      const matchesSearch = searchTerm === '' || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.payment_method.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrar por categoría
      const matchesCategory = selectedCategory === '' || transaction.category === selectedCategory;
      
      // Filtrar por tipo
      const matchesType = selectedType === '' || transaction.type === selectedType;
      
      // Filtrar por persona
      const matchesPerson = selectedPerson === '' || transaction.person === selectedPerson;
      
      // Filtrar por fecha
      let matchesDate = true;
      if (dateRange !== '') {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        const daysAgo = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
        
        switch (dateRange) {
          case 'today':
            matchesDate = transactionDate.toDateString() === today.toDateString();
            break;
          case 'week':
            matchesDate = transactionDate >= daysAgo(7);
            break;
          case 'month':
            matchesDate = transactionDate >= daysAgo(30);
            break;
          case 'year':
            matchesDate = transactionDate >= daysAgo(365);
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesPerson && matchesDate;
    });
  };

  if (loading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Renderizado de cada transacción
  const renderTransaction = (transaction: Transaction) => (
    <div key={transaction.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">
            {transaction.description || 'Sin descripción'}
            {transaction.receipt_id && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-300">
                <Receipt size={12} className="mr-1" />
                Comprobante
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-400">{transaction.category || 'Sin categoría'}</p>
        </div>
        <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
          {transaction.type === 'income' ? '+' : '-'} ${Math.abs(transaction.amount).toLocaleString()}
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-400">{new Date(transaction.date).toLocaleDateString()}</span>
          {transaction.payment_method && (
            <>
              <span className="text-gray-500 mx-1">•</span>
              <span className="text-gray-400">{transaction.payment_method}</span>
            </>
          )}
          {transaction.person && (
            <>
              <span className="text-gray-500 mx-1">•</span>
              <span className="text-gray-400">{transaction.person}</span>
            </>
          )}
        </div>
        
        <div className="flex gap-1">
          <button 
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-blue-400"
            onClick={() => window.location.href = `/transacciones/editar?id=${transaction.id}`}
            title="Editar transacción"
          >
            <Edit size={16} />
          </button>
          
          <button 
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-green-400"
            onClick={() => window.location.href = `/comprobantes/nuevo?transactionId=${transaction.id}`}
            title={transaction.receipt_id ? "Ver/cambiar comprobante" : "Añadir comprobante"}
          >
            <Receipt size={16} />
          </button>
          
          <button 
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-red-400"
            onClick={() => handleDeleteTransaction(transaction.id)}
            title="Eliminar transacción"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-4">
      {/* Header y botón de nueva transacción */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Transacciones</h1>
        <Link 
          href="/transacciones/nueva" 
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusCircle size={20} />
          <span>Nueva Transacción</span>
        </Link>
      </div>
      
      {/* Buscador y filtros */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        {/* Buscador */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar transacciones..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
          >
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>
        
        {/* Filtros expandibles */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo</label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'income' | 'expense')}
              >
                <option value="all">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoría</label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Persona</label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
              >
                <option value="">Todas</option>
                {persons.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha</label>
              <input
                type="month"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Resumen de totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpCircle className="text-emerald-500" size={24} />
            <h3 className="text-lg font-semibold text-emerald-500">Ingresos</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totals.income)}</p>
        </div>
        
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownCircle className="text-red-500" size={24} />
            <h3 className="text-lg font-semibold text-red-500">Gastos</h3>
          </div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totals.expenses)}</p>
        </div>
        
        <div className={`${
          totals.balance >= 0 
            ? 'bg-blue-500/10 border border-blue-500' 
            : 'bg-orange-500/10 border border-orange-500'
        } rounded-lg p-4`}>
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-lg font-semibold ${
              totals.balance >= 0 ? 'text-blue-500' : 'text-orange-500'
            }`}>
              Balance
            </h3>
          </div>
          <p className={`text-2xl font-bold ${
            totals.balance >= 0 ? 'text-blue-500' : 'text-orange-500'
          }`}>
            {formatCurrency(totals.balance)}
          </p>
        </div>
      </div>
      
      {/* Lista de transacciones */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-center p-8">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-400 border-t-blue-500 rounded-full mb-2"></div>
            <p className="text-gray-400">Cargando transacciones...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map(renderTransaction)
        ) : (
          <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 mb-2">No hay transacciones que coincidan con los filtros seleccionados.</p>
            <button 
              onClick={() => {
                // Resetear filtros
                setSelectedCategory('');
                setSelectedType('');
                setSelectedPerson('');
                setDateRange('');
                setSearchTerm('');
              }}
              className="text-blue-500 hover:text-blue-400"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
      
      {/* Modal de confirmación de eliminación */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Confirmar eliminación</h3>
            <p className="text-gray-300 mb-6">¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setTransactionToDelete(null);
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 