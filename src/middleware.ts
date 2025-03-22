import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
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
    
    // Set timeout for Supabase authentication check to prevent hangs
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Supabase auth timeout')), 5000);
    });
    
    // Get session with timeout
    const sessionPromise = supabase.auth.getSession();
    
    // Use Promise.race to implement timeout
    const { data: { session } } = await Promise.race([
      sessionPromise,
      timeoutPromise.then(() => {
        console.error('Auth check timed out in middleware');
        // If timeout, check for alternative auth method (like cookies)
        const hasAuthCookie = req.cookies.get('sb-access-token')?.value;
        return { data: { session: hasAuthCookie ? { user: {} } : null } };
      })
    ]) as any;

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
      // Add diagnostic info for debugging
      redirectUrl.searchParams.set('redirect_reason', 'auth_required');
      return NextResponse.redirect(redirectUrl);
    }
    
    // If we're on the login page and already have a session, redirect to dashboard
    if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/') && session) {
      const redirectUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, don't block access to public routes
    const publicRoutes = ['/login', '/', '/reset-password'];
    if (publicRoutes.includes(req.nextUrl.pathname)) {
      return res;
    }
    
    // For protected routes, try to check cookie directly as a fallback
    const hasAuthCookie = req.cookies.get('sb-access-token')?.value;
    
    if (!hasAuthCookie) {
      // No alternative auth method, redirect to login
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect_reason', 'auth_error');
      return NextResponse.redirect(redirectUrl);
    }
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