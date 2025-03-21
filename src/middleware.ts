import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // This is needed because Next.js cookies API needs expires as a Date
          if (options.expires) {
            options.expires = new Date(options.expires);
          }
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
  
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define which paths are protected (require authentication)
  const protectedPaths = [
    '/dashboard',
    '/transacciones',
    '/comprobantes',
    '/presupuestos',
    '/configuracion',
  ];
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`)
  );
  
  // If the path is protected and we don't have a session, redirect to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If we're on the login page and already have a session, redirect to dashboard
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/') && session) {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

// Only run the middleware on the specified paths
export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard',
    '/dashboard/:path*',
    '/transacciones',
    '/transacciones/:path*',
    '/comprobantes',
    '/comprobantes/:path*',
    '/presupuestos',
    '/presupuestos/:path*',
    '/configuracion',
    '/configuracion/:path*',
  ],
}; 