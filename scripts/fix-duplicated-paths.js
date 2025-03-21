/**
 * Script para corregir rutas duplicadas en los archivos HTML generados por Next.js.
 * Reemplaza todas las instancias de '/bolsilloapp-cursor/bolsilloapp-cursor/' con '/bolsilloapp-cursor/'
 * También realiza otras correcciones para asegurar que las rutas sean correctas
 */

const fs = require('fs');
const path = require('path');

// Verificar si estamos en GitHub Actions
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

console.log(`Modo de ejecución: ${isGitHubPages ? 'GitHub Pages' : 'Local o Vercel'}`);

// Si no estamos en GitHub Actions, no necesitamos aplicar correcciones
if (!isGitHubPages) {
  console.log('No se ejecuta en GitHub Actions, no se necesitan correcciones para GitHub Pages.');
  
  // Crear un archivo .nojekyll vacío para evitar problemas con Jekyll en cualquier caso
  const outDir = path.join(process.cwd(), 'out');
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
    console.log('- Creado archivo .nojekyll para hostings estáticos');
  }
  
  process.exit(0);
}

console.log('Aplicando correcciones para despliegue en GitHub Pages...');

const outDir = path.join(process.cwd(), 'out');
const basePath = '/bolsilloapp-cursor';
const duplicatePath = `${basePath}${basePath}`;

let filesFixed = 0;
let totalReplacements = 0;

// Asegurarse de que existe el archivo .nojekyll para GitHub Pages
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
console.log('- Creado archivo .nojekyll para GitHub Pages');

// Función recursiva para procesar todos los archivos HTML, CSS y JS
const processDirectory = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let replacementsCount = 0;
      
      // Reemplazar todas las instancias de la ruta duplicada
      if (content.includes(duplicatePath)) {
        content = content.split(duplicatePath).join(basePath);
        replacementsCount += (originalContent.match(new RegExp(duplicatePath, 'g')) || []).length;
        originalContent = content;
      }
      
      // Corregir posibles problemas con rutas absolutas en CSS y JS
      if (file.endsWith('.css') || file.endsWith('.js')) {
        // Reemplazar referencias absolutas incorrectas
        if (content.includes('"/') && !content.includes(`"${basePath}/`)) {
          const regex = /"\/((?!bolsilloapp-cursor)[^"]*)/g;
          const replacement = `"${basePath}/$1`;
          const newContent = content.replace(regex, replacement);
          if (newContent !== content) {
            content = newContent;
            const newReplacements = (originalContent.match(regex) || []).length;
            replacementsCount += newReplacements;
            originalContent = content;
          }
        }
        
        // Corregir rutas de imágenes y otros assets en CSS
        if (file.endsWith('.css')) {
          const cssUrlRegex = /url\(\s*['"]?\/((?!bolsilloapp-cursor)[^"')]*)/g;
          const cssUrlReplacement = `url(${basePath}/$1`;
          const newContent = content.replace(cssUrlRegex, cssUrlReplacement);
          if (newContent !== content) {
            content = newContent;
            const newReplacements = (originalContent.match(cssUrlRegex) || []).length;
            replacementsCount += newReplacements;
          }
        }
      }
      
      // Escribir archivo si se realizaron cambios
      if (replacementsCount > 0) {
        fs.writeFileSync(filePath, content);
        filesFixed++;
        totalReplacements += replacementsCount;
        
        console.log(`- ${filePath.replace(outDir, '')}: ${replacementsCount} reemplazos`);
      }
    }
  });
};

// Crear un archivo 404.html que redirija al basePath correcto
const create404Page = () => {
  const html404 = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirigiendo...</title>
    <script>
      // Extraer la ruta solicitada
      const pathname = window.location.pathname;
      // Si la ruta no comienza con /bolsilloapp-cursor, redirigir
      if (!pathname.startsWith('/bolsilloapp-cursor')) {
        const newPath = '/bolsilloapp-cursor' + pathname;
        window.location.href = newPath;
      } else {
        // Si es una ruta de recurso, intentar cargar desde la ubicación correcta
        if (pathname.includes('/_next/') || pathname.includes('/static/')) {
          const segments = pathname.split('/');
          // Encontrar el índice después de bolsilloapp-cursor
          const basePathIndex = segments.findIndex(s => s === 'bolsilloapp-cursor');
          if (basePathIndex !== -1) {
            const correctPath = segments.slice(basePathIndex + 1).join('/');
            window.location.href = '/bolsilloapp-cursor/' + correctPath;
          } else {
            // Redirigir a la página principal como fallback
            window.location.href = '/bolsilloapp-cursor/';
          }
        } else {
          // Si no es un recurso, redirigir a la página principal
          window.location.href = '/bolsilloapp-cursor/';
        }
      }
    </script>
  </head>
  <body>
    <p>Redirigiendo al recurso correcto...</p>
  </body>
</html>`;

  fs.writeFileSync(path.join(outDir, '404.html'), html404);
  console.log('- Creado archivo 404.html para manejar redirecciones');
};

try {
  if (!fs.existsSync(outDir)) {
    console.error(`Error: No se encontró el directorio de salida '${outDir}'`);
    process.exit(1);
  }
  
  // Crear el archivo 404.html personalizado
  create404Page();
  
  processDirectory(outDir);
  
  // Crear un archivo tailwind.css en la raíz para asegurar que los estilos se carguen correctamente
  const cssFiles = fs.readdirSync(path.join(outDir, '_next/static/css'));
  const mainCssFile = cssFiles.find(file => file.endsWith('.css'));
  
  if (mainCssFile) {
    const cssContent = fs.readFileSync(
      path.join(outDir, '_next/static/css', mainCssFile),
      'utf8'
    );
    
    fs.writeFileSync(
      path.join(outDir, 'tailwind.css'),
      cssContent
    );
    
    console.log(`- Creado archivo tailwind.css en la raíz para asegurar carga de estilos`);
  }
  
  // Crear copias de seguridad de los archivos JavaScript críticos en la raíz
  console.log('- Creando copias de archivos JavaScript críticos en la raíz para mejorar la carga');
  ['main-app', 'webpack', 'fd9d1056', '23'].forEach(chunkName => {
    const files = fs.readdirSync(path.join(outDir, '_next/static/chunks'));
    const matchingFile = files.find(file => file.includes(chunkName) && file.endsWith('.js'));
    
    if (matchingFile) {
      const content = fs.readFileSync(
        path.join(outDir, '_next/static/chunks', matchingFile),
        'utf8'
      );
      
      fs.writeFileSync(
        path.join(outDir, `${chunkName}.js`),
        content
      );
      
      console.log(`  - Copiado ${matchingFile} a la raíz como ${chunkName}.js`);
    }
  });
  
  console.log(`\n✅ Correcciones aplicadas: ${filesFixed} archivos modificados, ${totalReplacements} reemplazos en total.`);
} catch (err) {
  console.error(`Error al procesar archivos: ${err}`);
  process.exit(1);
} 