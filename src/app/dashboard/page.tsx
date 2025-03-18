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
import { ArrowUp, ArrowDown, Calendar, TrendingUp, Wallet, CreditCard, BarChart2 } from 'lucide-react';

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
};

type TimeRange = '7d' | '30d' | 'year' | 'all';

// Colores para categorías
const COLORS = ['#00E5BE', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#facc15'];

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isClient, setIsClient] = useState(false);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);

  // Establecer que estamos en el cliente después de montar
  useEffect(() => {
    setIsClient(true);
    
    // Añadir un pequeño retraso antes de mostrar el dashboard para una animación de carga
    const timer = setTimeout(() => {
      setDashboardLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Cargar transacciones y presupuestos
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Filtrar transacciones según el rango de tiempo
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return transactions;
    }
    
    return transactions.filter(t => new Date(t.date) >= cutoffDate);
  }, [transactions, timeRange]);

  // Calcular totales
  const totalIncome = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );
  
  const totalExpense = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const balance = totalIncome - totalExpense;

  // Datos para el gráfico por categoría
  const expensesByCategory = useMemo(() => {
    const categoryData: Record<string, number> = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (transaction.category) {
          categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
        }
      });
    
    return Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Datos para el gráfico por método de pago
  const expensesByMethod = useMemo(() => {
    const methodData: Record<string, number> = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const method = transaction.paymentMethod || 'Desconocido';
        methodData[method] = (methodData[method] || 0) + transaction.amount;
      });
    
    return Object.entries(methodData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Datos de gastos e ingresos por mes
  const monthlySummary = useMemo(() => {
    const monthData: Record<string, { income: number; expense: number }> = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Obtener los últimos 6 meses
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthNames[month.getMonth()];
      monthData[`${monthName}`] = { income: 0, expense: 0 };
    }
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthName = monthNames[date.getMonth()];
      
      // Solo procesar transacciones de los últimos 6 meses
      if (monthData[monthName]) {
        if (transaction.type === 'income') {
          monthData[monthName].income += transaction.amount;
        } else {
          monthData[monthName].expense += transaction.amount;
        }
      }
    });
    
    return Object.entries(monthData).map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense
    }));
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

  if (!isClient) {
    return null;
  }

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${dashboardLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-emerald-300 text-transparent bg-clip-text">Dashboard</h1>
        
        <div className="flex items-center space-x-2 bg-[#192132] rounded-lg p-1 border border-gray-800">
          <button 
            onClick={() => setTimeRange('7d')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              timeRange === '7d' 
                ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-cyan-300' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            7 días
          </button>
          <button 
            onClick={() => setTimeRange('30d')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              timeRange === '30d' 
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
              <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${balance.toLocaleString()}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${balance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className={`text-xs inline-flex gap-1 items-center ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {balance >= 0 ? <TrendingUp size={14} /> : <ArrowDown size={14} />}
              <span>Balance {timeRange === '7d' ? 'semanal' : timeRange === '30d' ? 'mensual' : timeRange === 'year' ? 'anual' : 'histórico'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#192132] p-5 rounded-xl border border-gray-800 shadow-sm transition-transform duration-300 hover:translate-y-[-2px]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 mb-1 text-sm">Ingresos</p>
              <p className="text-2xl font-semibold text-emerald-400">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
              <ArrowUp size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-xs inline-flex gap-1 items-center text-emerald-400">
              <Calendar size={14} />
              <span>{timeRange === '7d' ? 'Últimos 7 días' : timeRange === '30d' ? 'Últimos 30 días' : timeRange === 'year' ? 'Último año' : 'Histórico'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#192132] p-5 rounded-xl border border-gray-800 shadow-sm transition-transform duration-300 hover:translate-y-[-2px]">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 mb-1 text-sm">Gastos</p>
              <p className="text-2xl font-semibold text-red-400">
                ${totalExpense.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
              <ArrowDown size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-xs inline-flex gap-1 items-center text-red-400">
              <CreditCard size={14} />
              <span>{timeRange === '7d' ? 'Últimos 7 días' : timeRange === '30d' ? 'Últimos 30 días' : timeRange === 'year' ? 'Último año' : 'Histórico'}</span>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
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