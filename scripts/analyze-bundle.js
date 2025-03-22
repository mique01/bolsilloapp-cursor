/**
 * Bundle analyzer script
 * Run with: NODE_ENV=production node scripts/analyze-bundle.js
 */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: true,
});

const nextConfig = require('../next.config.js');

// Apply the bundle analyzer
const analyzerConfig = withBundleAnalyzer(nextConfig);

// Log the config for verification
console.log('Analyzer configuration:');
console.log(JSON.stringify(analyzerConfig, null, 2));

console.log('\nTo analyze the bundle, run:');
console.log('ANALYZE=true npm run build'); 