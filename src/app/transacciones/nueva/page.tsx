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

export default function NuevaTransaccionPage() {
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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
      // Cargar configuración
      const savedSettings = localStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // Cargar categorías de gastos
      try {
        const savedExpenseCategories = localStorage.getItem('expenseCategories');
        if (savedExpenseCategories) {
          setExpenseCategories(JSON.parse(savedExpenseCategories));
        }
      } catch (error) {
        console.error("Error al cargar categorías de gastos:", error);
        setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
        localStorage.setItem('expenseCategories', JSON.stringify(DEFAULT_EXPENSE_CATEGORIES));
      }

      // Cargar categorías de ingresos
      try {
        const savedIncomeCategories = localStorage.getItem('incomeCategories');
        if (savedIncomeCategories) {
          setIncomeCategories(JSON.parse(savedIncomeCategories));
        }
      } catch (error) {
        console.error("Error al cargar categorías de ingresos:", error);
        setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
        localStorage.setItem('incomeCategories', JSON.stringify(DEFAULT_INCOME_CATEGORIES));
      }

      // Cargar métodos de pago
      try {
        const savedPaymentMethods = localStorage.getItem('paymentMethods');
        if (savedPaymentMethods) {
          setPaymentMethods(JSON.parse(savedPaymentMethods));
        }
      } catch (error) {
        console.error("Error al cargar métodos de pago:", error);
        setPaymentMethods(DEFAULT_PAYMENT_METHODS);
        localStorage.setItem('paymentMethods', JSON.stringify(DEFAULT_PAYMENT_METHODS));
      }

      // Cargar personas
      try {
        const savedPeople = localStorage.getItem('people');
        if (savedPeople) {
          setPeople(JSON.parse(savedPeople));
        }
      } catch (error) {
        console.error("Error al cargar personas:", error);
        setPeople(DEFAULT_PEOPLE);
        localStorage.setItem('people', JSON.stringify(DEFAULT_PEOPLE));
      }

      // Cargar comprobantes del localStorage al iniciar
      const savedComprobantes = localStorage.getItem('comprobantes');
      if (savedComprobantes) {
        const parsedComprobantes = JSON.parse(savedComprobantes);
        setAvailableComprobantes(parsedComprobantes);
        setFilteredComprobantes(parsedComprobantes);
      }
    };

    loadStoredData();
  }, []);

  // Actualizar el localStorage cuando cambian los valores
  useEffect(() => {
    localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem('incomeCategories', JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  useEffect(() => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    // Filtrar comprobantes cuando cambia el término de búsqueda
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

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setFormData({ ...formData, category: newCategory });
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleDeleteCategory = (category: string) => {
    const updatedCategories = categories.filter(c => c !== category);
    setCategories(updatedCategories);
    if (formData.category === category) {
      setFormData({ ...formData, category: '' });
    }
  };

  const handleEditCategory = (category: string) => {
    setEditingCategory(category);
    setNewCategory(category);
  };

  const handleSaveCategoryEdit = () => {
    if (newCategory && newCategory !== editingCategory) {
      const updatedCategories = categories.map(c => 
        c === editingCategory ? newCategory : c
      );
      setCategories(updatedCategories);
      if (formData.category === editingCategory) {
        setFormData({ ...formData, category: newCategory });
      }
      setEditingCategory(null);
      setNewCategory('');
    }
  };

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod && !paymentMethods.includes(newPaymentMethod)) {
      const updatedMethods = [...paymentMethods, newPaymentMethod];
      setPaymentMethods(updatedMethods);
      localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
      setFormData({ ...formData, paymentMethod: newPaymentMethod });
      setNewPaymentMethod('');
      setShowNewPaymentMethodInput(false);
    }
  };

  const handleDeletePaymentMethod = (method: string) => {
    const updatedMethods = paymentMethods.filter(m => m !== method);
    setPaymentMethods(updatedMethods);
    localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
    if (formData.paymentMethod === method) {
      setFormData({ ...formData, paymentMethod: '' });
    }
  };

  const handleEditPaymentMethod = (method: string) => {
    setEditingPaymentMethod(method);
    setNewPaymentMethod(method);
  };

  const handleSavePaymentMethodEdit = () => {
    if (newPaymentMethod && newPaymentMethod !== editingPaymentMethod) {
      const updatedMethods = paymentMethods.map(m => 
        m === editingPaymentMethod ? newPaymentMethod : m
      );
      setPaymentMethods(updatedMethods);
      localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
      if (formData.paymentMethod === editingPaymentMethod) {
        setFormData({ ...formData, paymentMethod: newPaymentMethod });
      }
      setEditingPaymentMethod(null);
      setNewPaymentMethod('');
    }
  };

  const handleAddPerson = () => {
    if (newPerson && !people.includes(newPerson)) {
      const updatedPeople = [...people, newPerson];
      setPeople(updatedPeople);
      localStorage.setItem('people', JSON.stringify(updatedPeople));
      setFormData({ ...formData, owner: newPerson });
      setNewPerson('');
      setShowNewPersonInput(false);
    }
  };

  const handleDeletePerson = (person: string) => {
    const updatedPeople = people.filter(p => p !== person);
    setPeople(updatedPeople);
    localStorage.setItem('people', JSON.stringify(updatedPeople));
    if (formData.owner === person) {
      setFormData({ ...formData, owner: '' });
    }
  };

  const handleEditPerson = (person: string) => {
    setEditingPerson(person);
    setNewPerson(person);
  };

  const handleSavePersonEdit = () => {
    if (newPerson && newPerson !== editingPerson) {
      const updatedPeople = people.map(p => 
        p === editingPerson ? newPerson : p
      );
      setPeople(updatedPeople);
      localStorage.setItem('people', JSON.stringify(updatedPeople));
      if (formData.owner === editingPerson) {
        setFormData({ ...formData, owner: newPerson });
      }
      setEditingPerson(null);
      setNewPerson('');
    }
  };

  const openComprobantesModal = () => {
    setShowComprobantesModal(true);
  };

  const closeComprobantesModal = () => {
    setShowComprobantesModal(false);
  };

  const selectComprobante = (id: string, fileName: string) => {
    setSelectedComprobante(id);
    setAttachment(fileName);
    closeComprobantesModal();
  };

  const removeAttachment = () => {
    setSelectedComprobante(null);
    setAttachment(null);
  };

  return (
    <div className="space-y-6 dark-theme">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {transactionType === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-md bg-gray-700 border-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2 border rounded-md bg-gray-700 border-gray-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-md bg-gray-700 border-gray-600"
                required
              />
            </div>

            {/* Categoría con gestión */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">
                  {transactionType === 'income' ? 'Categoría de Ingreso' : 'Categoría de Gasto'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  + Añadir nueva
                </button>
              </div>
              
              {showNewCategoryInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md bg-gray-700 border-gray-600"
                    placeholder="Nueva categoría"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-gray-700 border-gray-600"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  {categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {categories.map(category => (
                        <div 
                          key={category}
                          className="inline-flex items-center gap-1 text-xs bg-gray-700 px-2 py-1 rounded-md"
                        >
                          {editingCategory === category ? (
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-20 px-1 py-0.5 bg-gray-600 border border-gray-500 rounded"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={handleSaveCategoryEdit}
                                className="text-green-400 hover:text-green-300"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span>{category}</span>
                              <button
                                type="button"
                                onClick={() => handleEditCategory(category)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(category)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Método de pago/ingreso */}
            {transactionType === 'expense' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">
                    Método de Pago
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPaymentMethodInput(true)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    + Añadir nuevo
                  </button>
                </div>
                
                {showNewPaymentMethodInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPaymentMethod}
                      onChange={(e) => setNewPaymentMethod(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-700 border-gray-600"
                      placeholder="Nuevo método"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddPaymentMethod}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-gray-700 border-gray-600"
                      required
                    >
                      <option value="">Selecciona un método</option>
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    
                    {paymentMethods.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {paymentMethods.map(method => (
                          <div 
                            key={method}
                            className="inline-flex items-center gap-1 text-xs bg-gray-700 px-2 py-1 rounded-md"
                          >
                            {editingPaymentMethod === method ? (
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={newPaymentMethod}
                                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                                  className="w-20 px-1 py-0.5 bg-gray-600 border border-gray-500 rounded"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={handleSavePaymentMethodEdit}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span>{method}</span>
                                <button
                                  type="button"
                                  onClick={() => handleEditPaymentMethod(method)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePaymentMethod(method)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* "Quién pagó" o "Quién obtuvo el ingreso" - Solo si no vive solo */}
            {!settings.livingAlone && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">
                    {transactionType === 'income' ? '¿Quién obtuvo el ingreso?' : '¿Quién pagó?'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPersonInput(true)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    + Añadir persona
                  </button>
                </div>
                
                {showNewPersonInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPerson}
                      onChange={(e) => setNewPerson(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-700 border-gray-600"
                      placeholder="Nombre"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddPerson}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={formData.owner || ''}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-gray-700 border-gray-600"
                      required
                    >
                      <option value="">Selecciona una persona</option>
                      {people.map(person => (
                        <option key={person} value={person}>{person}</option>
                      ))}
                    </select>
                    
                    {people.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {people.map(person => (
                          <div 
                            key={person}
                            className="inline-flex items-center gap-1 text-xs bg-gray-700 px-2 py-1 rounded-md"
                          >
                            {editingPerson === person ? (
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={newPerson}
                                  onChange={(e) => setNewPerson(e.target.value)}
                                  className="w-20 px-1 py-0.5 bg-gray-600 border border-gray-500 rounded"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={handleSavePersonEdit}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span>{person}</span>
                                <button
                                  type="button"
                                  onClick={() => handleEditPerson(person)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePerson(person)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nueva sección para adjuntar comprobante */}
        <div className="bg-[#1e293b] p-5 rounded-lg border border-gray-800">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Comprobante</h3>
          
          {attachment ? (
            <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-gray-700">
              <div className="flex items-center">
                <FileText className="text-purple-400 mr-2" size={20} />
                <span className="text-gray-200">{attachment}</span>
              </div>
              <button 
                type="button"
                onClick={removeAttachment}
                className="p-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openComprobantesModal}
              className="w-full flex items-center justify-center gap-2 p-3 bg-[#0f172a] text-gray-300 rounded-lg border border-gray-700 hover:bg-[#111827] transition-colors"
            >
              <Paperclip size={20} />
              <span>Adjuntar comprobante</span>
            </button>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-6 py-2 rounded-md text-white ${
              transactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {transactionType === 'income' ? 'Guardar Ingreso' : 'Guardar Gasto'}
          </button>
        </div>
      </form>
      
      {/* Modal para seleccionar comprobante */}
      {showComprobantesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1e293b] w-full max-w-2xl max-h-[80vh] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100">Seleccionar comprobante</h2>
              <button 
                onClick={closeComprobantesModal}
                className="p-1.5 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0f172a] text-gray-200 pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                  placeholder="Buscar comprobante..."
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
              </div>
              
              <div className="overflow-y-auto max-h-[calc(80vh-12rem)]">
                {filteredComprobantes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredComprobantes.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => selectComprobante(comp.id, comp.fileName)}
                        className={`text-left flex items-start p-3 rounded-lg border hover:border-purple-500/50 transition-all ${
                          selectedComprobante === comp.id 
                            ? 'bg-purple-500/20 border-purple-500/50' 
                            : 'bg-[#0f172a] border-gray-800'
                        }`}
                      >
                        <FileText size={20} className="text-purple-400 mr-3 mt-0.5 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-medium text-gray-200 truncate">{comp.fileName}</p>
                          <p className="text-sm text-gray-400 truncate">{comp.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-3 bg-purple-500/10 rounded-full mb-3">
                      <FileText size={30} className="text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-1">No hay comprobantes</h3>
                    <p className="text-gray-500 max-w-sm mb-4">
                      {searchTerm ? 'No se encontraron comprobantes con ese término' : 'Agrega comprobantes en la sección correspondiente'}
                    </p>
                    <Link
                      href="/comprobantes"
                      className="flex items-center gap-2 py-2 px-4 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                    >
                      <Folder size={16} />
                      <span>Ir a Comprobantes</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-800 flex justify-end">
              <button
                onClick={closeComprobantesModal}
                className="py-2 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={closeComprobantesModal}
                className="py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white rounded-lg transition-colors"
                disabled={!selectedComprobante}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 