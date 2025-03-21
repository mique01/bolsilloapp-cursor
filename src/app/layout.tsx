import "@/app/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from "../components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bolsillo App",
  description: "Gestiona tus finanzas personales de manera inteligente",
};

// Agregar un script para establecer la ruta base correctamente
const BasePathScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Detectar entorno y configurar rutas
            const isGitHubPages = window.location.hostname.includes('github.io');
            const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const isLocalIP = /^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(window.location.hostname);
            
            // Configurar variables globales
            window.appConfig = {
              basePath: '',
              isBasepathHandled: false,
              isLocal: isLocalHost || isLocalIP,
              isGitHubPages: isGitHubPages,
              siteUrl: window.location.origin
            };
            
            // Si estamos en GitHub Pages, usar el basePath
            if (isGitHubPages) {
              window.appConfig.basePath = '/bolsilloapp-cursor';
              window.appConfig.isBasepathHandled = true;
            } 
            // Si estamos en localhost o IP local, NO usar basePath independientemente del entorno
            else if (isLocalHost || isLocalIP) {
              window.appConfig.basePath = '';
              window.appConfig.isBasepathHandled = false;
            }
            // En producción pero no GitHub Pages (ej: Vercel)
            else {
              window.appConfig.basePath = '';
              window.appConfig.isBasepathHandled = false;
            }
            
            console.log('App config:', window.appConfig);
            console.log('Current hostname:', window.location.hostname);
            
            // Redirigir si hay un prefijo incorrecto en la URL
            if ((isLocalHost || isLocalIP) && window.location.pathname.startsWith('/bolsilloapp-cursor')) {
              const newPath = window.location.pathname.replace('/bolsilloapp-cursor', '');
              window.location.href = window.location.origin + (newPath || '/');
              return;
            }
            
            // Agregar clase al body para asegurar que los estilos se apliquen correctamente
            document.documentElement.classList.add('dark-theme');
          })();
        `,
      }}
    />
  );
};

// Función para determinar si estamos en entorno GitHub Pages
const isGitHubPages = () => {
  return process.env.NODE_ENV === 'production' && !process.env.VERCEL;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Solo usar basePath para GitHub Pages, no para local o Vercel
  const basePath = isGitHubPages() ? '/bolsilloapp-cursor' : '';
  
  return (
    <html lang="es" className="h-full dark-theme">
      <head>
        <BasePathScript />
        <link
          rel="stylesheet"
          href={`${basePath}/tailwind.css`}
        />
        {/* Cargar scripts solo si estamos en GitHub Pages */}
        {isGitHubPages() && (
          <>
            <script defer src={`${basePath}/webpack.js`}></script>
            <script defer src={`${basePath}/fd9d1056.js`}></script>
            <script defer src={`${basePath}/23.js`}></script>
            <script defer src={`${basePath}/main-app.js`}></script>
          </>
        )}
      </head>
      <body className={`${inter.className} h-full text-gray-900 dark:text-gray-100`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>  
  );
}
