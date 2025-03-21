/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Solo usar basePath y assetPrefix si estamos desplegando a GitHub Pages
  // No usar en desarrollo local o Vercel
  basePath: process.env.GITHUB_ACTIONS ? '/bolsilloapp-cursor' : '',
  assetPrefix: process.env.GITHUB_ACTIONS ? '/bolsilloapp-cursor/' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_BASE_PATH: process.env.GITHUB_ACTIONS ? '/bolsilloapp-cursor' : '',
    NEXT_PUBLIC_SITE_URL: process.env.GITHUB_ACTIONS ? 'https://mique01.github.io' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
    NEXT_PUBLIC_DEPLOYMENT_ENV: process.env.GITHUB_ACTIONS ? 'github' : process.env.VERCEL ? 'vercel' : 'local',
  },
  // Add trailing slashes for better static hosting compatibility
  trailingSlash: true,
  // Disable server-side features since we're using static export
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 