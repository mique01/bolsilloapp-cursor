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
    router.push('/login');
  };

  // Skip rendering sidebar and header for login/register pages
  if (pathname === '/login' || pathname === '/reset-password') {
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
          <Link href="/" className="flex items-center">
            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md shadow-lg">
              <PiggyBank size={20} className="text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-white">Bolsillo App</span>
          </Link>
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
          <Link
            href="/"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === "/"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <Home size={20} className="mr-3" />
            <span className="text-sm font-medium">Inicio</span>
          </Link>
          <Link
            href="/dashboard"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === "/dashboard"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <BarChart3 size={20} className="mr-3" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link
            href="/transacciones"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === "/transacciones" || pathname?.startsWith("/transacciones/")
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <Receipt size={20} className="mr-3" />
            <span className="text-sm font-medium">Transacciones</span>
          </Link>
          <Link
            href="/comprobantes"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === "/comprobantes"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <DollarSign size={20} className="mr-3" />
            <span className="text-sm font-medium">Comprobantes</span>
          </Link>
          <Link
            href="/presupuestos"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === "/presupuestos"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <PiggyBank size={20} className="mr-3" />
            <span className="text-sm font-medium">Presupuestos</span>
          </Link>
          <Link
            href="/configuracion"
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname === "/configuracion"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30"
                : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <Settings size={20} className="mr-3" />
            <span className="text-sm font-medium">Configuración</span>
          </Link>
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
            <Link href="/" className="flex items-center">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md shadow-lg">
                <PiggyBank size={20} className="text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-white">Bolsillo App</span>
            </Link>
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