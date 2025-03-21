'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  BarChart3,
  Receipt,
  PiggyBank,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import { SupabaseAuthProvider, useSupabaseAuth } from "@/lib/contexts/SupabaseAuthContext";

// Función auxiliar para manejar correctamente las rutas teniendo en cuenta el basePath
const getFullPath = (path: string) => {
  // En el cliente, window.appConfig estará definido por el script inyectado
  const config = typeof window !== 'undefined' ? (window as any).appConfig || { basePath: '', isBasepathHandled: false } :
    { basePath: '', isBasepathHandled: false };

  // Determinar si estamos en localhost o IP local
  const isLocalEnv = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     /^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname));

  // Si estamos en localhost o IP local, no usar basePath
  if (isLocalEnv) {
    return path;
  }

  // Si no hay basePath, retornar el path original
  if (!config.basePath) {
    return path;
  }

  // Verificar si ya tiene el basePath duplicado
  const basePathDuplicate = `${config.basePath}${config.basePath}`;
  if (path.startsWith(basePathDuplicate)) {
    return path.replace(basePathDuplicate, config.basePath);
  }

  // Verificar si ya tiene el basePath
  if (path.startsWith(config.basePath)) {
    return path;
  }

  // Agregar el basePath al path
  return `${config.basePath}${path}`;
};

// Componente personalizado de Link para manejar correctamente las rutas
export const CustomLink = ({ href, ...props }: React.ComponentProps<typeof Link>) => {
  const fullHref = getFullPath(href.toString());
  return <Link href={fullHref} {...props} />;
};

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSupabaseAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push(getFullPath('/login'));
  };

  // Skip rendering sidebar and header for login/register pages
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const loginPath = '/login';
  const resetPath = '/reset-password';

  if (pathname === loginPath || pathname === resetPath || 
      (basePath && (pathname === `${basePath}${loginPath}` || pathname === `${basePath}${resetPath}`))) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] border-r border-gray-800 shadow-lg transform transition-all duration-300 ${
          isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
      >
        {/* Logo and App Name */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800 bg-gradient-to-r from-purple-900/40 to-indigo-900/40">
          <CustomLink href="/" className="flex items-center">
            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md shadow-lg">
              <PiggyBank size={20} className="text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-white">Bolsillo App</span>
          </CustomLink>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-white focus:outline-none"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col p-4 space-y-2">
          <CustomLink
            href="/"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === getFullPath("/")
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <Home size={20} className="mr-3" />
            <span className="text-sm font-medium">Inicio</span>
          </CustomLink>
          <CustomLink
            href="/dashboard"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === getFullPath("/dashboard")
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <BarChart3 size={20} className="mr-3" />
            <span className="text-sm font-medium">Dashboard</span>
          </CustomLink>
          <CustomLink
            href="/transacciones"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === getFullPath("/transacciones") || pathname?.startsWith(getFullPath("/transacciones/"))
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <Receipt size={20} className="mr-3" />
            <span className="text-sm font-medium">Transacciones</span>
          </CustomLink>
          <CustomLink
            href="/comprobantes"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === getFullPath("/comprobantes")
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <DollarSign size={20} className="mr-3" />
            <span className="text-sm font-medium">Comprobantes</span>
          </CustomLink>
          <CustomLink
            href="/presupuestos"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === getFullPath("/presupuestos")
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <PiggyBank size={20} className="mr-3" />
            <span className="text-sm font-medium">Presupuestos</span>
          </CustomLink>
          <CustomLink
            href="/configuracion"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === getFullPath("/configuracion")
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <Settings size={20} className="mr-3" />
            <span className="text-sm font-medium">Configuración</span>
          </CustomLink>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user ? user.email?.split('@')[0] : 'Usuario'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'usuario@example.com'}
              </p>
            </div>
            <div>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      {isMobile && !isSidebarOpen && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#111827] border-b border-gray-800 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4">
            <CustomLink href="/" className="flex items-center">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md shadow-lg">
                <PiggyBank size={20} className="text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-white">Bolsillo App</span>
            </CustomLink>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-white bg-gradient-to-r from-purple-600/20 to-indigo-600/10 border border-purple-500/20 focus:outline-none"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 overflow-auto transition-all duration-300 bg-[#0f172a] ${
          isMobile
            ? isSidebarOpen
              ? "ml-0 backdrop-blur-sm"
              : "ml-0 mt-16"
            : "ml-64"
        }`}
      >
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {children}
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <Layout>{children}</Layout>
    </SupabaseAuthProvider>
  );
} 