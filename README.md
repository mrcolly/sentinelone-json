# SentinelOne JSON Viewer

A Chrome extension that adds a "See as JSON" button to SentinelOne event logs, allowing you to view event properties in JSON format.

## Features

- 🎯 Adds a "See as JSON" button next to existing "See in Original Log" and "See in Thread Log" buttons
- 📋 View event properties in a clean, formatted JSON modal
- 📄 Copy JSON to clipboard with one click
- 💾 Download JSON as a file
- 🎨 Dark theme matching SentinelOne's interface
- ⚡ Works automatically when viewing events

## Development Setup

This extension uses NPM packages (cash-dom, lodash-es) bundled with esbuild for cleaner code.

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

### NPM Packages Used

**Dependencies:**
- **cash-dom** - Lightweight jQuery alternative for DOM manipulation (~6KB gzipped)
- **lodash-es** - Utility library (we use `set` for nested objects)

**Dev Dependencies:**
- **esbuild** - Fast JavaScript bundler (~30ms build time)
- **eslint** - JavaScript linter
- **stylelint** - CSS linter
- **prettier** - Code formatter

### What Gets Built

- **Source:** `src/content.js` (imports cash-dom, lodash-es)
- **Output:** `build/content.js` (bundled, ready for Chrome)

## Installation

### Option 1: Install from Chrome Web Store
*(Coming soon - not yet published)*

### Option 2: Install from ZIP File

1. **Extract the ZIP file**
   - Extract `sentinelone-json.zip` to a folder on your computer

2. **Open Chrome Extensions page**
   - Open Chrome and navigate to `chrome://extensions/`
   - Or click: Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the extracted folder
   - The extension should now appear in your extensions list

5. **Verify installation**
   - The extension icon should appear in your Chrome toolbar
   - Navigate to SentinelOne and open an event to test

> **Note**: The extension includes pre-built files, so you can use it immediately. If you want to modify the source code in `src/content.js`, you'll need to run `npm install` and `npm run build`.

### Option 3: Install from Repository (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sentinelone-json
   ```

   > **Note**: The build files are already included in the repository, so you don't need to rebuild unless you're modifying the code. If you do want to make changes, see the [Development Setup](#development-setup) section.

2. **Open Chrome Extensions page**
   - Open Chrome and navigate to `chrome://extensions/`
   - Or click: Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner (it should turn blue)

4. **Load the extension**
   - Click "Load unpacked"
   - Navigate to and select the `sentinelone-json` folder
   - Click "Select" or "Open"

5. **Verify installation**
   - You should see "SentinelOne JSON Viewer" in your extensions list
   - The extension should show as "Enabled"
   - The extension icon should appear in your Chrome toolbar

### Updating the Extension

If you make changes to the extension files or pull new updates:

1. Go to `chrome://extensions/`
2. Find "SentinelOne JSON Viewer"
3. Click the refresh icon (🔄) on the extension card
4. Refresh any open SentinelOne tabs

## Usage

1. **Navigate to SentinelOne**
   - Go to your SentinelOne instance (e.g., `https://[your-instance].sentinelone.net/`)

2. **Open an event**
   - Click on any event to open the event details panel

3. **Click "See as JSON"**
   - Look for the new button next to "See in Thread Log"
   - Click it to open the JSON modal

4. **View, Copy, or Download**
   - View the formatted JSON in the modal
   - Use the search bar to find specific properties or values
   - Click "🔄 Parse JSON Strings" to automatically expand JSON string values into objects
   - Click "Copy to Clipboard" to copy the JSON
   - Click "Download JSON" to save as a file
   - Press ESC or click outside to close the modal

### Search Feature

The JSON modal includes a powerful search feature:

- **Search bar**: Type to search for any text in the JSON (case-insensitive)
- **Match highlighting**: All matches are highlighted in yellow
- **Current match**: The active match is highlighted with a border
- **Match counter**: Shows "X of Y" matches found
- **Navigation**: 
  - Click ↑/↓ buttons to navigate between matches
  - Press `Enter` to go to next match
  - Press `Shift+Enter` to go to previous match
  - Press `ESC` to clear search
