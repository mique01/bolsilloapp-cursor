'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/lib/contexts/SupabaseAuthContext';
import { Eye, EyeOff, Mail, Lock, Wifi, WifiOff, Settings } from 'lucide-react';

// Componente contenedor con Suspense
const LoginPage = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
};

// Componente principal que usa hooks
const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useSupabaseAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [supabaseStatus, setSupabaseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Comprobar si llegamos aquí debido a un problema de conexión
  useEffect(() => {
    const redirectReason = searchParams.get('redirect_reason');
    if (redirectReason === 'auth_error') {
      setError('Se detectó un problema de conexión con el servidor de autenticación. Intenta usar el diagnóstico de conexión.');
      setShowDiagnostics(true);
    }
    
    // Verificar conexión a internet
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar conexión a Supabase
    checkSupabaseConnection();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [searchParams]);
  
  // Función para comprobar la conexión con Supabase
  const checkSupabaseConnection = async () => {
    setSupabaseStatus('connecting');
    
    try {
      // Intentar hacer un ping a Supabase
      const response = await fetch('https://cxfnamwzbfrdaahfsqkc.supabase.co/ping', {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' },
      });
      
      setSupabaseStatus('connected');
      return true;
    } catch (error) {
      console.error('Error al conectar con Supabase:', error);
      setSupabaseStatus('error');
      return false;
    }
  };
  
  // Función para solucionar problemas de conexión
  const fixConnectionIssues = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Guardar configuración para usar proxy CORS
      localStorage.setItem('use_direct_ip', 'true');
      localStorage.setItem('supabase_direct_ip', 'corsproxy.io/?https://cxfnamwzbfrdaahfsqkc.supabase.co');
      
      // Limpiar caché de autenticación
      localStorage.removeItem('supabase_auth_session');
      localStorage.removeItem('supabase-auth');
      
      // Verificar conexión nuevamente
      const connected = await checkSupabaseConnection();
      
      if (connected) {
        setSuccess('Configuración actualizada. Intenta iniciar sesión nuevamente.');
      } else {
        setError('No se pudo establecer conexión. Intenta usar una red diferente o contacta al soporte.');
      }
    } catch (error) {
      setError('Error al intentar solucionar la conexión: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    // Verificar conectividad primero
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError('Sin conexión a internet. Conéctate y vuelve a intentarlo.');
      setLoading(false);
      return;
    }
    
    try {
      if (isRegistering) {
        // Validate password match
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        // Register the user
        const error: any = await signUp(email, password);
        if (error) {
          throw new Error(error.message);
        }
        setSuccess('Cuenta creada con éxito. Por favor, verifica tu correo electrónico para activar tu cuenta.');
        setIsRegistering(false);
      } else {
        // Login the user
        try {
          console.log("Intentando iniciar sesión con:", email);
          
          // Establecer un timeout para la operación completa
          const loginPromise = signIn(email, password);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Tiempo de espera agotado. El servidor no responde.")), 20000);
          });
          
          // Usar Promise.race para manejar timeouts
          const error: any = await Promise.race([loginPromise, timeoutPromise]);

          if (error) {
            console.error("Error de inicio de sesión:", error);
            
            // Crear un mensaje de error más amigable basado en el tipo de error
            if (typeof error === 'object') {
              if (error.message) {
                if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
                  setError('Error de conexión con el servidor. Verifica tu conexión a Internet.');
                  setShowDiagnostics(true);
                } else if (error.message.includes('auth') || error.message.toLowerCase().includes('credentials')) {
                  setError('Error de autenticación. Verifica tus credenciales.');
                } else {
                  setError(error.message || 'Error al iniciar sesión');
                }
              } else {
                setError('Error desconocido al iniciar sesión');
              }
            } else {
              setError(String(error) || 'Error al iniciar sesión');
            }
            
            setLoading(false);
            return;
          }

          // Si llegamos aquí, el inicio de sesión fue exitoso
          console.log("Inicio de sesión exitoso, redirigiendo...");
          router.push('/');
        } catch (err: any) {
          console.error("Error en handleSubmit:", err);
          
          // Mostrar un mensaje más amigable según el tipo de error
          if (err instanceof Error) {
            if (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('timeout')) {
              setError('Error de conexión con el servidor. Verifica tu conexión a Internet y asegúrate de que la URL de Supabase sea accesible desde tu red.');
              setShowDiagnostics(true);
            } else if (err.message.toLowerCase().includes('credentials')) {
              setError('Credenciales incorrectas. Verifica tu email y contraseña.');
            } else {
              setError(err.message || 'Error al iniciar sesión');
            }
          } else {
            setError(String(err) || 'Error desconocido al iniciar sesión');
          }
          
          setLoading(false);
        }
      }
    } catch (err) {
      let errorMessage = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      } else if (err) {
        errorMessage = String(err);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Sección de diagnóstico de conexión
  const diagnosticsSection = showDiagnostics && (
    <div className="mt-8 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
      <h3 className="text-md font-medium text-gray-300 flex items-center">
        <Settings className="h-5 w-5 mr-2 text-indigo-400" />
        Diagnóstico de conexión
      </h3>
      
      <div className="mt-3 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Estado de la red:</span>
          <span className={`flex items-center ${networkStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>
            {networkStatus === 'online' ? (
              <><Wifi className="h-4 w-4 mr-1" /> Conectado</>
            ) : (
              <><WifiOff className="h-4 w-4 mr-1" /> Desconectado</>
            )}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Conexión a Supabase:</span>
          <span className={`
            ${supabaseStatus === 'connected' ? 'text-green-400' : ''}
            ${supabaseStatus === 'connecting' ? 'text-yellow-400' : ''}
            ${supabaseStatus === 'error' ? 'text-red-400' : ''}
          `}>
            {supabaseStatus === 'connected' ? 'Conectado' : 
             supabaseStatus === 'connecting' ? 'Verificando...' : 
             'Error de conexión'}
          </span>
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            onClick={fixConnectionIssues}
            disabled={loading || networkStatus === 'offline'}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading || networkStatus === 'offline'
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-indigo-700 hover:bg-indigo-800'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? 'Aplicando solución...' : 'Solucionar problemas de conexión'}
          </button>
        </div>
      </div>
    </div>
  );

  const testConnectionWithoutCORS = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('https://cxfnamwzbfrdaahfsqkc.supabase.co/ping', {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const endTime = performance.now();
      
      // ... existing code ...
    } catch (error) {
      // ... existing code ...
    }
  };

  if (showDiagnostics) {
    // Activar modo proxy para superar problemas de CORS
    localStorage.setItem('use_cors_proxy', 'true');
    localStorage.setItem('supabase_direct_ip', 'corsproxy.io/?https://cxfnamwzbfrdaahfsqkc.supabase.co');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="mt-2 text-gray-400">
            {isRegistering 
              ? 'Crea una cuenta para empezar a gestionar tus finanzas' 
              : 'Inicia sesión para acceder a tu cuenta'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-400 px-4 py-3 rounded-md">
            {error}
            {!showDiagnostics && error.includes('conexión') && (
              <button 
                onClick={() => setShowDiagnostics(true)}
                className="block mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Mostrar diagnóstico de conexión
              </button>
            )}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/40 border border-green-500 text-green-400 px-4 py-3 rounded-md">
            {success}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Correo electrónico
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-md bg-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-500 hover:text-gray-400 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {isRegistering && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirmar contraseña
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required={isRegistering}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
          </div>
          
          {!isRegistering && (
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link 
                  href="/reset-password" 
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading 
                  ? 'bg-indigo-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...'}
                </>
              ) : (
                isRegistering ? 'Crear cuenta' : 'Iniciar sesión'
              )}
            </button>
          </div>
        </form>
        
        {diagnosticsSection}
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setSuccess(null);
            }}
            className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
          >
            {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
          </button>
        </div>
        
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-gray-500 hover:text-gray-400 transition-colors text-xs"
          >
            {showDiagnostics ? 'Ocultar diagnóstico de conexión' : 'Mostrar diagnóstico de conexión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 