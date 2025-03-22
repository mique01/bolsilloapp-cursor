/**
 * Network utilities for enhancing connection reliability
 */

// Detect current environment
export const getEnvironment = () => {
  if (typeof window === 'undefined') return 'server';
  
  const host = window.location.hostname;
  if (host.includes('github.io')) return 'github';
  if (host.includes('vercel.app')) return 'vercel';
  if (host === 'localhost' || host === '127.0.0.1') return 'local';
  return 'unknown';
};

// Enhanced fetch with timeout and retry
export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  retries = 3, 
  timeout = 10000
): Promise<Response> {
  let lastError: Error | null = null;
  const environment = getEnvironment();

  // Add environment-specific headers and configs
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'X-Client-Environment': environment,
    },
    // Always use CORS mode for Supabase requests
    mode: 'cors',
    // Include credentials for authenticated requests
    credentials: 'include',
  };

  // Try different fetch strategies based on retries remaining
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // If not first attempt, add delay to prevent overwhelming the server
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        console.log(`Retry attempt ${attempt} for ${url}`);
      }

      // For last attempt, try CORS proxy if in browser environment
      const targetUrl = attempt === retries - 1 && environment === 'github' && typeof window !== 'undefined'
        ? `https://corsproxy.io/?${encodeURIComponent(url)}`
        : url;

      // Execute fetch with timeout
      const response = await fetch(targetUrl, {
        ...fetchOptions,
        signal: controller.signal,
      });

      // Clear timeout to prevent memory leaks
      clearTimeout(timeoutId);

      // Log successful connection for debugging
      if (response.ok) {
        console.log(`Fetch successful for ${url} on attempt ${attempt + 1}`);
        
        // Store successful connection details if in browser
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('last_successful_fetch', JSON.stringify({
              url,
              timestamp: Date.now(),
              environment,
              attempt: attempt + 1
            }));
          } catch (e) {
            // Ignore storage errors
          }
        }
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Fetch attempt ${attempt + 1} failed for ${url}:`, error);
    }
  }

  // All retries failed
  throw lastError || new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

// Helper to detect network connectivity issues
export async function checkConnectivity(): Promise<boolean> {
  try {
    // Try to fetch a reliable endpoint
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    return true; // If we get here, we have connectivity
  } catch (error) {
    console.error('Network connectivity check failed:', error);
    return false;
  }
} 