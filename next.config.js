/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Esto es crucial para generar archivos estáticos
  images: {
    unoptimized: true,  // Necesario para export estático
  },
  // Configura el basePath si vas a desplegar en un subdirectorio
  // Por ejemplo, si tu repo se llama 'my-app', usa:
  basePath: process.env.NODE_ENV === 'production' ? '/bolsilloapp-cursor' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bolsilloapp-cursor/' : '',
}

module.exports = nextConfig 