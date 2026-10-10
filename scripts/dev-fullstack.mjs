import { spawn } from 'node:child_process';
import process from 'node:process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const commands = [
  { name: 'backend', args: ['run', 'dev', '--prefix', 'backend'] },
  { name: 'frontend', args: ['run', 'dev', '--prefix', 'career navigator', '--', '--host', '127.0.0.1'] }
];
const children = commands.map(({ name, args }) => {
  const child = spawn(npm, args, { stdio: 'inherit', shell: process.platform === 'win32', env: process.env });
  child.on('error', (error) => console.error(`[${name}] ${error.message}`));
  child.on('exit', (code, signal) => {
    if (code && code !== 0) console.error(`[${name}] exited with code ${code}`);
    if (!signal && code !== 0) shutdown(code);
  });
  return child;
});

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 200).unref();
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
console.log('Career Navigator full stack starting. Frontend: http://127.0.0.1:5173 | API: http://127.0.0.1:8787');
