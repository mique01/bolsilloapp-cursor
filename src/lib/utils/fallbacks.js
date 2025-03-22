/**
 * Fallback utilities for critical network operations
 * Used when the primary NetworkUtils might not be available
 */

// Simple environment detection that works everywhere
export function getEnvironmentSimple() {
  if (typeof window === 'undefined') {
    return 'server';
  }
  
  const url = window.location.hostname;
  
  if (url.includes('github.io')) {
    return 'github';
  } else if (url.includes('vercel.app')) {
    return 'vercel';
  } else if (url === 'localhost' || url === '127.0.0.1') {
    return 'local';
  }
  
  return 'unknown';
}

// Minimal fetch implementation with retries
export async function minimalFetchWithRetry(url, options = {}, retries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Add CORS headers automatically
      const corsOptions = {
        ...options,
        headers: {
          ...options.headers,
          'X-Client-Info': 'bolsilloapp-fallback',
        },
        mode: 'cors',
        credentials: 'include',
      };
      
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...corsOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      // Wait before retry (exponential backoff)
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 2 ** attempt * 1000));
      }
    }
  }
  
  console.error(`All ${retries} attempts failed for ${url}`);
  throw lastError;
}

// Minimal connectivity check
export async function checkConnectivitySimple() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.status === 204;
  } catch (error) {
    console.error('Connectivity check failed:', error);
    return false;
  }
} 