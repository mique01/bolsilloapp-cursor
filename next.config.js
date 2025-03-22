/** @type {import('next').NextConfig} */

// Determinar si estamos construyendo para GitHub Pages o Vercel
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const isVercel = process.env.VERCEL === '1';

// Configuración específica para GitHub Pages
const githubPagesConfig = {
  output: 'export', // Generar archivos estáticos
  images: {
    unoptimized: true, // No optimizar imágenes para evitar problemas con rutas
  },
  trailingSlash: true, // Añadir barras al final para compatibilidad con GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bolsilloapp' : '', // Ajustar según el nombre de tu repo
};

// Configuración estándar para Vercel o desarrollo local
const standardConfig = {
  // Opciones estándar
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

// Aplicar la configuración correcta según el entorno
const nextConfig = isGitHubPages 
  ? { ...standardConfig, ...githubPagesConfig } 
  : standardConfig;

// Ajustar headers para CORS en caso de problemas de conexión
nextConfig.headers = async () => {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'X-Requested-With, Content-Type, Authorization',
        },
      ],
    },
  ];
};

// Ignorar errores de registro de servicios durante la compilación
if (isGitHubPages) {
  nextConfig.webpack = (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
      };
    }
    return config;
  };
}

module.exports = nextConfig; 