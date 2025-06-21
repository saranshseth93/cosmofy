#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a secure random session secret
function generateSessionSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Create .env file with secure defaults
function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const sessionSecret = generateSessionSecret();
  
  const envContent = `# Cosmofy Environment Configuration
# Generated on ${new Date().toISOString()}

# NASA API Configuration (REQUIRED)
# Get your free API key at: https://api.nasa.gov/
NASA_API_KEY=DEMO_KEY
VITE_NASA_API_KEY=DEMO_KEY

# Session Security (Auto-generated secure key)
SESSION_SECRET=${sessionSecret}

# Development Settings
NODE_ENV=development

# Optional: PostgreSQL Database (uncomment if using persistent storage)
# DATABASE_URL=postgresql://username:password@localhost:5432/cosmofy

# Optional: External API Keys (for enhanced features)
# SPACEFLIGHT_NEWS_API=your_spaceflight_news_api_key
# NOAA_SPACE_WEATHER_API=your_noaa_api_key
`;

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Creating .env.example instead.');
    fs.writeFileSync(path.join(process.cwd(), '.env.example'), envContent);
    console.log('✅ Created .env.example with secure session secret');
    console.log('📝 Copy .env.example to .env and add your NASA API key');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with secure session secret');
    console.log('🔑 Replace DEMO_KEY with your actual NASA API key from https://api.nasa.gov/');
  }
  
  console.log('\n🔐 Your secure session secret has been generated automatically');
  console.log('⚡ Run "npm install" then "npm run dev" to start the application\n');
}

// Run the script
console.log('🚀 Setting up Cosmofy environment...\n');
createEnvFile();