import { spawn } from 'node:child_process';
import process from 'node:process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const commands = [
  { name: 'frontend dependencies', args: ['ci', '--prefix', 'career navigator'] },
  { name: 'backend dependencies', args: ['install', '--prefix', 'backend'] }
];

for (const command of commands) {
  console.log(`\nInstalling ${command.name}…`);
  const result = await new Promise((resolve, reject) => {
    const child = spawn(npm, command.args, { stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
  if (result !== 0) process.exit(result);
}
console.log('\nSetup complete. Copy backend/.env.example to backend/.env and run npm run dev.');
