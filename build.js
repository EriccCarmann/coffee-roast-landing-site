// Frontend build: esbuild turns JSX into plain JS and bundles the CSS.
// `npm run build` = one-off build into dist/; `npm run dev` = rebuild on change + server with auto-restart.
import { build, context } from 'esbuild';
import { cpSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';

const watch = process.argv.includes('--watch');

rmSync('dist', { recursive: true, force: true });
cpSync('public', 'dist', { recursive: true });

const options = {
  // two bundles: the public site (index.js/css) and the admin (admin.js/css, opened at /admin)
  entryPoints: { index: 'src/index.jsx', admin: 'src/admin/main.jsx' },
  bundle: true,
  outdir: 'dist',
  jsx: 'automatic',
  minify: !watch,
  sourcemap: watch,
  define: { 'process.env.NODE_ENV': JSON.stringify(watch ? 'development' : 'production') },
  logLevel: 'info',
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  spawn(process.execPath, ['--watch', 'server/index.js'], { stdio: 'inherit' });
  console.log('Dev: http://localhost:' + (process.env.PORT || 3000) + ' (refresh the page after edits)');
} else {
  await build(options);
}
