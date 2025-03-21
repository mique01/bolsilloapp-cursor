/**
 * Script para corregir rutas duplicadas en los archivos HTML generados por Next.js.
 * Reemplaza todas las instancias de '/bolsilloapp-cursor/bolsilloapp-cursor/' con '/bolsilloapp-cursor/'
 */

const fs = require('fs');
const path = require('path');

console.log('Aplicando correcciones a las URLs duplicadas...');

const outDir = path.join(process.cwd(), 'out');
const basePath = '/bolsilloapp-cursor';
const duplicatePath = `${basePath}${basePath}`;

let filesFixed = 0;
let totalReplacements = 0;

// Función recursiva para procesar todos los archivos HTML
const processDirectory = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Reemplazar todas las instancias de la ruta duplicada
      if (content.includes(duplicatePath)) {
        const replacedContent = content.split(duplicatePath).join(basePath);
        const replacementsCount = (content.match(new RegExp(duplicatePath, 'g')) || []).length;
        
        fs.writeFileSync(filePath, replacedContent);
        filesFixed++;
        totalReplacements += replacementsCount;
        
        console.log(`- ${filePath.replace(outDir, '')}: ${replacementsCount} reemplazos`);
      }
    }
  });
};

try {
  if (!fs.existsSync(outDir)) {
    console.error(`Error: No se encontró el directorio de salida '${outDir}'`);
    process.exit(1);
  }
  
  processDirectory(outDir);
  
  if (filesFixed > 0) {
    console.log(`\n✅ Correcciones aplicadas: ${filesFixed} archivos modificados, ${totalReplacements} reemplazos en total.`);
  } else {
    console.log('\n✓ No se encontraron rutas duplicadas para corregir.');
  }
} catch (error) {
  console.error(`❌ Error al aplicar correcciones: ${error.message}`);
  process.exit(1);
} 