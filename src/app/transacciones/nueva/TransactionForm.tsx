'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, Edit2, Check, Users, User, FileText, Folder, X, Search, Paperclip } from 'lucide-react';
import Link from 'next/link';

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

// Valores predeterminados
const DEFAULT_EXPENSE_CATEGORIES = ['Comida', 'Transporte', 'Servicios', 'Entretenimiento'];
const DEFAULT_INCOME_CATEGORIES = ['Sueldo', 'Ventas', 'Inversiones', 'Otros'];
const DEFAULT_PAYMENT_METHODS = ['Efectivo', 'Tarjeta de crédito', 'Transferencia'];
const DEFAULT_PEOPLE = ['Yo', 'Pareja', 'Familiar'];

export default function TransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionType = searchParams.get('type') || 'expense';

  // Generar la fecha actual en timezone Argentina (GMT-3)
  const getCurrentDateInArgentina = () => {
    const now = new Date();
    // Ajustar a GMT-3 (hora de Argentina)
    const argentinaTime = new Date(now.getTime() - (now.getTimezoneOffset() + 180) * 60000);
    return argentinaTime.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    date: getCurrentDateInArgentina(),
    category: '',
    type: transactionType as 'income' | 'expense',
    paymentMethod: '',
    owner: ''
  });

  const [expenseCategories, setExpenseCategories] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(DEFAULT_INCOME_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(DEFAULT_PAYMENT_METHODS);
  const [people, setPeople] = useState<string[]>(DEFAULT_PEOPLE);
  const [settings, setSettings] = useState<{ livingAlone: boolean }>({ livingAlone: true });
  
  const [newCategory, setNewCategory] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newPerson, setNewPerson] = useState('');
  
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewPaymentMethodInput, setShowNewPaymentMethodInput] = useState(false);
  const [showNewPersonInput, setShowNewPersonInput] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateInArgentina());
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [person, setPerson] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  
  // Estado para gestionar la modal de comprobantes
  const [showComprobantesModal, setShowComprobantesModal] = useState(false);
  const [availableComprobantes, setAvailableComprobantes] = useState<any[]>([]);
  const [selectedComprobante, setSelectedComprobante] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComprobantes, setFilteredComprobantes] = useState<any[]>([]);

  // Referencia a las categorías activas según el tipo de transacción
  const categories = transactionType === 'expense' ? expenseCategories : incomeCategories;
  const setCategories = (newCategories: string[]) => {
    if (transactionType === 'expense') {
      setExpenseCategories(newCategories);
      localStorage.setItem('expenseCategories', JSON.stringify(newCategories));
    } else {
      setIncomeCategories(newCategories);
      localStorage.setItem('incomeCategories', JSON.stringify(newCategories));
    }
  };

  // Cargar datos guardados al inicio
  useEffect(() => {
    const loadStoredData = () => {
      try {
        // Cargar configuración
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }

        // Cargar categorías de gastos
        const savedExpenseCategories = localStorage.getItem('expenseCategories');
        if (savedExpenseCategories) {
          setExpenseCategories(JSON.parse(savedExpenseCategories));
        }

        // Cargar categorías de ingresos
        const savedIncomeCategories = localStorage.getItem('incomeCategories');
        if (savedIncomeCategories) {
          setIncomeCategories(JSON.parse(savedIncomeCategories));
        }

        // Cargar métodos de pago
        const savedPaymentMethods = localStorage.getItem('paymentMethods');
        if (savedPaymentMethods) {
          setPaymentMethods(JSON.parse(savedPaymentMethods));
        }

        // Cargar personas
        const savedPeople = localStorage.getItem('people');
        if (savedPeople) {
          setPeople(JSON.parse(savedPeople));
        }

        // Cargar comprobantes
        const savedComprobantes = localStorage.getItem('comprobantes');
        if (savedComprobantes) {
          const parsedComprobantes = JSON.parse(savedComprobantes);
          setAvailableComprobantes(parsedComprobantes);
          setFilteredComprobantes(parsedComprobantes);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    if (typeof window !== 'undefined') {
      loadStoredData();
    }
  }, []);

  // Filtrar comprobantes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredComprobantes(availableComprobantes);
    } else {
      const filtered = availableComprobantes.filter(comp => 
        comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredComprobantes(filtered);
    }
  }, [searchTerm, availableComprobantes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !paymentMethod) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      date,
      description,
      category,
      type: transactionType as 'income' | 'expense',
      paymentMethod,
      person: person || undefined,
      attachmentId: selectedComprobante || undefined
    };

    // Guardar en localStorage
    const savedTransactions = localStorage.getItem('transactions');
    const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    router.push('/transacciones');
  };

  // Función para editar una categoría
  const handleEditCategory = (category: string) => {
    setEditingCategory(category);
    setNewCategory(category);
  };

  // Función para eliminar una categoría
  const handleDeleteCategory = (category: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      const updatedCategories = categories.filter(cat => cat !== category);
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
    }
  };

  // Función para guardar la edición de una categoría
  const handleSaveCategoryEdit = () => {
    if (editingCategory && newCategory.trim()) {
      const updatedCategories = categories.map(cat => 
        cat === editingCategory ? newCategory.trim() : cat
      );
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      setEditingCategory(null);
      setNewCategory('');
    }
  };

  // Función para agregar una nueva categoría
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      setNewCategory('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {transactionType === 'expense' ? 'Nuevo Gasto' : 'Nuevo Ingreso'}
        </h1>
        <div className="flex space-x-4">
          <Link 
            href="/transacciones/nueva?type=expense"
            className={`px-4 py-2 rounded-md ${transactionType === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            Gasto
          </Link>
          <Link 
            href="/transacciones/nueva?type=income"
            className={`px-4 py-2 rounded-md ${transactionType === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            Ingreso
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo de monto */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Monto*
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        {/* Campo de fecha */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Fecha*
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Campo de descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Descripción
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="Descripción de la transacción"
          />
        </div>

        {/* Campo de categoría */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="category" className="block text-sm font-medium">
              Categoría*
            </label>
            <button
              type="button"
              onClick={() => setShowNewCategoryInput(true)}
              className="text-indigo-600 hover:text-indigo-500 text-sm flex items-center"
            >
              <Plus size={16} className="mr-1" /> Agregar
            </button>
          </div>
          
          {/* Lista de categorías */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-2">
            {categories.map((cat) => (
              <div 
                key={cat}
                className={`relative p-2 border rounded-md cursor-pointer flex items-center justify-between ${
                  category === cat 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900 dark:border-indigo-400' 
                    : 'border-gray-300 hover:border-indigo-300 dark:border-gray-600 dark:hover:border-indigo-600'
                }`}
                onClick={() => setCategory(cat)}
              >
                <span className="block truncate">{cat}</span>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(cat);
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat);
                    }}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Input para agregar/editar categoría */}
          {showNewCategoryInput && (
            <div className="mt-2 flex">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-l-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Nueva categoría"
              />
              <button
                type="button"
                onClick={editingCategory ? handleSaveCategoryEdit : handleAddCategory}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-none rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingCategory ? <Check size={16} /> : <Plus size={16} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCategoryInput(false);
                  setEditingCategory(null);
                  setNewCategory('');
                }}
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="pt-4 flex justify-between">
          <Link
            href="/transacciones"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              transactionType === 'expense' 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            Guardar {transactionType === 'expense' ? 'Gasto' : 'Ingreso'}
          </button>
        </div>
      </form>
    </div>
  );
} 