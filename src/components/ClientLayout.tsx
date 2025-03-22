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
  LifeBuoy,
} from "lucide-react";
import { SupabaseAuthProvider, useSupabaseAuth } from "@/lib/contexts/SupabaseAuthContext";
import { DebugTool } from './DebugTool';

// Componente simple de carga
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900">
    <div className="animate-spin h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
  </div>
);

// Layout principal simple
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-900">{children}</div>
);

// Navbar simple
const Navbar = ({ 
  showMenu, 
  setShowMenu 
}: { 
  showMenu: boolean; 
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>; 
}) => (
  <div className="fixed top-0 left-0 right-0 z-40 bg-gray-800 border-b border-gray-700">
    <div className="flex items-center justify-between h-16 px-4">
      <Link href="/" className="flex items-center">
        <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md shadow-lg">
          <PiggyBank size={20} className="text-white" />
        </div>
        <span className="ml-2 text-lg font-semibold text-white">Bolsillo App</span>
      </Link>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-gray-400 hover:text-white focus:outline-none md:hidden"
      >
        {showMenu ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  </div>
);

// Sidebar simple
const Sidebar = ({ showMenu }: { showMenu: boolean }) => {
  const pathname = usePathname();
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/transacciones', label: 'Transacciones', icon: Receipt },
    { path: '/comprobantes', label: 'Comprobantes', icon: DollarSign },
    { path: '/presupuestos', label: 'Presupuestos', icon: PiggyBank },
  ];
  
  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 border-r border-gray-700 shadow-lg transform transition-all duration-300 pt-16
      ${showMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <nav className="flex flex-col p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === item.path
                  ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon size={20} className="mr-3" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

// Función auxiliar para manejar correctamente las rutas
const getFullPath = (path: string) => {
  // En el cliente, window.appConfig estará definido por el script inyectado
  const config = typeof window !== 'undefined' ? (window as any).appConfig || { basePath: '', isBasepathHandled: false } :
    { basePath: '', isBasepathHandled: false };

  // Determinar si estamos en localhost o IP local
  const isLocalEnv = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     /^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname));

  // Si estamos en localhost o IP local, siempre retornar el path sin prefijo
  if (isLocalEnv) {
    // Si el path comienza con /bolsilloapp-cursor, quitarlo
    if (path.startsWith('/bolsilloapp-cursor')) {
      return path.replace('/bolsilloapp-cursor', '');
    }
    return path;
  }

  // Para GitHub Pages
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    // Asegurarse de que el path tenga el prefijo correcto
    if (!path.startsWith('/bolsilloapp-cursor') && !path.startsWith('bolsilloapp-cursor')) {
      // Si es la ruta raíz, manejarla especialmente
      if (path === '/' || path === '') {
        return '/bolsilloapp-cursor';
      }
      return `/bolsilloapp-cursor${path.startsWith('/') ? path : `/${path}`}`;
    }
    return path;
  }

  // Para otros entornos (como Vercel), simplemente usar la ruta sin modificar
  return path;
};

// Componente personalizado de Link para manejar correctamente las rutas
export const CustomLink = ({ href, ...props }: React.ComponentProps<typeof Link>) => {
  const fullHref = getFullPath(href.toString());
  return <Link href={fullHref} {...props} />;
};

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoggedIn, isLoading } = useSupabaseAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConnectionDebug, setShowConnectionDebug] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Definir rutas públicas que no requieren autenticación
  const authPaths = ['/login', '/reset-password'];

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

  useEffect(() => {
    // Detect network errors that might indicate connection problems
    const hasConnectionErrors = localStorage.getItem('auth_error') !== null;
    
    // Show connection debug after multiple errors
    if (hasConnectionErrors) {
      const errorData = JSON.parse(localStorage.getItem('auth_error') || '{}');
      const errorTime = new Date(errorData.timestamp || 0);
      const now = new Date();
      
      // Only show debug button if error happened in the last hour
      if (now.getTime() - errorTime.getTime() < 60 * 60 * 1000) {
        setShowConnectionDebug(true);
      }
    }
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

  // Mostrar loading mientras se carga la sesión
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado y no es una página de autenticación, redireccionar a login
  if (!isLoggedIn && !authPaths.includes(pathname || '')) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return <LoadingScreen />;
  }

  return (
    <MainLayout>
      <Navbar showMenu={showMenu} setShowMenu={setShowMenu} />
      <div className="flex h-screen pt-16">
        <Sidebar showMenu={showMenu} />
        <main className="flex-1 p-4 lg:p-8 overflow-auto ml-0 md:ml-64">{children}</main>
      </div>
      
      {/* Connection debug tool */}
      {showConnectionDebug && (
        <button 
          onClick={() => window.location.href = '/login?show_diagnostics=true'}
          className="fixed bottom-4 left-4 z-50 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full p-2.5 shadow-lg"
          title="Solucionar problemas de conexión"
        >
          <LifeBuoy size={20} />
        </button>
      )}
      
      {/* Debug Tool */}
      <DebugTool />
      
      {/* Settings */}
      <Link
        href="/configuracion"
        className="fixed bottom-16 left-4 z-50 bg-gray-700 hover:bg-gray-800 text-white rounded-full p-2.5 shadow-lg"
        title="Configuración"
      >
        <Settings size={20} />
      </Link>
    </MainLayout>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <Layout>{children}</Layout>
    </SupabaseAuthProvider>
  );
} 