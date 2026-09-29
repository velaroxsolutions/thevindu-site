// Cross-platform `KEY=value command` (works in Windows cmd/PowerShell too).
// Usage: node scripts/env.mjs SNAPSHOT=1 astro build
import { spawn } from 'node:child_process';
const args = process.argv.slice(2);
const env = { ...process.env };
while (args[0]?.includes('=')) { const [k, ...v] = args.shift().split('='); env[k] = v.join('='); }
const child = spawn('npx', args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
child.on('exit', (code) => process.exit(code ?? 1));
