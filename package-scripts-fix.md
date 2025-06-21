# Windows npm Scripts Fix

The issue is that Windows doesn't recognize the `NODE_ENV=development` syntax. Here are the solutions:

## Option 1: Use cross-env (Recommended)
```bash
npm install --save-dev cross-env
```

Then update package.json scripts:
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "start": "cross-env NODE_ENV=production node dist/index.js"
  }
}
```

## Option 2: Use separate commands for Windows
Create these scripts in package.json:
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "dev:windows": "set NODE_ENV=development && tsx server/index.ts",
    "start": "node dist/index.js",
    "start:windows": "set NODE_ENV=production && node dist/index.js"
  }
}
```

## Option 3: Use .env file (Current project setup)
Since your project already uses .env files, the NODE_ENV in package.json is redundant.

Update package.json to:
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "start": "node dist/index.js"
  }
}
```

And ensure your .env file contains:
```env
NODE_ENV=development
```

## Immediate Fix
Run this command instead:
```bash
# Windows
set NODE_ENV=development && tsx server/index.ts

# Or simply (since .env file handles NODE_ENV)
npx tsx server/index.ts
```