/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Changed from 'export' to enable proper middleware and server-side logic
  // output: 'export',
  images: {
    // Only set unoptimized to true if using static export
    // unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configura el basePath si vas a desplegar en un subdirectorio
  // Por ejemplo, si tu repo se llama 'my-app', usa:
  // basePath: process.env.NODE_ENV === 'production' ? '/bolsilloapp-cursor' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/bolsilloapp-cursor/' : '',
  // Disable ESLint during production build to avoid issues
  eslint: {
    // Only run ESLint during development, not during production builds
    ignoreDuringBuilds: true,
  },
  // Handle environment variables properly
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
}

module.exports = nextConfig 