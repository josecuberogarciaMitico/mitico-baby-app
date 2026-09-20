import { readFileSync } from 'node:fs';

const APP_PATH = new URL('../src/App.tsx', import.meta.url);
const MAX_APP_LINES = 23800;

const source = readFileSync(APP_PATH, 'utf8');
const lines = source.split(/\r?\n/).length;

if (lines > MAX_APP_LINES) {
  console.error(`ARCHITECTURE ERROR: src/App.tsx has ${lines} lines; baseline maximum is ${MAX_APP_LINES}.`);
  console.error('App.tsx is frozen as shell/orchestrator. Move new screens, domain logic, queries and large JSX blocks to src/features, src/core, src/services or dedicated components.');
  process.exit(1);
}

console.log(`Architecture OK: src/App.tsx ${lines}/${MAX_APP_LINES} lines.`);
