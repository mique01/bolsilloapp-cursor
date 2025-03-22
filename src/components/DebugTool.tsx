'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LifeBuoy, 
  Bug, 
  Wifi, 
  WifiOff, 
  Database, 
  Server, 
  Check, 
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Componente de depuración que muestra información en tiempo real
export function DebugTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [networkStatus, setNetworkStatus] = useState<boolean>(navigator.onLine);
  const router = useRouter();
  
  useEffect(() => {
    // Verificar estado de la red
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Monitorear supabase
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        // Intentar hacer un ping a Supabase
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const fetchPromise = fetch('https://cxfnamwzbfrdaahfsqkc.supabase.co/ping', {
          method: 'GET',
          mode: 'no-cors',
        });
        
        await Promise.race([fetchPromise, timeout]);
        setSupabaseStatus('online');
      } catch (error) {
        console.error('Error al verificar Supabase:', error);
        setSupabaseStatus('offline');
      }
    };
    
    checkSupabase();
    const interval = setInterval(checkSupabase, 30000); // Verificar cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);
  
  // Obtener datos de debug
  const fetchDebugData = async () => {
    try {
      const response = await fetch('/api/debug');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setDebugData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al obtener datos de depuración');
    }
  };
  
  // Abrir el panel de depuración
  const handleToggle = () => {
    if (!isOpen) {
      fetchDebugData();
    }
    setIsOpen(!isOpen);
  };
  
  // Reiniciar la aplicación
  const handleRestart = () => {
    // Limpiar localStorage
    localStorage.removeItem('auth_error');
    // Redirigir a la página principal
    router.push('/');
    // Forzar recarga para limpiar estado
    window.location.reload();
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón flotante de depuración */}
      <button 
        onClick={handleToggle}
        className="relative bg-gray-800 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg flex items-center"
        title="Herramientas de depuración"
      >
        <Bug size={20} />
        {supabaseStatus === 'offline' && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></span>
        )}
      </button>
      
      {/* Panel de depuración */}
      {isOpen && (
        <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-80 p-4 text-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Panel de Depuración</h3>
            <button onClick={handleToggle}>
              {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
          
          {/* Estado de conexión */}
          <div className="mb-4 border-b border-gray-700 pb-2">
            <div className="flex items-center mb-2">
              {networkStatus ? (
                <Wifi className="text-green-400 mr-2" size={16} />
              ) : (
                <WifiOff className="text-red-400 mr-2" size={16} />
              )}
              <span>Red: {networkStatus ? 'Conectado' : 'Desconectado'}</span>
            </div>
            
            <div className="flex items-center mb-2">
              <Database className="mr-2" size={16} color={
                supabaseStatus === 'online' ? '#4ade80' : 
                supabaseStatus === 'offline' ? '#f87171' : '#94a3b8'
              } />
              <span>Supabase: {
                supabaseStatus === 'online' ? 'Conectado' : 
                supabaseStatus === 'offline' ? 'Desconectado' : 'Verificando...'
              }</span>
            </div>
          </div>
          
          {/* Diagnósticos */}
          {error ? (
            <div className="text-red-400 text-sm mb-3">{error}</div>
          ) : debugData ? (
            <div className="mb-3 text-xs overflow-hidden">
              <div className="mb-1">
                <strong>Entorno:</strong> {debugData.systemInfo?.env || 'N/A'}
              </div>
              <div className="mb-1">
                <strong>Tiempo activo:</strong> {
                  debugData.systemInfo?.uptime 
                    ? `${Math.floor(debugData.systemInfo.uptime / 60)} min` 
                    : 'N/A'
                }
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
            </div>
          )}
          
          {/* Acciones */}
          <div className="flex justify-between mt-2">
            <button
              onClick={handleRestart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1 px-3 rounded"
            >
              Reiniciar App
            </button>
            
            <button
              onClick={fetchDebugData}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-3 rounded flex items-center"
            >
              <Server size={14} className="mr-1" /> Actualizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 