'use client';

import { useEffect, useState } from 'react';

/**
 * Componente para gestionar la conexión con Supabase
 * - Intenta cargar configuraciones de DNS y CORS desde archivos JSON
 * - Configura el entorno para usar proxies CORS si es necesario
 * - Muestra un indicador de estado de conexión
 */
export default function ConnectionManager() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [useProxy, setUseProxy] = useState<boolean>(false);

  useEffect(() => {
    async function checkAndConfigureConnection() {
      // Verificar si estamos en modo de compatibilidad
      const useDirectIp = localStorage.getItem('use_direct_ip') === 'true';
      setUseProxy(useDirectIp);

      // Intentar cargar configuración de DNS
      try {
        const dnsResponse = await fetch('/dns_config.json');
        if (dnsResponse.ok) {
          const dnsConfig = await dnsResponse.json();
          console.log('DNS config loaded:', dnsConfig);
          
          // Guardar la dirección IP para fallback
          if (dnsConfig.ip) {
            localStorage.setItem('supabase_direct_ip', dnsConfig.ip);
          }
        }
      } catch (error) {
        console.log('No DNS config available:', error);
      }

      // Intentar cargar configuración de CORS
      try {
        const corsResponse = await fetch('/cors_config.json');
        if (corsResponse.ok) {
          const corsConfig = await corsResponse.json();
          console.log('CORS proxies loaded:', corsConfig);
          
          // Guardar los proxies CORS para fallback
          if (corsConfig.proxies && corsConfig.proxies.length > 0) {
            localStorage.setItem('cors_proxies', JSON.stringify(corsConfig.proxies));
          }
        }
      } catch (error) {
        console.log('No CORS config available:', error);
      }

      // Intentar conexión para verificar estado
      try {
        const testUrl = 'https://cxfnamwzbfrdaahfsqkc.supabase.co/ping';
        const response = await fetch(testUrl, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
        });
        
        setConnectionStatus('connected');
        console.log('Conexión a Supabase verificada');
      } catch (error) {
        console.error('Error de conexión a Supabase:', error);
        
        // Si falla, activar modo de proxy
        if (!useDirectIp) {
          localStorage.setItem('use_direct_ip', 'true');
          setUseProxy(true);
          console.log('Activando modo de compatibilidad para conexión');
        }
        
        setConnectionStatus('error');
      }
    }

    checkAndConfigureConnection();
  }, []);

  // Solo mostrar indicador visual cuando hay problemas
  if (connectionStatus === 'connected' && !useProxy) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {connectionStatus === 'checking' && (
        <div className="bg-yellow-800 text-yellow-200 py-1 px-3 rounded-full text-xs flex items-center">
          <span className="animate-pulse mr-1">●</span>
          Verificando conexión...
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div className="bg-red-800 text-red-200 py-1 px-3 rounded-full text-xs flex items-center">
          <span className="mr-1">●</span>
          Error de conexión 
        </div>
      )}
      
      {useProxy && connectionStatus === 'connected' && (
        <div className="bg-blue-800 text-blue-200 py-1 px-3 rounded-full text-xs flex items-center">
          <span className="mr-1">●</span>
          Modo alternativo
        </div>
      )}
    </div>
  );
} 