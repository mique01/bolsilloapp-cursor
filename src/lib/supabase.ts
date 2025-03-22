import { createClient } from '@supabase/supabase-js';

// Define the type for our Supabase client (use any to avoid type issues)
type SupabaseClientType = any;

// Define a mock client type for development
type MockSupabaseClient = {
  auth: {
    signUp: (params: { email: string; password: string }) => Promise<any>;
    signInWithPassword: (params: { email: string; password: string }) => Promise<any>;
    signOut: () => Promise<any>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => any;
    getSession: () => Promise<any>;
    getUser: () => Promise<any>;
    resetPasswordForEmail: (email: string) => Promise<any>;
    updateUser: (params: { password: string }) => Promise<any>;
  };
  from: (table: string) => any;
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: any) => Promise<any>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
      download: (path: string) => Promise<any>;
      list: (path?: string, options?: any) => Promise<any>;
      remove: (paths: string | string[]) => Promise<any>;
    };
  };
};

// URLs de fallback incluyendo direcciones IP alternativas en caso de problemas DNS
const SUPABASE_URLS = [
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  'https://cxfnamwzbfrdaahfsqkc.supabase.co',
  // Agregar proxy CORS para casos extremos
  'https://corsproxy.io/?https://cxfnamwzbfrdaahfsqkc.supabase.co',
  'https://api.allorigins.win/raw?url=https://cxfnamwzbfrdaahfsqkc.supabase.co'
];

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhybm1ndHVnc2ZjeGthZ2pxcWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU5MDY1MDcsImV4cCI6MjAxMTQ4MjUwN30.4GiGYPPzXHJGd30GRz07t0uGnAQgJNBmq6JFHZ2EWUI';

// Detectar el entorno actual
const isGitHubPages = typeof window !== 'undefined' && 
  (window.location.hostname === 'mique01.github.io' || 
   process.env.NEXT_PUBLIC_DEPLOYMENT_ENV === 'github');

const isVercel = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || 
   process.env.NEXT_PUBLIC_DEPLOYMENT_ENV === 'vercel');

// Headers para las peticiones
const requestHeaders: Record<string, string> = {
  'X-Client-Info': 'supabase-js/2.38.4',
  'X-Origin': typeof window !== 'undefined' ? window.location.origin : 'localhost'
};

// Opciones para el fetch según el entorno
const fetchOptions: RequestInit = {
  headers: requestHeaders,
  // Cuando está en GitHub Pages, asegurar de incluir credenciales y cors
  credentials: isGitHubPages ? 'include' as RequestCredentials : 'same-origin' as RequestCredentials,
  mode: isGitHubPages ? 'cors' as RequestMode : undefined
};

async function testUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    await fetch(`${url}/ping`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
}

