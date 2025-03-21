'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { ArrowUp, ArrowDown, Calendar, TrendingUp, Wallet, CreditCard, BarChart2, Settings, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useSupabaseAuth } from '@/lib/contexts/SupabaseAuthContext';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  paymentMethod: string;
  receipt?: string;
  owner?: string;
};

type Budget = {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
};

type TimeRange = 'week' | 'month' | 'year' | 'all';

// Colores para categorías
const COLORS = ['#00E5BE', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#facc15'];

export default function DashboardPage() {
  const { user } = useSupabaseAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  // Establecer que estamos en el cliente después de montar
  useEffect(() => {
    // Añadir un pequeño retraso antes de mostrar el dashboard para una animación de carga
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      try {
        if (typeof window !== 'undefined') {
          const storedTransactions = localStorage.getItem('transactions');
          if (storedTransactions) {
            const parsedTransactions = JSON.parse(storedTransactions);
            setTransactions(parsedTransactions);
          }
          
          const storedBudgets = localStorage.getItem('budgets');
          if (storedBudgets) {
            const parsedBudgets = JSON.parse(storedBudgets);
            setBudgets(parsedBudgets);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate.setFullYear(1970);
        break;
    }
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= now;
    });
  }, [transactions, timeRange]);

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

  const expensesByCategory = useMemo(() => {
    if (!filteredTransactions.length) return [];
    
    const expensesMap = new Map<string, number>();
    
    filteredTransactions
      .filter(t => t.type === 'expense' && t.category)
      .forEach(t => {
        const category = t.category || 'Sin categoría';
        const currentAmount = expensesMap.get(category) || 0;
        expensesMap.set(category, currentAmount + t.amount);
      });
    
    const result = Array.from(expensesMap).map(([category, value]) => ({
      name: category,
      value
    }));
    
    return result.sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const expensesByMethod = useMemo(() => {
    if (!filteredTransactions.length) return [];
    
    const methodsMap = new Map<string, number>();
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const method = t.paymentMethod || 'Desconocido';
        const currentAmount = methodsMap.get(method) || 0;
        methodsMap.set(method, currentAmount + t.amount);
      });
    
    const result = Array.from(methodsMap).map(([method, value]) => ({
      name: method,
      value
    }));
    
    return result.sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    if (!filteredTransactions.length) return [];
    
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    
    // Inicializar los últimos 12 meses
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthKey, { income: 0, expenses: 0 });
    }
    
    // Sumar transacciones por mes
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyMap.has(monthKey)) {
        const currentData = monthlyMap.get(monthKey)!;
        
        if (t.type === 'income') {
          currentData.income += t.amount;
        } else {
          currentData.expenses += t.amount;
        }
        
        monthlyMap.set(monthKey, currentData);
      }
    });
    
    // Convertir a array y ordenar por fecha
    const result = Array.from(monthlyMap).map(([month, data]) => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('es', { month: 'short' });
      
      return {
        name: monthName,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses
      };
    });
    
    // Ordenar del más antiguo al más reciente (para que el gráfico muestre correctamente la evolución)
    return result.sort((a, b) => {
      const aDate = new Date(a.name);
      const bDate = new Date(b.name);
      return aDate.getTime() - bDate.getTime();
    }).slice(0, 6); // Mostrar solo los últimos 6 meses
  }, [filteredTransactions]);

  // Datos para ingresos y gastos diarios (últimos 7 días)
  const dailyData = useMemo(() => {
    const today = new Date();
    const dailyData: Record<string, { income: number; expense: number }> = {};
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    
    // Inicializar datos para los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayName = dayNames[date.getDay()];
      const dateKey = `${dayName} ${date.getDate()}`;
      
      dailyData[dateKey] = { income: 0, expense: 0 };
    }
    
    // Filtrar transacciones de los últimos 7 días
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    filteredTransactions
      .filter(t => new Date(t.date) >= sevenDaysAgo)
      .forEach(transaction => {
        const date = new Date(transaction.date);
        const dayName = dayNames[date.getDay()];
        const dateKey = `${dayName} ${date.getDate()}`;
        
        if (dailyData[dateKey]) {
          if (transaction.type === 'income') {
            dailyData[dateKey].income += transaction.amount;
          } else {
            dailyData[dateKey].expense += transaction.amount;
          }
        }
      });
    
    return Object.entries(dailyData).map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense
    }));
  }, [filteredTransactions]);

  // Datos de presupuestos vs gastos reales
  const budgetVsActualData = useMemo(() => {
    if (!budgets.length) return [];
    
    const categoryExpenses: Record<string, number> = {};
    
    // Calcular gastos por categoría para el período seleccionado
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (transaction.category) {
          categoryExpenses[transaction.category] = (categoryExpenses[transaction.category] || 0) + transaction.amount;
        }
      });
    
    // Combinar con datos de presupuesto
    return budgets.map(budget => ({
      category: budget.category,
      budget: budget.amount,
      actual: categoryExpenses[budget.category] || 0
    })).sort((a, b) => b.budget - a.budget);
    
  }, [budgets, filteredTransactions]);

  const CustomTooltip = ({active, payload, label}: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 mb-1">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name || entry.dataKey}: $${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-emerald-300 text-transparent bg-clip-text">Dashboard</h1>
        
        <div className="flex items-center space-x-2 bg-[#192132] rounded-lg p-1 border border-gray-800">
          <button 
            onClick={() => setTimeRange('week')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              timeRange === 'week' 
                ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-cyan-300' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            7 días
          </button>
          <button 
            onClick={() => setTimeRange('month')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              timeRange === 'month' 
                ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-cyan-300' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            30 días
          </button>
          <button 
            onClick={() => setTimeRange('year')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              timeRange === 'year' 
                ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-cyan-300' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            1 año
          </button>
          <button 
            onClick={() => setTimeRange('all')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              timeRange === 'all' 
                ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-cyan-300' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todo
          </button>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#192132] p-5 rounded-xl border border-gray-800 shadow-sm transition-transform duration-300 hover:translate-y-[-2px]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 mb-1 text-sm">Balance</p>
              <p className={`text-2xl font-semibold ${totals.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${totals.balance.toLocaleString()}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${totals.balance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className={`text-xs inline-flex gap-1 items-center ${totals.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totals.balance >= 0 ? <TrendingUp size={14} /> : <ArrowDown size={14} />}
              <span>Balance {timeRange === 'week' ? 'semanal' : timeRange === 'month' ? 'mensual' : timeRange === 'year' ? 'anual' : 'histórico'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#192132] p-5 rounded-xl border border-gray-800 shadow-sm transition-transform duration-300 hover:translate-y-[-2px]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 mb-1 text-sm">Ingresos</p>
              <p className="text-2xl font-semibold text-emerald-400">
                ${totals.income.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
              <ArrowUp size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-xs inline-flex gap-1 items-center text-emerald-400">
              <Calendar size={14} />
              <span>{timeRange === 'week' ? 'Últimos 7 días' : timeRange === 'month' ? 'Últimos 30 días' : timeRange === 'year' ? 'Último año' : 'Histórico'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#192132] p-5 rounded-xl border border-gray-800 shadow-sm transition-transform duration-300 hover:translate-y-[-2px]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 mb-1 text-sm">Gastos</p>
              <p className="text-2xl font-semibold text-red-400">
                ${totals.expenses.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
              <ArrowDown size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-xs inline-flex gap-1 items-center text-red-400">
              <CreditCard size={14} />
              <span>{timeRange === 'week' ? 'Últimos 7 días' : timeRange === 'month' ? 'Últimos 30 días' : timeRange === 'year' ? 'Último año' : 'Histórico'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos y gastos diarios */}
        <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 shadow-sm h-[350px]">
          <h3 className="text-lg text-gray-200 font-medium mb-6">Ingresos vs Gastos Diarios</h3>
          
          {dailyData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
                  <XAxis 
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ top: 0, right: 0 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    name="Ingresos" 
                    stroke="#00E5BE" 
                    strokeWidth={3}
                    dot={{ stroke: '#00E5BE', strokeWidth: 2, fill: '#111827', r: 4 }}
                    activeDot={{ r: 6, stroke: '#00E5BE', strokeWidth: 2, fill: '#fff' }}
                    animationDuration={1000}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    name="Gastos" 
                    stroke="#f43f5e" 
                    strokeWidth={3}
                    dot={{ stroke: '#f43f5e', strokeWidth: 2, fill: '#111827', r: 4 }}
                    activeDot={{ r: 6, stroke: '#f43f5e', strokeWidth: 2, fill: '#fff' }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
              <p>No hay datos registrados en los últimos 7 días</p>
            </div>
          )}
        </div>

        {/* Distribución de gastos por categoría */}
        <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 shadow-sm h-[350px]">
          <h3 className="text-lg text-gray-200 font-medium mb-6">Gastos por Categoría</h3>
          
          {expensesByCategory.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1000}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: '#555', strokeWidth: 1 }}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    content={<CustomTooltip />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
              <p>No hay gastos registrados en el período seleccionado</p>
            </div>
          )}
        </div>
        
        {/* Métodos de pago */}
        <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 shadow-sm h-[350px]">
          <h3 className="text-lg text-gray-200 font-medium mb-6">Métodos de Pago</h3>
          
          {expensesByMethod.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={expensesByMethod}
                  margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" />
                  <XAxis 
                    type="number" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    animationDuration={1000}
                  >
                    {expensesByMethod.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
              <p>No hay datos disponibles</p>
            </div>
          )}
        </div>
        
        {/* Categorías vs Presupuestos */}
        <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 shadow-sm h-[350px]">
          <h3 className="text-lg text-gray-200 font-medium mb-6">Categorías vs Presupuestos</h3>
          
          {budgetVsActualData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={budgetVsActualData}
                  margin={{ top: 10, right: 30, left: 70, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" />
                  <XAxis 
                    type="number" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ top: 0, right: 0 }}
                  />
                  <Bar 
                    dataKey="budget" 
                    name="Presupuesto" 
                    fill="#8b5cf6" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1000}
                  />
                  <Bar 
                    dataKey="actual" 
                    name="Gastado" 
                    fill="#00E5BE" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
              <p>No hay presupuestos configurados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 