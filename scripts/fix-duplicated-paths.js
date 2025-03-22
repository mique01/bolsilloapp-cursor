/**
 * This script fixes an issue with Next.js static exports where
 * pages might be generated with duplicate paths (both with and without .html extension)
 * causing problems with GitHub Pages deployment
 */

const fs = require('fs');
const path = require('path');

// Output directory from Next.js
const outDir = path.join(process.cwd(), 'out');

// Check if the out directory exists
if (!fs.existsSync(outDir)) {
  console.log('Output directory does not exist, skipping fix.');
  process.exit(0);
}

// Function to recursively scan directory
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      scanDirectory(filePath);
    } else {
      // Check for duplicate files (with and without .html extension)
      if (file.endsWith('.html')) {
        const baseName = file.slice(0, -5);
        const duplicatePath = path.join(dir, baseName);
        
        // Check if the duplicate directory exists
        if (fs.existsSync(duplicatePath) && fs.statSync(duplicatePath).isDirectory()) {
          console.log(`Found duplicate: ${duplicatePath} (removing directory)`);
          
          try {
            // Remove the duplicate directory
            fs.rmSync(duplicatePath, { recursive: true, force: true });
            console.log(`Successfully removed: ${duplicatePath}`);
          } catch (err) {
            console.error(`Error removing ${duplicatePath}:`, err);
          }
        }
      }
    }
  });
}

// Add .nojekyll file to prevent GitHub Pages from using Jekyll
const nojekyllPath = path.join(outDir, '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  fs.writeFileSync(nojekyllPath, '');
  console.log('Created .nojekyll file');
}

// Create a 404.html file that redirects to index.html
const notFoundPath = path.join(outDir, '404.html');
const notFoundContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Get the current path excluding the base path
    const path = window.location.pathname.replace('/bolsilloapp-cursor', '');
    // Redirect to the main page
    window.location.href = '/bolsilloapp-cursor';
  </script>
</head>
<body>
  <h1>Page not found</h1>
  <p>Redirecting to home page...</p>
</body>
</html>
`;

fs.writeFileSync(notFoundPath, notFoundContent);
console.log('Created 404.html file');

// Start the fix process
console.log('Fixing duplicate paths in the output directory...');
scanDirectory(outDir);
console.log('Fix completed.'); 