// Modificar la función createSupabaseClient para intentar múltiples URLs
export const createSupabaseClient = async () => {
  // Intentar conexión con cada URL hasta encontrar una que funcione
  let lastError = null;
  
  for (const supabaseUrl of SUPABASE_URLS) {
    if (!supabaseUrl) continue; // Omitir URLs vacías
    
    try {
      console.log(`Intentando conectar a Supabase en: ${supabaseUrl}`);
      
      // Verificar primero si podemos acceder al dominio con un fetch básico
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const testResponse = await fetch(`${supabaseUrl}/ping`, { 
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log(`Respuesta de prueba: ${testResponse.status}`);
      } catch (pingError) {
        console.warn(`No se pudo hacer ping a ${supabaseUrl}:`, pingError);
        // Continuar de todos modos, la conexión real podría funcionar
      }
      
      const client = createClient(supabaseUrl, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'supabase-auth',
        },
        global: {
          headers: requestHeaders,
          fetch: async (url, options = {}) => {
            // Agregar timeout más corto para fallar rápido
            const timeoutPromise = new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout de conexión a Supabase')), 10000)
            );
            
            // Asegurar que los headers sean del tipo correcto
            const mergedHeaders: Record<string, string> = {
              ...requestHeaders
            };
            
            // Agregar headers de options si existen y convertirlos a Record<string, string>
            if (options.headers) {
              const optionHeaders = options.headers as Record<string, string>;
              Object.keys(optionHeaders).forEach(key => {
                mergedHeaders[key] = optionHeaders[key];
              });
            }
            
            // Configurar headers CORS para dominios cruzados
            const corsHeaders = {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            };
            
            try {
              // Usar DNS directo para bypass si es necesario
              const urlString = typeof url === 'string' ? url : url.toString();
              const modifiedUrl = urlString.replace(
                'cxfnamwzbfrdaahfsqkc.supabase.co',
                typeof window !== 'undefined' && window.localStorage.getItem('use_direct_ip') === 'true'
                  ? (localStorage.getItem('supabase_direct_ip') || 'cxfnamwzbfrdaahfsqkc.supabase.co')
                  : 'cxfnamwzbfrdaahfsqkc.supabase.co'
              );

              // Create abort controller for timeout
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000);

              const fetchPromise = fetch(modifiedUrl, {
                ...options,
                ...fetchOptions,
                headers: {
                  ...corsHeaders,
                  ...mergedHeaders,
                },
                // Use controller signal instead of AbortSignal.timeout
                signal: controller.signal,
              });

              try {
                const response = await Promise.race([fetchPromise, timeoutPromise]);
                
                // Clear timeout to prevent memory leaks
                clearTimeout(timeoutId);

                // Guardar la información de conexión exitosa en localStorage
                if (response.ok && typeof window !== 'undefined') {
                  localStorage.setItem('supabase_connection', JSON.stringify({
                    url: supabaseUrl,
                    timestamp: Date.now(),
                    success: true
                  }));
                }

                return response;
              } catch (error) {
                // Clear timeout to prevent memory leaks
                clearTimeout(timeoutId);
                
                console.error('Error en la conexión con Supabase:', error);
                
                // Registrar el error de conexión en localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem('supabase_connection', JSON.stringify({
                    url: supabaseUrl,
                    timestamp: Date.now(),
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                  }));
                }
                
                throw error;
              }
            } catch (error) {
              console.error('Error en la conexión con Supabase:', error);
              
              // Registrar el error de conexión en localStorage
              if (typeof window !== 'undefined') {
                localStorage.setItem('supabase_connection', JSON.stringify({
                  url: supabaseUrl,
                  timestamp: Date.now(),
                  success: false,
                  error: error instanceof Error ? error.message : String(error)
                }));
              }
              
              throw error;
            }
          }
        }
      });
      
      // Verificar conexión haciendo una llamada de prueba
      try {
        const { data, error } = await client.auth.getSession();
        if (!error) {
          console.log("Conexión a Supabase establecida correctamente");
          
          // Guardar este URL que funcionó para futuros usos
          if (typeof window !== 'undefined') {
            localStorage.setItem('working_supabase_url', supabaseUrl);
          }
          
          return client;
        }
      } catch (sessionError) {
        console.warn("Error al verificar sesión:", sessionError);
        // No es crítico, el cliente podría funcionar para otras operaciones
      }
      
      return client; // Retornar el cliente aunque la prueba de sesión falle
      
    } catch (error) {
      console.error(`Error al conectar con ${supabaseUrl}:`, error);
      lastError = error;
      // Continuar con la siguiente URL
    }
  }
  
  // Si llegamos aquí, todas las URLs fallaron
  console.error("No se pudo conectar con ninguna URL de Supabase. Último error:", lastError);
  
  // Crear un cliente con la primera URL como fallback final
  const defaultUrl = SUPABASE_URLS[0] || 'https://cxfnamwzbfrdaahfsqkc.supabase.co';
  return createClient(defaultUrl, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });
};

// Exportamos una sola instancia del cliente, que se inicializa bajo demanda
let supabaseInstance: SupabaseClientType | null = null;

export const getSupabase = async (): Promise<SupabaseClientType> => {
  if (!supabaseInstance) {
    supabaseInstance = await createSupabaseClient();
  }
  return supabaseInstance;
};

// Para compatibilidad con código existente, crear una instancia sincrónica
// pero advertir que debe migrarse a la versión asíncrona
const supabase = createClient(
  SUPABASE_URLS[0] || 'https://cxfnamwzbfrdaahfsqkc.supabase.co', 
  SUPABASE_ANON_KEY
);

export default supabase; 