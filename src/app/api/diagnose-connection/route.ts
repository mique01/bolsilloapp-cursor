import { NextResponse } from 'next/server';

// Función para probar la conectividad a una URL
async function testConnection(url: string, options: RequestInit = {}): Promise<{
  success: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Añadir timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Intentar la conexión
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    return {
      success: response.ok,
      latency,
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    
    return {
      success: false,
      latency,
      error: error.message || 'Error desconocido',
    };
  }
}

export async function GET() {
  // URLs a probar
  const endpoints = [
    {
      name: 'Supabase API',
      url: 'https://cxfnamwzbfrdaahfsqkc.supabase.co/auth/v1/health',
    },
    {
      name: 'Supabase REST',
      url: 'https://cxfnamwzbfrdaahfsqkc.supabase.co/rest/v1/',
    },
    {
      name: 'Proxy CORS 1',
      url: 'https://cors-proxy.fringe.zone/https://cxfnamwzbfrdaahfsqkc.supabase.co/ping',
    },
    {
      name: 'Proxy CORS 2',
      url: 'https://api.allorigins.win/raw?url=https://cxfnamwzbfrdaahfsqkc.supabase.co/ping',
    },
  ];
  
  // Probar cada endpoint
  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const result = await testConnection(endpoint.url);
      return {
        name: endpoint.name,
        url: endpoint.url,
        ...result,
      };
    })
  );
  
  // Verificar DNS
  const dnsTest = {
    name: 'DNS Resolution',
    success: true,
    error: null,
  };
  
  try {
    // Intentar resolver DNS
    await fetch('https://dns.google/resolve?name=cxfnamwzbfrdaahfsqkc.supabase.co&type=A', {
      method: 'GET',
    });
  } catch (error: any) {
    dnsTest.success = false;
    dnsTest.error = error.message;
  }
  
  // Recopilar toda la información
  const diagnosticResult = {
    timestamp: new Date().toISOString(),
    endpoints: results,
    dns: dnsTest,
    clientInfo: {
      userAgent: null,
      ip: null,
    },
  };
  
  // Guardar los resultados para que estén disponibles en el cliente
  // Como esto es API Route, no podemos guardar en localStorage
  // Así que lo guardamos en un JSON en la carpeta public
  
  // Devolver resultados
  return NextResponse.json(diagnosticResult);
} 