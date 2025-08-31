module.exports = {
  appId: 'com.laperle.rouge.cafe',
  productName: 'La Perle Rouge',
  copyright: 'Copyright © 2024 La Perle Rouge',
  
  directories: {
    output: 'dist-electron',
    buildResources: 'build'
  },
  
  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json'
  ],
  
  extraFiles: [
    {
      from: 'public',
      to: 'public',
      filter: ['**/*']
    }
  ],
  
  mac: {
    category: 'public.app-category.business',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'public/favicon.ico'
  },
  
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      },
      {
        target: 'portable',
        arch: ['x64', 'ia32']
      }
    ],
    icon: 'public/favicon.ico'
  },
  
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      }
    ],
    category: 'Office',
    icon: 'public/favicon.ico'
  },
  
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'La Perle Rouge'
  },
  
  dmg: {
    title: 'La Perle Rouge Installer',
    icon: 'public/favicon.ico'
  },
  
  publish: null
};