const fs = require('fs');
const path = require('path');

// Specify the path to your service worker file
const swFilePath = path.join(__dirname, '../public/service-worker.js');

// Read the current content of the service worker file
let swContent = fs.readFileSync(swFilePath, 'utf8');

// Generate a version string - here we use a timestamp for simplicity
const versionStr = `// Version: ${new Date().toISOString()}\n`;

// Prepend the version string to the service worker file content
swContent = versionStr + swContent;

// Write the modified content back to the service worker file
fs.writeFileSync(swFilePath, swContent);

console.log('Service worker updated with new version.');
