import { spawn } from 'node:child_process';
import process from 'node:process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
for (const args of [
  ['test', '--prefix', 'backend'],
  ['test', '--prefix', 'career navigator'],
  ['audit', '--prefix', 'backend', '--audit-level=high'],
  ['audit', '--prefix', 'career navigator', '--audit-level=high']
]) {
  console.log(`\n$ npm ${args.join(' ')}`);
  const code = await new Promise((resolve, reject) => {
    const child = spawn(npm, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('error', reject);
    child.on('exit', (exitCode) => resolve(exitCode ?? 1));
  });
  if (code !== 0) process.exit(code);
}
console.log('\nAll backend/frontend tests and dependency audits passed.');
