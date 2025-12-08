import esbuild from 'esbuild';
import { readFileSync } from 'fs';

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/content.js'],
  bundle: true,
  outfile: 'content.js',
  format: 'iife',
  target: 'chrome90',
  minify: false, // Keep readable for debugging, set to true for production
  sourcemap: isWatch ? 'inline' : false,
  logLevel: 'info',
  banner: {
    js: '// SentinelOne JSON Viewer - Bundled with esbuild'
  }
};

if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('👀 Watching for changes...');
} else {
  await esbuild.build(config);
  console.log('✅ Build complete!');
}

