// Run on your own machine:  npm run images   (needs Node 22.18+, which runs .ts directly)
// Downloads every image from src/data/imageSources.ts into public/images/.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REMOTE_IMAGES } from '../src/data/imageSources.ts';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
await mkdir(outDir, { recursive: true });

let failed = 0;
for (const [key, { file, url }] of Object.entries(REMOTE_IMAGES)) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(path.join(outDir, file), Buffer.from(await res.arrayBuffer()));
    console.log(`ok    ${key} -> public/images/${file}`);
  } catch (err) {
    failed++;
    console.error(`FAIL  ${key}: ${(err as Error).message}`);
  }
}

console.log(failed ? `\n${failed} file(s) failed.` : '\nDone. Now set NEXT_PUBLIC_LOCAL_IMAGES=true in .env.local and restart.');
process.exitCode = failed ? 1 : 0;
