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

This extension uses NPM packages (cash-dom, lodash-es) for cleaner code. You'll need to build it first:

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Or use watch mode for development
npm run watch
```

See [BUILD.md](BUILD.md) for detailed build instructions.

## Installation

### Option 1: Install from Chrome Web Store
*(Coming soon - not yet published)*

### Option 2: Install as Unpacked Extension (Developer Mode)

1. **Clone the repository and build**
   ```bash
   git clone <repository-url>
   cd sentinelone-json
   npm install
   npm run build
   ```

2. **Open Chrome Extensions page**
   - Open Chrome and navigate to `chrome://extensions/`
   - Or click: Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `sentinelone-json` folder
   - The extension should now appear in your extensions list

5. **Verify installation**
   - The extension icon should appear in your Chrome toolbar
   - Navigate to SentinelOne and open an event to test

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
   - Click "Copy to Clipboard" to copy the JSON
   - Click "Download JSON" to save as a file
   - Press ESC or click outside to close the modal

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
├── BUILD.md            # Build instructions
├── INSTALL.md          # Installation guide
└── README.md           # This file
```

## How It Works

1. **Content Script Injection**: The extension injects `content.js` into all SentinelOne pages
2. **Button Detection**: Uses MutationObserver to detect when event panels open
3. **Button Injection**: Adds a "See as JSON" button next to existing action buttons
4. **Data Extraction**: Scrapes event properties from the DOM when button is clicked
5. **JSON Display**: Shows the data in a beautiful modal with copy/download options

## Troubleshooting

### Button not appearing
- Make sure you're on a SentinelOne page
- Try refreshing the page
- Open an event to trigger the button injection

### JSON data is incomplete
- The extension extracts visible data from the DOM
- Some data might be lazy-loaded or hidden
- Try scrolling through the event properties first

### Extension not loading
- Make sure you ran `npm install` and `npm run build`
- Check that Developer Mode is enabled
- Verify all files are in the correct location
- Check the Chrome Extensions page for error messages
- Look for build errors in the terminal

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
