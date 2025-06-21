#!/usr/bin/env node
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read current package.json
const packagePath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Update scripts to use cross-env for Windows compatibility
packageData.scripts = {
  ...packageData.scripts,
  "dev": "cross-env NODE_ENV=development tsx server/index.ts",
  "start": "cross-env NODE_ENV=production node dist/index.js",
  "setup": "node generate-env.js"
};

// Write updated package.json
fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));

console.log('✅ Updated npm scripts for Windows compatibility');
console.log('🚀 You can now run: npm run dev');
console.log('⚙️  Also available: npm run setup (to generate .env file)');