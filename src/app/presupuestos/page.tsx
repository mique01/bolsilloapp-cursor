'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Edit, Trash, Filter, ArrowRight, Calendar, PieChart, Save, X, Trash2
} from 'lucide-react';

type Budget = {
  id: string;
  category: string;
  amount: number;
  spent: number;
};

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
};

export default function PresupuestosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    category: '',
    amount: 0
  });
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showBudgetCategories, setShowBudgetCategories] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [budgetCategories, setBudgetCategories] = useState<string[]>([]);
  
  // Nueva forma de presupuesto
  const [formData, setFormData] = useState<Budget>({
    id: '',
    category: '',
    amount: 0,
    spent: 0
  });
  
  // Estado para editar
  const [isEditing, setIsEditing] = useState(false);

  // Cargar presupuestos y transacciones
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    const savedTransactions = localStorage.getItem('transactions');
    
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      setTransactions(parsedTransactions);
      
      // Obtener categorías únicas de gastos
      const uniqueCategories = Array.from(new Set<string>(
        parsedTransactions
          .filter((t: Transaction) => t.type === 'expense')
          .map((t: Transaction) => t.category)
      ));
      setCategories(uniqueCategories);
    }
  }, []);

  // Guardar datos cuando cambian
  useEffect(() => {
    if (budgets.length > 0) {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
    
    if (budgetCategories.length > 0) {
      localStorage.setItem('budget_categories', JSON.stringify(budgetCategories));
    }
  }, [budgets, budgetCategories]);

  // Calcular gastos por categoría
  const getSpentByCategory = (category: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.amount) return;

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      amount: newBudget.amount,
      spent: getSpentByCategory(newBudget.category)
    };

    const updatedBudgets = [...budgets, budget];
    setBudgets(updatedBudgets);
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    setNewBudget({ category: '', amount: 0 });
  };

  const handleDeleteBudget = (id: string) => {
    const updatedBudgets = budgets.filter(b => b.id !== id);
    setBudgets(updatedBudgets);
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
  };

  // Función para agregar nueva categoría
  const handleAddCategory = () => {
    if (newBudgetCategory && !budgetCategories.includes(newBudgetCategory)) {
      setBudgetCategories([...budgetCategories, newBudgetCategory]);
      setNewBudgetCategory('');
    }
  };

  // Función para eliminar categoría
  const handleDeleteCategory = (category: string) => {
    setBudgetCategories(budgetCategories.filter(cat => cat !== category));
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      id: '',
      category: '',
      amount: 0,
      spent: 0
    });
    setIsEditing(false);
    setShowForm(false);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      // Actualizar presupuesto existente
      const updatedBudgets = budgets.map(budget => 
        budget.id === formData.id ? formData : budget
      );
      setBudgets(updatedBudgets);
    } else {
      // Agregar nuevo presupuesto
      const newBudget = {
        ...formData,
        id: Date.now().toString(),
      };
      setBudgets([...budgets, newBudget]);
    }
    
    resetForm();
  };

  // Función para editar presupuesto
  const handleEdit = (budget: Budget) => {
    setFormData(budget);
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 dark-theme">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Presupuestos</h1>
      </div>

      {/* Formulario para agregar presupuesto */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-lg font-medium mb-4">Nuevo Presupuesto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select
              className="w-full px-4 py-2 border rounded-md bg-gray-700 border-gray-600"
              value={newBudget.category}
              onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monto</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-md bg-gray-700 border-gray-600"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({ ...newBudget, amount: Number(e.target.value) })}
            />
          </div>
        </div>
        <button
          onClick={handleAddBudget}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Agregar Presupuesto
        </button>
      </div>

      {/* Lista de presupuestos */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-lg font-medium mb-4">Presupuestos Actuales</h2>
        <div className="space-y-4">
          {budgets.map(budget => {
            const progress = (budget.spent / budget.amount) * 100;
            const isOverBudget = progress > 100;

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{budget.category}</h3>
                    <p className="text-sm text-gray-400">
                      ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
          {budgets.length === 0 && (
            <p className="text-gray-400 text-center py-4">
              No hay presupuestos configurados. Agrega uno para comenzar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const BudgetCard = ({ budget, onEdit, onDelete }: { 
  budget: Budget; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  const { category, amount, spent } = budget;
  
  const percentage = Math.min(100, Math.round((spent / amount) * 100));
  const remaining = amount - spent;
  const isOverBudget = remaining < 0;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-lg text-white">{category}</h3>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Presupuesto:</span>
          <span className="font-medium">${amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Gastado:</span>
          <span className={`font-medium ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
            ${spent.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Restante:</span>
          <span className={`font-medium ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
            ${remaining.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-3 bg-gray-700 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="mt-1 flex justify-between items-center text-xs text-gray-400">
        <span>{percentage}% usado</span>
        <span>{isOverBudget ? 'Excedido' : `${(100 - percentage)}% disponible`}</span>
      </div>
    </div>
  );
}; 