'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Receipt, 
  PiggyBank, 
  Settings, 
  Menu, 
  X,
  Home,
  FileText,
  LogOut,
  User
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const pathname = usePathname();

  // Verificar si estamos en escritorio (ancho > 768px)
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  // Clases dinámicas para el sidebar
  const sidebarClasses = `fixed inset-y-0 left-0 z-50 bg-[#111827] shadow-lg shadow-black/20 transform transition-all duration-300 ease-in-out 
    ${isDesktop 
      ? isSidebarHovered || isSidebarOpen 
        ? 'w-64' 
        : 'w-16' // En escritorio, solo mostrar iconos cuando no hover
      : isSidebarOpen 
        ? 'w-64 translate-x-0' 
        : 'w-0 -translate-x-full' // En móvil, ocultar completamente
    } overflow-hidden`;

  return (
    <div className="min-h-screen bg-[#0f1623] text-white">
      {/* Sidebar */}
      <div 
        className={sidebarClasses}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo y Perfil */}
          <div className="p-4 border-b border-gray-800 overflow-hidden whitespace-nowrap">
            {(isSidebarHovered || isSidebarOpen || !isDesktop) ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-white font-bold text-lg transition-all duration-300">
                  B
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-emerald-300 text-transparent bg-clip-text transition-all duration-300">
                  Bolsillo App
                </h1>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-white font-bold text-lg transition-all duration-300">
                  B
                </div>
              </div>
            )}
          </div>

          {/* Perfil de usuario */}
          <div className={`mt-4 px-4 py-2 ${!(isSidebarHovered || isSidebarOpen) && isDesktop ? 'hidden' : 'block'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                <User size={18} className="text-gray-300" />
              </div>
              <div className={`transition-opacity duration-300 ${
                !(isSidebarHovered || isSidebarOpen) && isDesktop ? 'opacity-0' : 'opacity-100'
              }`}>
                <p className="text-sm font-medium text-gray-200">Usuario</p>
                <p className="text-xs text-gray-400">Cuenta Personal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-x-hidden mt-4">
            <Link 
              href="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === '/' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300' 
                  : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
              }`}
              title="Inicio"
            >
              <Home size={19} className="min-w-5 transition-transform duration-300 ease-out" />
              <span className={`transition-all duration-300 ${
                !(isSidebarHovered || isSidebarOpen) && isDesktop ? 'w-0 opacity-0' : 'opacity-100'
              }`}>Inicio</span>
            </Link>
            <Link 
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === '/dashboard' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300' 
                  : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
              }`}
              title="Dashboard"
            >
              <BarChart3 size={19} className="min-w-5 transition-transform duration-300 ease-out" />
              <span className={`transition-all duration-300 ${
                !(isSidebarHovered || isSidebarOpen) && isDesktop ? 'w-0 opacity-0' : 'opacity-100'
              }`}>Dashboard</span>
            </Link>
            <Link 
              href="/transacciones"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === '/transacciones' || pathname.startsWith('/transacciones/') 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300' 
                  : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
              }`}
              title="Transacciones"
            >
              <Receipt size={19} className="min-w-5 transition-transform duration-300 ease-out" />
              <span className={`transition-all duration-300 ${
                !(isSidebarHovered || isSidebarOpen) && isDesktop ? 'w-0 opacity-0' : 'opacity-100'
              }`}>Transacciones</span>
            </Link>
            <Link 
              href="/presupuestos"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === '/presupuestos' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300' 
                  : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
              }`}
              title="Presupuestos"
            >
              <PiggyBank size={19} className="min-w-5 transition-transform duration-300 ease-out" />
              <span className={`transition-all duration-300 ${
                !(isSidebarHovered || isSidebarOpen) && isDesktop ? 'w-0 opacity-0' : 'opacity-100'
              }`}>Presupuestos</span>
            </Link>
            <Link 
              href="/comprobantes"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === '/comprobantes' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300' 
                  : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
              }`}
              title="Comprobantes"
            >
              <FileText size={19} className="min-w-5 transition-transform duration-300 ease-out" />
              <span className={`transition-all duration-300 ${
                !(isSidebarHovered || isSidebarOpen) && isDesktop ? 'w-0 opacity-0' : 'opacity-100'
              }`}>Comprobantes</span>
            </Link>
            
            <div className="pt-4 mt-4 border-t border-gray-800">
              <Link 
                href="/configuracion"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  pathname === '/configuracion' 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300' 
                    : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
                }`}
                title="Configuración"
              >
                <Settings size={19} className="min-w-5 transition-transform duration-300 ease-out" />
                <span className={`transition-all duration-300 ${
                  !(isSidebarHovered || isSidebarOpen) && isDesktop ? 'w-0 opacity-0' : 'opacity-100'
                }`}>Configuración</span>
              </Link>
            </div>
          </nav>
          
          {/* Logout */}
          <div className="p-3 mb-2 border-t border-gray-800">
            <button 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 
              text-gray-400 hover:bg-gray-800/80 hover:text-white`}
            >
              <LogOut size={19} className="min-w-5" />
              <span className={`transition-all duration-300 ${
                !(isSidebarHovered || isSidebarOpen) && isDesktop ? 'w-0 opacity-0' : 'opacity-100'
              }`}>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Button to toggle sidebar (mobile only) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 left-6 z-50 p-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full text-white shadow-lg md:hidden"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Main content */}
      <div className={`pt-4 transition-all duration-300 ${isDesktop ? (isSidebarHovered || isSidebarOpen ? 'md:ml-64' : 'md:ml-16') : ''}`}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {children}
        </main>
      </div>
    </div>
  );
} 