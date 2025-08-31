const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function buildElectron() {
  try {
    console.log('Building React app for production...');
    
    // Build the React app
    await new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'inherit',
        shell: true
      });
      
      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Build process exited with code ${code}`));
        }
      });
    });

    console.log('React app built successfully!');
    console.log('Building Electron app...');

    // Build Electron app
    await new Promise((resolve, reject) => {
      const electronBuildProcess = spawn('electron-builder', ['--publish=never'], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      electronBuildProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Electron build process exited with code ${code}`));
        }
      });
    });

    console.log('Electron app built successfully!');
    console.log('Check the dist folder for your built application.');

  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

buildElectron();