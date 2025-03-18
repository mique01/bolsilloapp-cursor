'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/lib/contexts/SupabaseAuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useSupabaseAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      if (isRegistering) {
        // Validate password match
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        
        // Register the user
        const { user, error } = await signUp(email, password);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setSuccess('Cuenta creada con éxito. Por favor, verifica tu correo electrónico para activar tu cuenta.');
        setIsRegistering(false);
      } else {
        // Login the user
        const { user, error } = await signIn(email, password);
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Redirect to dashboard on successful login
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
        
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setSuccess(null);
            }}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isRegistering 
              ? '¿Ya tienes una cuenta? Inicia sesión' 
              : '¿No tienes una cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
} 