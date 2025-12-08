# Build Instructions

This extension now uses **esbuild** to bundle NPM packages into the content script.

## Development Workflow

### First Time Setup

```bash
# Install dependencies
npm install
```

### Building

```bash
# Build once
npm run build

# Watch mode (rebuilds on file changes)
npm run watch

# Or use the combined dev command
npm run dev
```

### What Gets Built

- **Source:** `src/content.js` (imports cash-dom, lodash-es)
- **Output:** `build/content.js` (bundled, ready for Chrome)

## Project Structure

```
sentinelone-json/
├── src/
│   └── content.js          # Source file with imports
├── build/
│   └── content.js          # Built/bundled file (used by extension)
├── build.js                # esbuild configuration
├── package.json            # Dependencies & scripts
└── manifest.json           # Points to build/content.js
```

## NPM Packages Used

### Dependencies
- **cash-dom** - Lightweight jQuery alternative for DOM manipulation (~6KB gzipped)
- **lodash-es** - Utility library (we use `set` for nested objects)

### Dev Dependencies
- **esbuild** - Fast JavaScript bundler (~30ms build time)
- **eslint** - JavaScript linter
- **stylelint** - CSS linter
- **prettier** - Code formatter

## Why This Setup?

### Benefits
✅ Use NPM packages in content scripts  
✅ Cleaner code with battle-tested utilities  
✅ jQuery-like DOM manipulation with cash-dom  
✅ Fast builds with esbuild (~30ms)  
✅ Modern ES6 imports  
✅ Better code organization  

### Tradeoffs
⚠️ Requires build step  
⚠️ Slightly larger bundle size  
⚠️ Need to rebuild after changes  

## For Production

To minimize bundle size:

1. Edit `build.js` and set `minify: true`
2. Run `npm run build`
3. Bundle size will be optimized

## Testing After Build

1. Build the extension: `npm run build`
2. Go to `chrome://extensions/`
3. Click reload on the extension
4. Test on SentinelOne

## Alternative: No Build Step

If you prefer zero dependencies:
- Use the original `content.js` from git history
- No build step needed
- Slightly more code but no tooling required
