const { spawn } = require('child_process');
const path = require('path');

// Start Vite dev server
console.log('Starting Vite dev server...');
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Wait a moment for Vite to start, then launch Electron
setTimeout(() => {
  console.log('Starting Electron...');
  const electronProcess = spawn('electron', [path.join(__dirname, '../electron/main.js')], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  electronProcess.on('close', () => {
    console.log('Electron closed, stopping Vite...');
    viteProcess.kill();
    process.exit(0);
  });
}, 3000);

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
  process.exit(code);
});