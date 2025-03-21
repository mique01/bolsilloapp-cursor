'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Receipt } from 'lucide-react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/lib/contexts/SupabaseAuthContext';
import { updateTransaction } from '@/lib/services/supabaseDatabase';

export default function EditarTransaccion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');
  const { user } = useSupabaseAuth();
  
  // Estado para la transacción
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    paymentMethod: '',
    person: '',
    receipt: ''
  });
  
  // Estado para gestionar categorías y métodos de pago
  const [categories, setCategories] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para las opciones en los selects
  const [people, setPeople] = useState<string[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [originalTransaction, setOriginalTransaction] = useState<any>(null);

  // Estado para indicar si vive acompañado
  const [viveAcompanado, setViveAcompanado] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPerson, setNewPerson] = useState('');

  // Cargar datos existentes (categorías, métodos de pago, etc.)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!transactionId) {
          router.push('/transacciones');
          return;
        }

        // Cargar categorías del localStorage
        const storedCategories = localStorage.getItem('categories');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          // Si no hay categorías, crear algunas por defecto
          const defaultCategories = [
            'Alimentación', 'Transporte', 'Entretenimiento',
            'Salud', 'Educación', 'Hogar', 'Ropa', 'Servicios',
            'Sueldo', 'Inversiones', 'Otros'
          ];
          setCategories(defaultCategories);
          localStorage.setItem('categories', JSON.stringify(defaultCategories));
        }

        // Cargar métodos de pago del localStorage
        const storedPaymentMethods = localStorage.getItem('paymentMethods');
        if (storedPaymentMethods) {
          setPaymentMethods(JSON.parse(storedPaymentMethods));
        } else {
          // Si no hay métodos de pago, crear algunos por defecto
          const defaultPaymentMethods = [
            'Efectivo', 'Tarjeta de Débito', 'Tarjeta de Crédito',
            'Transferencia', 'Mercado Pago', 'Otro'
          ];
          setPaymentMethods(defaultPaymentMethods);
          localStorage.setItem('paymentMethods', JSON.stringify(defaultPaymentMethods));
        }

        // Cargar personas del localStorage
        const storedPeople = localStorage.getItem('people');
        if (storedPeople) {
          setPeople(JSON.parse(storedPeople));
        }

        // Cargar comprobantes del localStorage
        const storedReceipts = localStorage.getItem('comprobantes');
        if (storedReceipts) {
          setReceipts(JSON.parse(storedReceipts));
        }

        // Cargar preferencia de si vive acompañado
        const storedViveAcompanado = localStorage.getItem('viveAcompanado');
        if (storedViveAcompanado) {
          setViveAcompanado(JSON.parse(storedViveAcompanado));
        }

        // Cargar datos de la transacción a editar
        const storedTransactions = localStorage.getItem('transactions');
        if (storedTransactions) {
          const transactions = JSON.parse(storedTransactions);
          const transaction = transactions.find((t: any) => t.id === transactionId);

          if (transaction) {
            setOriginalTransaction(transaction);
            setFormData({
              type: transaction.type,
              amount: transaction.amount.toString(),
              date: transaction.date,
              description: transaction.description || '',
              category: transaction.category || '',
              paymentMethod: transaction.payment_method || '',
              person: transaction.person || '',
              receipt: transaction.receipt_id || ''
            });
          } else {
            setError('Transacción no encontrada');
            setTimeout(() => router.push('/transacciones'), 2000);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar datos. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [transactionId, router]);

  // Guardar categorías y métodos de pago
  const saveCategories = (updatedCategories: string[]) => {
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
  };

  const savePaymentMethods = (updatedMethods: string[]) => {
    localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
    setPaymentMethods(updatedMethods);
  };

  // Guardar personas
  const savePeople = (updatedPeople: string[]) => {
    localStorage.setItem('people', JSON.stringify(updatedPeople));
    setPeople(updatedPeople);
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Agregar nueva categoría
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    const updatedCategories = [...categories, newCategory.trim()];
    saveCategories(updatedCategories);
    setNewCategory('');
    setIsAddingCategory(false);
  };

  // Eliminar categoría
  const handleDeleteCategory = (category: string) => {
    const updatedCategories = categories.filter(c => c !== category);
    saveCategories(updatedCategories);
    
    if (formData.category === category) {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  // Agregar nuevo método de pago
  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.trim()) return;
    
    const updatedMethods = [...paymentMethods, newPaymentMethod.trim()];
    savePaymentMethods(updatedMethods);
    setNewPaymentMethod('');
    setIsAddingPaymentMethod(false);
  };

  // Eliminar método de pago
  const handleDeletePaymentMethod = (method: string) => {
    const updatedMethods = paymentMethods.filter(m => m !== method);
    savePaymentMethods(updatedMethods);
    
    if (formData.paymentMethod === method) {
      setFormData(prev => ({ ...prev, paymentMethod: '' }));
    }
  };

  // Función para agregar nueva persona
  const handleAddPerson = () => {
    if (!newPerson.trim()) return;
    
    const updatedPeople = [...people, newPerson.trim()];
    savePeople(updatedPeople);
    setNewPerson('');
    setIsAddingPerson(false);
  };

  // Función para eliminar persona
  const handleDeletePerson = (person: string) => {
    const updatedPeople = people.filter(p => p !== person);
    savePeople(updatedPeople);
    
    if (formData.person === person) {
      setFormData(prev => ({ ...prev, person: '' }));
    }
  };

  // Función para guardar preferencia de vive acompañado
  const handleViveAcompanadoChange = (value: boolean) => {
    setViveAcompanado(value);
    localStorage.setItem('viveAcompanado', JSON.stringify(value));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    if (!user) {
      setError('Debes iniciar sesión para editar una transacción');
      setIsSubmitting(false);
      return;
    }

    if (!transactionId || !originalTransaction) {
      setError('No se puede editar la transacción');
      setIsSubmitting(false);
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Debes ingresar un monto válido');
      setIsSubmitting(false);
      return;
    }

    if (!formData.date) {
      setError('Debes seleccionar una fecha');
      setIsSubmitting(false);
      return;
    }

    if (formData.type === 'expense' && !formData.category) {
      setError('Debes seleccionar una categoría para el gasto');
      setIsSubmitting(false);
      return;
    }

    if (!formData.paymentMethod) {
      setError('Debes seleccionar un método de pago');
      setIsSubmitting(false);
      return;
    }

    try {
      // Actualizar la transacción
      const updatedTransaction = {
        ...originalTransaction,
        type: formData.type as 'expense' | 'income',
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        category: formData.type === 'expense' ? formData.category : '',
        payment_method: formData.paymentMethod,
        person: formData.type === 'expense' && viveAcompanado ? formData.person : '',
        receipt_id: formData.receipt || null,
        updated_at: new Date().toISOString()
      };
      
      // Guardar en localStorage
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        const transactions = JSON.parse(storedTransactions);
        const updatedTransactions = transactions.map((t: any) => 
          t.id === transactionId ? updatedTransaction : t
        );
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      }
      
      // Guardar en Supabase
      const { data, error: supabaseError } = await updateTransaction(transactionId, updatedTransaction);
      
      if (supabaseError) {
        console.error('Error de Supabase:', supabaseError);
        // Continuamos con éxito ya que se guardó en localStorage
      }
      
      // Redirigir a la lista de transacciones
      router.push('/transacciones');
    } catch (err) {
      console.error('Error al actualizar la transacción:', err);
      setError('Error al actualizar la transacción. Inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 dark-theme">
      <div className="flex items-center gap-4">
        <Link href="/transacciones" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
          <ArrowLeft className="text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold">Editar Transacción</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Descripción */}
          <div className="col-span-full">
            <label className="block text-sm text-gray-400 mb-1">Descripción</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="¿Qué compraste o recibiste?"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tipo de transacción */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  formData.type === 'income'
                    ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500'
                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              >
                Ingreso
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  formData.type === 'expense'
                    ? 'bg-red-600/20 text-red-500 border border-red-500'
                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              >
                Gasto
              </button>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Categoría */}
          {formData.type === 'expense' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">Categoría</label>
                <button 
                  type="button" 
                  onClick={() => setIsAddingCategory(true)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  + Agregar nueva
                </button>
              </div>
              
              {isAddingCategory ? (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nueva categoría"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-3 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required={formData.type === 'expense'}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Gestión de categorías */}
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div key={category} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center text-sm">
                    <span className="mr-2">{category}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">Método de {formData.type === 'expense' ? 'pago' : 'ingreso'}</label>
              <button 
                type="button" 
                onClick={() => setIsAddingPaymentMethod(true)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                + Agregar nuevo
              </button>
            </div>
            
            {isAddingPaymentMethod ? (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nuevo método"
                />
                <button
                  type="button"
                  onClick={handleAddPaymentMethod}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingPaymentMethod(false)}
                  className="px-3 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar método</option>
                {paymentMethods.map((method, index) => (
                  <option key={index} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            )}
            
            {/* Gestión de métodos de pago */}
            <div className="mt-2 flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <div key={method} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center text-sm">
                  <span className="mr-2">{method}</span>
                  <button
                    type="button"
                    onClick={() => handleDeletePaymentMethod(method)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Persona (opcional) */}
          {formData.type === 'expense' && viveAcompanado && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">Quién realizó el gasto</label>
                <button 
                  type="button" 
                  onClick={() => setIsAddingPerson(true)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  + Agregar persona
                </button>
              </div>
              
              {isAddingPerson ? (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre de la persona"
                  />
                  <button
                    type="button"
                    onClick={handleAddPerson}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingPerson(false)}
                    className="px-3 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="person"
                  value={formData.person}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar persona</option>
                  {people.map((person, index) => (
                    <option key={index} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Gestión de personas */}
              <div className="mt-2 flex flex-wrap gap-2">
                {people.map((person) => (
                  <div key={person} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center text-sm">
                    <span className="mr-2">{person}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePerson(person)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comprobante (opcional) */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Comprobante (opcional)</label>
            <div className="flex gap-2">
              <select
                className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="receipt"
                value={formData.receipt}
                onChange={handleChange}
              >
                <option value="">Sin comprobante</option>
                {receipts.map((receipt) => (
                  <option key={receipt.id} value={receipt.id}>
                    {receipt.filename || receipt.description || receipt.id}
                  </option>
                ))}
              </select>
              <Link 
                href={`/comprobantes/nuevo?transactionId=${transactionId}`}
                className="p-2 bg-indigo-500/10 border border-indigo-500 text-indigo-400 rounded-md hover:bg-indigo-500/20"
              >
                <Receipt size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Configuración personal */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Configuración personal</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">¿Vives acompañado?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleViveAcompanadoChange(true)}
                className={`px-4 py-2 rounded-md ${
                  viveAcompanado
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500'
                    : 'bg-gray-700 text-gray-300 border border-gray-600'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => handleViveAcompanadoChange(false)}
                className={`px-4 py-2 rounded-md ${
                  !viveAcompanado
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500'
                    : 'bg-gray-700 text-gray-300 border border-gray-600'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md ${
              isSubmitting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Guardando...</span>
              </div>
            ) : (
              'Actualizar transacción'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 