import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const SCAN_ROOTS = ['src', 'public', 'supabase/functions'];
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.css', '.html']);
const failures = [];

async function filesBelow(path) {
  const result = [];
  for (const name of await readdir(path)) {
    const absolute = join(path, name);
    const info = await stat(absolute);
    if (info.isDirectory()) result.push(...(await filesBelow(absolute)));
    else if (TEXT_EXTENSIONS.has(extname(name))) result.push(absolute);
  }
  return result;
}

for (const folder of SCAN_ROOTS) {
  for (const file of await filesBelow(join(ROOT, folder))) {
    const source = await readFile(file, 'utf8');
    const display = relative(ROOT, file);

    if (/Ã|Â|â€|�/u.test(source)) {
      failures.push(`${display}: contiene texto con codificación dañada`);
    }

    // Las referencias a variables de entorno son correctas; se bloquean valores
    // privilegiados incrustados en código o archivos de configuración entregados.
    if (/SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"][^'"]{20,}['"]/u.test(source)) {
      failures.push(`${display}: contiene una service role incrustada`);
    }
    if (/\beyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/u.test(source)) {
      failures.push(`${display}: contiene un JWT literal`);
    }
  }
}

if (failures.length) {
  console.error('Auditoría estática NO SUPERADA:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Auditoría estática SUPERADA: codificación y secretos incrustados.');
}
