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
  attachment_id?: string;
};

export default function TransactionsList() {
  // Get search params for filtering
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const typeFilter = searchParams.get('type');
  const personFilter = searchParams.get('person');
  const dateFilter = searchParams.get('date');
  
  // Estado para las transacciones
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  });
  
  // Estados para categorías, métodos de pago y personas únicas (para filtros)
  const [categories, setCategories] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  
  // Estado para estadísticas
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  
  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction | null;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending'
  });
  
  // Estado para modal de estadísticas
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  // Estado para modal de detalles de transacción
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  // Efecto para cargar transacciones del localStorage
  useEffect(() => {
    const loadTransactions = () => {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        try {
          const parsedTransactions = JSON.parse(storedTransactions);
          setTransactions(parsedTransactions);
        } catch (error) {
          console.error('Error parsing transactions:', error);
          setTransactions([]);
        }
      }
    };
    
    loadTransactions();
  }, []);
  
  // Efecto para extraer categorías, métodos de pago y personas únicas
  useEffect(() => {
    // Usamos Array.from en lugar de spread syntax para compatibilidad
    const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));
    const uniquePaymentMethods = Array.from(new Set(transactions.map(t => t.paymentMethod)));
    const uniquePeople = Array.from(new Set(transactions.filter(t => t.person).map(t => t.person as string)));
    
    setCategories(uniqueCategories);
    setPaymentMethods(uniquePaymentMethods);
    setPeople(uniquePeople);
  }, [transactions]);
  
  // Efecto para aplicar filtros y búsqueda
  useEffect(() => {
    let filtered = [...transactions];
    
    // Aplicar filtro por URL params si existen
    if (categoryFilter) {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    if (typeFilter) {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    if (personFilter) {
      filtered = filtered.filter(t => t.person === personFilter);
    }
    
    if (dateFilter) {
      const targetDate = new Date(dateFilter);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0];
      });
    }
    
    // Aplicar filtro por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }
    
    // Aplicar filtro por categoría
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    // Aplicar filtro por método de pago
    if (selectedPaymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === selectedPaymentMethod);
    }
    
    // Aplicar filtro por persona
    if (selectedPerson) {
      filtered = filtered.filter(t => t.person === selectedPerson);
    }
    
    // Aplicar filtro por rango de fechas
    if (selectedDateRange.from) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(selectedDateRange.from));
    }
    
    if (selectedDateRange.to) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(selectedDateRange.to));
    }
    
    // Aplicar búsqueda por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        t => 
          t.description.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term) ||
          t.paymentMethod.toLowerCase().includes(term) ||
          (t.person && t.person.toLowerCase().includes(term))
      );
    }
    
    // Aplicar ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const key = sortConfig.key as keyof Transaction;
        const aValue = a[key];
        const bValue = b[key];
        
        // Handle different types of values
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'ascending' 
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue);
        }
        
        if (typeof aValue === 'number') {
          return sortConfig.direction === 'ascending'
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
        
        // For dates
        if (key === 'date' && typeof aValue === 'string' && typeof bValue === 'string') {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortConfig.direction === 'ascending'
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }
        
        return 0;
      });
    }
    
    setFilteredTransactions(filtered);
    
    // Calcular estadísticas
    const totalIncome = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    setStats({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    });
    
  }, [
    transactions, 
    searchTerm, 
    selectedType, 
    selectedCategory, 
    selectedPaymentMethod, 
    selectedPerson, 
    selectedDateRange, 
    sortConfig,
    categoryFilter,
    typeFilter,
    personFilter,
    dateFilter
  ]);
  
  // Función para borrar una transacción
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    }
  };
  
  // Función para cambiar el ordenamiento
  const requestSort = (key: keyof Transaction) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Función para formatear montos
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };
  
  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Mostrar detalles de una transacción
  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };
  
  // Resetear todos los filtros
  const resetFilters = () => {
    setSelectedType('all');
    setSelectedCategory('');
    setSelectedPaymentMethod('');
    setSelectedPerson('');
    setSelectedDateRange({ from: '', to: '' });
    setSearchTerm('');
  };
  
  return (
    <div className="container mx-auto p-4">
      {/* Encabezado con estadísticas rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className="text-2xl font-bold mb-2 sm:mb-0">Transacciones</h1>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/transacciones/nueva" className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
              <Plus className="mr-2" size={20} /> Agregar
            </Link>
            
            <button 
              onClick={() => setShowStatsModal(true)}
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md"
            >
              <BarChart3 className="mr-2" size={20} /> Estadísticas
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">Ingresos</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-200">{formatCurrency(stats.totalIncome)}</p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">Gastos</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-200">{formatCurrency(stats.totalExpense)}</p>
          </div>
          
          <div className={`${stats.balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-orange-50 dark:bg-orange-900/30'} p-4 rounded-lg`}>
            <p className={`${stats.balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'} text-sm font-medium`}>Balance</p>
            <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600 dark:text-blue-200' : 'text-orange-600 dark:text-orange-200'}`}>
              {formatCurrency(stats.balance)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Barra de búsqueda y filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2.5 rounded-lg"
          >
            <Filter className="mr-2" size={20} />
            <span className="hidden sm:inline">Filtros</span>
          </button>
          
          {/* Botón de reseteo visible solo si hay filtros activos */}
          {(selectedType !== 'all' || selectedCategory || selectedPaymentMethod || selectedPerson || selectedDateRange.from || selectedDateRange.to || searchTerm) && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 p-2.5 rounded-lg"
            >
              <X className="mr-2" size={20} />
              <span className="hidden sm:inline">Limpiar filtros</span>
            </button>
          )}
        </div>
        
        {/* Panel de filtros - visible solo cuando se hace clic en el botón de filtros */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'income' | 'expense')}
              >
                <option value="all">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>
            
            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas</option>
                {categories.sort().map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* Filtro por método de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de pago</label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                <option value="">Todos</option>
                {paymentMethods.sort().map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            
            {/* Filtro por persona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Persona</label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
              >
                <option value="">Todas</option>
                {people.sort().map((person) => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>
            
            {/* Filtro por fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
              <input
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedDateRange.from}
                onChange={(e) => setSelectedDateRange({ ...selectedDateRange, from: e.target.value })}
              />
            </div>
            
            {/* Filtro por fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
              <input
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedDateRange.to}
                onChange={(e) => setSelectedDateRange({ ...selectedDateRange, to: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Lista de transacciones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('date')}
                  >
                    <div className="flex items-center">
                      Fecha
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'ascending' 
                          ? <ArrowUp size={14} className="ml-1" />
                          : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('description')}
                  >
                    <div className="flex items-center">
                      Descripción
                      {sortConfig.key === 'description' && (
                        sortConfig.direction === 'ascending' 
                          ? <ArrowUp size={14} className="ml-1" />
                          : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('category')}
                  >
                    <div className="flex items-center">
                      Categoría
                      {sortConfig.key === 'category' && (
                        sortConfig.direction === 'ascending' 
                          ? <ArrowUp size={14} className="ml-1" />
                          : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('amount')}
                  >
                    <div className="flex items-center">
                      Monto
                      {sortConfig.key === 'amount' && (
                        sortConfig.direction === 'ascending' 
                          ? <ArrowUp size={14} className="ml-1" />
                          : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                      <div className="flex items-center">
                        {transaction.description || <span className="text-gray-400 italic">Sin descripción</span>}
                        {transaction.attachment_id && (
                          <Paperclip size={16} className="ml-2 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {transaction.category}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => showTransactionDetails(transaction)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">No se encontraron transacciones</div>
            <Link href="/transacciones/nueva" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
              <Plus className="mr-2" size={20} /> Agregar transacción
            </Link>
          </div>
        )}
      </div>
      
      {/* Modal de estadísticas (implementación básica) */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Estadísticas</h2>
                <button onClick={() => setShowStatsModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                    <p className="text-green-700 dark:text-green-300 text-sm font-medium">Total Ingresos</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-200">{formatCurrency(stats.totalIncome)}</p>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">Total Gastos</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-200">{formatCurrency(stats.totalExpense)}</p>
                  </div>
                  
                  <div className={`${stats.balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-orange-50 dark:bg-orange-900/30'} p-4 rounded-lg`}>
                    <p className={`${stats.balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'} text-sm font-medium`}>Balance</p>
                    <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600 dark:text-blue-200' : 'text-orange-600 dark:text-orange-200'}`}>
                      {formatCurrency(stats.balance)}
                    </p>
                  </div>
                </div>
                
                {/* Aquí podrían agregarse más estadísticas o gráficos en el futuro */}
              </div>
              
              <div className="mt-8 text-right">
                <button 
                  onClick={() => setShowStatsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de detalles de transacción */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalles de la Transacción
                </h2>
                <button onClick={() => setShowTransactionModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                    <span className={`font-medium ${
                      selectedTransaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {selectedTransaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Monto:</span>
                    <span className={`font-medium ${
                      selectedTransaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(selectedTransaction.amount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formatDate(selectedTransaction.date)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {selectedTransaction.category}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Método de pago:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {selectedTransaction.paymentMethod}
                    </span>
                  </div>
                  
                  {selectedTransaction.person && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500 dark:text-gray-400">Persona:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-200">
                        {selectedTransaction.person}
                      </span>
                    </div>
                  )}
                  
                  {selectedTransaction.description && (
                    <div className="mt-4">
                      <span className="text-gray-500 dark:text-gray-400 block mb-1">Descripción:</span>
                      <p className="text-gray-900 dark:text-gray-200 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                        {selectedTransaction.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button 
                  onClick={() => {
                    handleDeleteTransaction(selectedTransaction.id);
                    setShowTransactionModal(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Eliminar
                </button>
                
                <button 
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 