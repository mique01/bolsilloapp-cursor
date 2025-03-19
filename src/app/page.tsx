'use client';

import { useState, useRef, useEffect } from 'react';
import { BarChart3, Receipt, PiggyBank, Settings, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import Link from 'next/link';
import { ArrowRight, Send, Loader2, Plus, ArrowDown, ArrowUp } from 'lucide-react';

const features = [
  {
    title: 'Dashboard',
    description: 'Visualiza tus finanzas con gráficos y estadísticas',
    icon: <BarChart3 className="h-8 w-8" />,
    link: '/dashboard',
    color: 'bg-blue-500'
  },
  {
    title: 'Transacciones',
    description: 'Registra y gestiona tus ingresos y gastos',
    icon: <Receipt className="h-8 w-8" />,
    link: '/transacciones',
    color: 'bg-green-500'
  },
  {
    title: 'Presupuestos',
    description: 'Establece y controla tus presupuestos mensuales',
    icon: <PiggyBank className="h-8 w-8" />,
    link: '/presupuestos',
    color: 'bg-purple-500'
  },
  {
    title: 'Configuración',
    description: 'Personaliza la aplicación a tus necesidades',
    icon: <Settings className="h-8 w-8" />,
    link: '/configuracion',
    color: 'bg-yellow-500'
  }
];

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

// Tipo para patrones de lenguaje aprendidos
type LearnedPattern = {
  phrase: string;          // Frase o palabra clave
  type: 'income' | 'expense'; // Tipo de transacción
  category?: string;       // Categoría asociada
  paymentMethod?: string;  // Método de pago asociado
  multiplier?: number;     // Multiplicador (para lucas, palos, etc.)
  context?: string;        // Contexto (salario, regalo, etc.)
  count: number;           // Contador de usos para reforzar el aprendizaje
};

export default function Home() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    {role: 'assistant', content: '¿Quieres que registre una transacción?'}
  ]);
  const [categories, setCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [learnedPatterns, setLearnedPatterns] = useState<LearnedPattern[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingTransaction, setPendingTransaction] = useState<Partial<Transaction> | null>(null);
  const [awaitingPaymentMethod, setAwaitingPaymentMethod] = useState(false);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions);
      const income = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      const expenses = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      setTotalIncome(income);
      setTotalExpenses(expenses);
      setBalance(income - expenses);
    }
  }, []);

  // Cargar categorías, métodos de pago y patrones aprendidos
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('expenseCategories');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        // Valores por defecto
        const defaultCategories = ['Comida', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Otros'];
        setCategories(defaultCategories);
        localStorage.setItem('expenseCategories', JSON.stringify(defaultCategories));
      }
      
      const savedIncomeCategories = localStorage.getItem('incomeCategories');
      if (savedIncomeCategories) {
        setIncomeCategories(JSON.parse(savedIncomeCategories));
      } else {
        // Valores por defecto
        const defaultIncomeCategories = ['Salario', 'Freelance', 'Regalo', 'Inversión', 'Otros'];
        setIncomeCategories(defaultIncomeCategories);
        localStorage.setItem('incomeCategories', JSON.stringify(defaultIncomeCategories));
      }
      
      const savedPaymentMethods = localStorage.getItem('paymentMethods');
      if (savedPaymentMethods) {
        setPaymentMethods(JSON.parse(savedPaymentMethods));
      } else {
        // Valores por defecto
        const defaultPaymentMethods = ['Efectivo', 'mercado pago', "debito", 'Transferencia', 'Otros'];
        setPaymentMethods(defaultPaymentMethods);
        localStorage.setItem('paymentMethods', JSON.stringify(defaultPaymentMethods));
      }
      
      // Cargar patrones aprendidos
      const savedPatterns = localStorage.getItem('learnedPatterns');
      if (savedPatterns) {
        setLearnedPatterns(JSON.parse(savedPatterns));
      } else {
        // Patrones por defecto para Argentina
        const defaultPatterns: LearnedPattern[] = [
          { phrase: 'palo', type: 'income', multiplier: 1000000, count: 5 },
          { phrase: 'palos', type: 'income', multiplier: 1000000, count: 5 },
          { phrase: 'lucas', type: 'income', multiplier: 1000, count: 5 },
          { phrase: 'luca', type: 'income', multiplier: 1000, count: 5 },
          { phrase: 'me mandó', type: 'income', category: 'Transferencia', paymentMethod: 'Transferencia', count: 5 },
          { phrase: 'le mande', type: 'expense', category: 'Transferencia', paymentMethod: 'Transferencia', count: 5 },
          { phrase: 'le mandé', type: 'expense', category: 'Transferencia', paymentMethod: 'Transferencia', count: 5 },
          { phrase: 'me mandaron', type: 'income', category: 'Transferencia', paymentMethod: 'Transferencia', count: 5 },
          { phrase: 'me transfirió', type: 'income', category: 'Transferencia', paymentMethod: 'Transferencia', count: 5 },
          { phrase: 'me transfirieron', type: 'income', category: 'Transferencia', paymentMethod: 'Transferencia', count: 5 },
          { phrase: 'sueldo', type: 'income', category: 'Salario', paymentMethod: 'Transferencia', context: 'salario', count: 5 },
          { phrase: 'salario', type: 'income', category: 'Salario', paymentMethod: 'Transferencia', context: 'salario', count: 5 },
          { phrase: 'me pagaron', type: 'income', category: 'Salario', context: 'salario', count: 5 },
          { phrase: 'cobré', type: 'income', category: 'Salario', context: 'salario', count: 5 },
          { phrase: 'gaste', type: 'expense', category: 'transferencia', paymentMethod: 'mercado pago', count: 5 }
        ];
        setLearnedPatterns(defaultPatterns);
        localStorage.setItem('learnedPatterns', JSON.stringify(defaultPatterns));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }, []);

  // Función para hacer scroll al final del chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función para guardar un nuevo patrón aprendido o actualizar uno existente
  const learnPattern = (pattern: Partial<LearnedPattern>, messageContext: string) => {
    if (!pattern.phrase) return;
    
    setLearnedPatterns(prevPatterns => {
      const existingPatternIndex = prevPatterns.findIndex(p => 
        p.phrase.toLowerCase() === pattern.phrase?.toLowerCase()
      );
      
      let newPatterns = [...prevPatterns];
      
      if (existingPatternIndex >= 0) {
        // Actualizar patrón existente
        newPatterns[existingPatternIndex] = {
          ...newPatterns[existingPatternIndex],
          ...pattern,
          count: newPatterns[existingPatternIndex].count + 1
        };
      } else {
        // Añadir nuevo patrón
        newPatterns.push({
          phrase: pattern.phrase,
          type: pattern.type || 'expense',
          category: pattern.category,
          paymentMethod: pattern.paymentMethod,
          multiplier: pattern.multiplier,
          context: pattern.context,
          count: 1
        } as LearnedPattern);
      }
      
      // Guardar patrones actualizados en localStorage
      localStorage.setItem('learnedPatterns', JSON.stringify(newPatterns));
      
      return newPatterns;
    });
  };

  // Función para procesar mensaje del usuario y detectar transacción
  const processMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase();

    // Si estamos esperando el método de pago
    if (awaitingPaymentMethod && pendingTransaction) {
      // Buscar método de pago en el mensaje
      let selectedMethod = '';
      const paymentKeywords: Record<string, string[]> = {
        'Efectivo': ['efectivo', 'cash', 'plata', 'billete'],
        'Tarjeta de crédito': ['credito', 'crédito', 'visa', 'mastercard', 'amex', 'american'],
        'Tarjeta de débito': ['debito', 'débito', 'banco', 'caja'],
        'Transferencia': ['transferencia', 'mp', 'mercado pago', 'homebanking', 'brubank', 'uala', 'cuenta']
      };

      for (const [method, keywords] of Object.entries(paymentKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          selectedMethod = method;
          break;
        }
      }

      // Si no encontramos método en las palabras clave, usar el mensaje como método personalizado
      if (!selectedMethod && message.trim()) {
        selectedMethod = message.trim();
      }

      // Completar la transacción con el método de pago
      const transaction: Transaction = {
        ...pendingTransaction,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        paymentMethod: selectedMethod
      } as Transaction;

      // Guardar en localStorage
      const savedTransactions = localStorage.getItem('transactions');
      const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
      transactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));

      // Actualizar saldos
      if (transaction.type === 'income') {
        setTotalIncome(prev => prev + transaction.amount);
        setBalance(prev => prev + transaction.amount);
      } else {
        setTotalExpenses(prev => prev + transaction.amount);
        setBalance(prev => prev - transaction.amount);
      }

      // Limpiar estados
      setPendingTransaction(null);
      setAwaitingPaymentMethod(false);

      return {
        success: true,
        transaction,
        message: `He registrado ${transaction.type === 'income' ? 'un ingreso' : 'un gasto'} de $${transaction.amount.toLocaleString()} en la categoría "${transaction.category}" usando ${selectedMethod}.`
      };
    }

    // Detectar si es un ingreso o un gasto basado en el contexto de "mandar"
    // Patrones específicos para transferencias
    const transferPatterns = {
      sent: /le\s+mand[eéó]/i,      // le mandé, le mande, le mandó
      received: /me\s+mand[óo]/i,    // me mandó, me mando
      sentTo: /mand[eéó]\s+a/i       // mandé a, mande a, mandó a
    };

    let isIncome = false;
    let isTransfer = false;
    let personInvolved = '';

    // Extraer persona mencionada en transferencias
    const extractPerson = () => {
      // Para "X me mandó" - buscar quién envía
      const senderMatch = message.match(/(\w+)\s+me\s+mand[óo]/i);
      if (senderMatch && senderMatch[1]) {
        return senderMatch[1];
      }
      
      // Para "le mandé a X" - buscar quién recibe
      const receiverMatch = message.match(/le\s+mand[eéó]\s+(?:a\s+)?(\w+)/i);
      if (receiverMatch && receiverMatch[1]) {
        return receiverMatch[1];
      }
      
      // Para "mandé a X" - buscar quién recibe
      const directReceiverMatch = message.match(/mand[eéó]\s+(?:a\s+)?(\w+)/i);
      if (directReceiverMatch && directReceiverMatch[1]) {
        return directReceiverMatch[1];
      }
      
      return '';
    };

    if (transferPatterns.received.test(message)) {
      isIncome = true;
      isTransfer = true;
      personInvolved = extractPerson();
    } else if (transferPatterns.sent.test(message) || transferPatterns.sentTo.test(message)) {
      isIncome = false;
      isTransfer = true;
      personInvolved = extractPerson();
    } else {
      // Usar la detección normal si no es una transferencia
      isIncome = /ingres[oéó]|cobr[eéó]|recib[íi]|me pag[oó]|me deposit[oó]|salario|sueldo|me transfiri[oó]|me envi[oó]/i.test(message);
    }

    // Determinar si es salario
    const isSalary = /salario|sueldo|pag[oóa] de|cobr[eéó] de|honorarios|fb|facebook|empresa|trabaj[oé]/i.test(message);

    // Detectar monto
    let amount = 0;
    
    // Detectar "palos" (millones)
    const palosRegex = /(\d+(?:\.\d+)?)\s*(?:palo|palos)/i;
    const palosMatch = message.match(palosRegex);
    
    if (palosMatch) {
      amount = parseFloat(palosMatch[1]) * 1000000;
    } else {
      // Detectar "lucas" o "luca" (miles)
      const lucasRegex = /(\d+(?:\.\d+)?)\s*(?:lucas?|mil|k|pesos|pe|ARS|\$)/i;
      const lucasMatch = message.match(lucasRegex);
      
      if (lucasMatch) {
        amount = parseFloat(lucasMatch[1]);
        if (/lucas?|k/i.test(lucasMatch[0])) {
          amount *= 1000;
        }
      } else {
        // Buscar cualquier número que pueda ser un monto
        const numberRegex = /(\d+(?:\.\d+)?)/;
        const numberMatch = message.match(numberRegex);
        if (numberMatch) {
          amount = parseFloat(numberMatch[1]);
        }
      }
    }

    // Si es una transferencia, establecer la categoría automáticamente
    let category = '';
    
    if (isTransfer) {
      category = 'Transferencia';
      
      // Si hay una persona involucrada, añadir esa información
      const description = personInvolved 
        ? (isIncome ? `Recibido de ${personInvolved}` : `Enviado a ${personInvolved}`) 
        : (isIncome ? 'Transferencia recibida' : 'Transferencia enviada');
      
      const transaction: Transaction = {
        id: Date.now().toString(),
        description: description,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        category: category,
        type: isIncome ? 'income' : 'expense',
        paymentMethod: 'Transferencia'
      };
      
      if (amount > 0) {
        // Guardar en localStorage
        const savedTransactions = localStorage.getItem('transactions');
        const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Actualizar saldos
        if (isIncome) {
          setTotalIncome(prev => prev + transaction.amount);
          setBalance(prev => prev + transaction.amount);
        } else {
          setTotalExpenses(prev => prev + transaction.amount);
          setBalance(prev => prev - transaction.amount);
        }
        
        return {
          success: true,
          transaction,
          message: `He registrado ${isIncome ? 'un ingreso' : 'un gasto'} de $${amount.toLocaleString()} por transferencia${personInvolved ? ` ${isIncome ? 'desde' : 'hacia'} ${personInvolved}` : ''}.`
        };
      }
    } else {
      // Determinar categoría analizando palabras clave
      if (isIncome) {
        if (isSalary) {
          // Si parece ser un salario, usar categoría de salario
          category = 'Salario';
        } else {
          // Buscar categoría de ingreso en el mensaje
          for (const cat of incomeCategories) {
            if (lowerMessage.includes(cat.toLowerCase())) {
              category = cat;
              break;
            }
          }
          
          // Si no encontramos categoría, usar la primera por defecto
          if (!category && incomeCategories.length > 0) {
            category = isSalary ? 'Salario' : incomeCategories[0];
          }
        }
      } else {
        // Palabras clave para gastos
        const keywordMap: Record<string, string[]> = {
          'Comida': ['super', 'mercado', 'supermercado', 'almacén', 'almacen', 'comida', 'restaurant', 'restaurante', 'cena', 'almuerzo', 'desayuno', 'cafetería', 'café', 'kiosco', 'verdulería', 'carnicería', 'panadería', 'comestibles', 'groceries', 'compras', 'dia', 'coto', 'chino', 'carrefour', 'walmart'],
          'Transporte': ['taxi', 'uber', 'cabify', 'didi', 'remis', 'colectivo', 'subte', 'tren', 'bondi', 'combustible', 'nafta', 'gasolina', 'sube', 'transporte'],
          'Servicios': ['luz', 'agua', 'gas', 'internet', 'wifi', 'teléfono', 'celular', 'alquiler', 'expensas', 'servicio', 'factura', 'boleta'],
          'Entretenimiento': ['cine', 'teatro', 'concierto', 'show', 'streaming', 'netflix', 'amazon', 'spotify', 'disney', 'juego', 'salida', 'bar', 'disco', 'boliche', 'fiesta'],
          'Salud': ['médico', 'medico', 'farmacia', 'remedio', 'medicamento', 'consulta', 'obra social', 'prepaga', 'hospital', 'clínica', 'dentista', 'psicólogo']
        };
        
        // Buscar coincidencias con palabras clave
        for (const [cat, keywords] of Object.entries(keywordMap)) {
          if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            category = cat;
            break;
          }
        }
        
        // Si no hay coincidencia, usar "Otros" o la última categoría
        if (!category && categories.length > 0) {
          const othersCategory = categories.find(cat => cat === 'Otros');
          category = othersCategory || categories[categories.length - 1];
        }
      }
    }

    // Crear la transacción si tenemos al menos un monto y categoría
    if (amount > 0 && category) {
      const partialTransaction: Partial<Transaction> = {
        description: generateDescription(message, category, isIncome),
        amount: amount,
        category: category,
        type: isIncome ? 'income' : 'expense'
      };

      // Si es un gasto y no es transferencia, preguntar método de pago
      if (!isIncome && !isTransfer) {
        setPendingTransaction(partialTransaction);
        setAwaitingPaymentMethod(true);
        return {
          success: false,
          message: "¿De qué manera abonaste?"
        };
      }

      // Si es ingreso (no transferencia), completar automáticamente
      const transaction: Transaction = {
        ...partialTransaction,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        paymentMethod: isTransfer ? 'Transferencia' : (paymentMethods.length > 0 ? paymentMethods[0] : 'Efectivo')
      } as Transaction;

      // Guardar en localStorage
      const savedTransactions = localStorage.getItem('transactions');
      const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
      transactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));

      // Actualizar saldos
      if (isIncome) {
        setTotalIncome(prev => prev + transaction.amount);
        setBalance(prev => prev + transaction.amount);
      } else {
        setTotalExpenses(prev => prev + transaction.amount);
        setBalance(prev => prev - transaction.amount);
      }

      return {
        success: true,
        transaction,
        message: `He registrado ${isIncome ? 'un ingreso' : 'un gasto'} de $${amount.toLocaleString()} en la categoría "${category}"${!isIncome ? ` usando ${transaction.paymentMethod}` : ''}.`
      };
    }

    return { 
      success: false, 
      message: "No pude identificar una transacción válida. Por favor, indica el monto y proporciona más detalles."
    };
  };

  // Generar descripción para la transacción
  const generateDescription = (message: string, category: string, isIncome: boolean) => {
    // Extraer palabras clave del mensaje, excluyendo las relacionadas con el monto
    const words = message.split(' ');
    const filteredWords = words.filter(word => 
      !word.match(/\d+|lucas|mil|pesos|ARS|\$/i) && 
      word.length > 3 && 
      !['para', 'como', 'donde', 'cuando', 'porque'].includes(word.toLowerCase())
    );
    
    // Si hay suficientes palabras, usar las más significativas
    if (filteredWords.length >= 2) {
      return filteredWords.slice(0, 3).join(' ');
    }
    
    // Fallback a descripción genérica basada en categoría
    return isIncome 
      ? `Ingreso - ${category}` 
      : `Gasto en ${category}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Agregar mensaje del usuario
    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Procesar mensaje
      const result = await processMessage(userMessage);
      
      // Respuesta del asistente
      setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
      
      // Si se registró una transacción, preguntar si quiere registrar otra
      if (result.success) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '¿Hay algo más que quieras registrar?' 
          }]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Hubo un error procesando tu mensaje. Por favor, intenta de nuevo.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 text-transparent bg-clip-text mb-4">
            Gestiona tus finanzas
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Simplifica el control de tus gastos e ingresos y toma decisiones financieras más inteligentes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-lg transform transition-all hover:shadow-xl hover:scale-[1.01]">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-100">Acciones rápidas</h2>
                  <Plus className="text-purple-400" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Link href="/transacciones/nueva?type=expense" 
                    className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-red-500/20 to-red-400/10 text-red-300 rounded-lg hover:from-red-500/30 hover:to-red-400/20 transition-all border border-red-500/20">
                    <ArrowDown size={20} />
                    <span className="font-medium">Nuevo Gasto</span>
                    <ArrowRight size={16} className="ml-auto" />
                  </Link>
                  <Link href="/transacciones/nueva?type=income" 
                    className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-green-500/20 to-green-400/10 text-green-300 rounded-lg hover:from-green-500/30 hover:to-green-400/20 transition-all border border-green-500/20">
                    <ArrowUp size={20} />
                    <span className="font-medium">Nuevo Ingreso</span>
                    <ArrowRight size={16} className="ml-auto" />
                  </Link>
                  <Link href="/dashboard" 
                    className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-blue-500/20 to-blue-400/10 text-blue-300 rounded-lg hover:from-blue-500/30 hover:to-blue-400/20 transition-all border border-blue-500/20">
                    <span className="font-medium">Ver Dashboard</span>
                    <ArrowRight size={16} className="ml-auto" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-lg transform transition-all hover:shadow-xl hover:scale-[1.01]">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Enlaces rápidos</h2>
              <div className="grid grid-cols-1 gap-3">
                <Link href="/transacciones" 
                  className="flex items-center justify-between p-3.5 bg-[#0f172a] rounded-lg hover:bg-[#151e33] transition-all border border-gray-800">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-200 font-medium">Transacciones</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-500" />
                </Link>
                <Link href="/comprobantes" 
                  className="flex items-center justify-between p-3.5 bg-[#0f172a] rounded-lg hover:bg-[#151e33] transition-all border border-gray-800">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-200 font-medium">Comprobantes</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-500" />
                </Link>
                <Link href="/presupuestos" 
                  className="flex items-center justify-between p-3.5 bg-[#0f172a] rounded-lg hover:bg-[#151e33] transition-all border border-gray-800">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-200 font-medium">Presupuestos</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-500" />
                </Link>
              </div>
            </div>
          </div>

          {/* Chat IA */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 p-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-gray-100">Asistente Financiero</h2>
              <p className="text-gray-400 text-sm">Registra transacciones conversando (ej: &quot;gasté 1 luca en el kiosco&quot;, &quot;papá me mandó 5 lucas&quot;)</p>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto max-h-[400px] space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3.5 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/20 text-gray-50 border border-purple-500/30' 
                        : 'bg-[#0f172a] text-gray-200 border border-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3.5 rounded-lg bg-[#0f172a] text-gray-200 border border-gray-800">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Ej: Gasté 1 luca en el super / Papá me mandó 5 lucas" 
                  className="flex-1 bg-[#0f172a] text-gray-200 p-3.5 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white p-3.5 rounded-lg transition-all disabled:opacity-50"
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