- **Auto-scroll**: Automatically scrolls to show the current match

### JSON String Parsing

Some API responses contain JSON as string values. The extension can automatically parse these:

- **Toggle button**: Click "🔄 Parse JSON Strings" to enable/disable
- **Auto-detection**: Detects strings that start with `[` or `{`
- **Recursive parsing**: Parses nested JSON strings at any depth
- **Visual feedback**: Button changes to "✓ JSON Strings Parsed" when active

**Example:**
```json
// Before parsing:
"experiments": "[{\"reference\":\"test\",\"variate\":\"enabled\"}]"

// After parsing:
"experiments": [
  {
    "reference": "test",
    "variate": "enabled"
  }
]
```

## File Structure

```
sentinelone-json/
├── src/
│   └── content.js      # Source code (with NPM imports)
├── build/
│   └── content.js      # Built/bundled file (used by extension)
├── manifest.json       # Extension configuration
├── styles.css          # Styling for button and modal
├── build.js            # esbuild configuration
├── package.json        # NPM dependencies
├── icons/              # Extension icons
│   ├── icon16.svg/.png
│   ├── icon48.svg/.png
│   └── icon128.svg/.png
└── README.md           # This file
```

## How It Works

1. **Content Script Injection**: The extension injects `content.js` into all SentinelOne pages
2. **Button Detection**: Uses MutationObserver to detect when event panels open
3. **Button Injection**: Adds a "See as JSON" button next to existing action buttons
4. **Data Extraction**: Scrapes event properties from the DOM when button is clicked
5. **JSON Display**: Shows the data in a beautiful modal with copy/download options

## Troubleshooting

### Extension doesn't appear in Chrome
- Make sure Developer Mode is enabled in `chrome://extensions/`
- Try refreshing the Extensions page
- Check that you selected the correct folder (the one containing `manifest.json`)
- Verify all files are present in the extension folder

### "Manifest file is missing or unreadable" error
- Make sure you selected the `sentinelone-json` folder, not a parent folder
- Verify that `manifest.json` exists in the selected folder

### Button not appearing on SentinelOne
- Make sure you're on a SentinelOne page (`*.sentinelone.net`)
- Refresh the SentinelOne page
- Open an event (click on an event in the list) to trigger the button injection
- Check the browser console (F12) for any JavaScript errors

### JSON data is incomplete
- The extension extracts visible data from the DOM
- Some data might be lazy-loaded or hidden
- Try scrolling through the event properties first
- Make sure the event details panel is fully loaded

### Extension not loading after code changes
- Make sure you ran `npm install` and `npm run build` after pulling updates
- Go to `chrome://extensions/` and click the refresh icon (🔄) on the extension
- Refresh any open SentinelOne tabs
- Check the Chrome Extensions page for error messages
- Look for build errors in the terminal

### Uninstalling

To remove the extension:

1. Go to `chrome://extensions/`
2. Find "SentinelOne JSON Viewer"
3. Click "Remove"
4. Confirm the removal

## Creating a Distribution Package

To create a distributable ZIP file:

```bash
# Make sure dependencies are installed
npm install

# Create the package
npm run package
```

This will create `sentinelone-json.zip` containing:
- `manifest.json` - Extension configuration
- `styles.css` - Styling
- `build/content.js` - Bundled code (pre-built)
- `icons/` - All icon files
- `src/content.js` - Source code
- `README.md` - Documentation

The ZIP file can be shared and installed using the [Install from ZIP File](#option-2-install-from-zip-file) instructions.

> **Note**: The ZIP includes pre-built files, so it can be installed immediately without Node.js or NPM. The source code is included for reference and modification.

## Privacy & Security

- This extension only runs on SentinelOne pages (*.sentinelone.net)
- No data is sent to external servers
- All processing happens locally in your browser
- Only requires "activeTab" permission

## Contributing

Feel free to submit issues or pull requests if you'd like to improve this extension!

## License

MIT License - feel free to use and modify as needed.

## Version History

### 1.0.0 (Initial Release)
- Added "See as JSON" button to event panels
- JSON modal with copy and download functionality
- Dark theme matching SentinelOne UI
- Automatic detection of event panels
