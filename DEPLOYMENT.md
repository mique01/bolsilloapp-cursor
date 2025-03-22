# Deployment Guide for BolsilloApp

This document outlines how to deploy BolsilloApp to both GitHub Pages and Vercel, including important details about environment detection, authentication handling, and common issues.

## Environment Detection

The application includes environment detection logic that adjusts configurations based on where it's running:

- **GitHub Pages**: Static export with optimized settings for GitHub's static hosting
- **Vercel**: Full Next.js application with server-side rendering capabilities
- **Local Development**: Development mode with enhanced debugging

Environment detection is implemented in multiple places:

1. `src/lib/utils/networkUtils.ts` - Detects environment for network requests
2. `src/lib/supabase.ts` - Configures Supabase client based on environment
3. `next.config.js` - Sets build options based on environment

## Authentication Flow

The application uses Supabase for authentication. The flow works as follows:

1. User enters credentials on the login page
2. Request is made to Supabase authentication API
3. On success, JWT token is stored in local storage
4. `SupabaseAuthContext` maintains the authentication state
5. Protected routes check authentication state

### Handling Authentication Errors

When authentication fails, the application:

1. Detects errors using the enhanced network utils
2. Attempts to retry with exponential backoff
3. Falls back to alternative connection methods if needed
4. Provides user-friendly error messages

## Deployment Steps

### GitHub Pages

1. Configure the GitHub workflow in `.github/workflows/deploy.yml`
2. Ensure environment variables are set in GitHub repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_URL`
3. Push to the main branch to trigger deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Set the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_URL`
4. Deploy from the Vercel dashboard or push to the main branch

## Common Issues and Solutions

### Authentication Issues (`AuthRetryableFetchError`)

This error typically appears when:

1. The application can't connect to Supabase's authentication servers
2. CORS policies are blocking the authentication request
3. Network connectivity issues are present

**Solutions:**

- The application includes built-in retry logic and fallbacks
- Enhanced error messages provide clarity to users
- Network diagnostic tools help identify the source of the problem

### Missing Polyfills

When deploying, you might encounter errors related to missing Node.js modules in the browser environment:

**Solution:**

- The webpack configuration in `next.config.js` includes necessary polyfills
- Additional polyfills can be added as needed

### CORS Issues

Cross-Origin Resource Sharing issues might appear when accessing Supabase from GitHub Pages:

**Solution:**

- The application includes CORS headers in `next.config.js`
- A public `_headers` file configures additional CORS settings
- The enhanced fetch function in `networkUtils.ts` includes CORS-friendly headers

## Additional Resources

- Check `scripts/connection-test.js` to run connectivity diagnostics
- Use `npm run analyze` to identify bundle size issues
- Review `scripts/fix-duplicated-paths.js` if you encounter path-related deployment issues

---

If you encounter any other issues during deployment, please create an issue in the GitHub repository. 