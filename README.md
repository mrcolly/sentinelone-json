# SentinelOne JSON Viewer

A Chrome extension that adds a "See as JSON" button to SentinelOne event logs, allowing you to view event properties in JSON format.

## Features

- 🎯 Adds a "See as JSON" button next to existing "See in Original Log" and "See in Thread Log" buttons
- 📋 View event properties in a clean, formatted JSON modal
- 📄 Copy JSON to clipboard with one click
- 💾 Download JSON as a file
- 🎨 Dark theme matching SentinelOne's interface
- ⚡ Works automatically when viewing events

## Installation

### Option 1: Install from Chrome Web Store
*(Coming soon - not yet published)*

### Option 2: Install as Unpacked Extension (Developer Mode)

1. **Download the extension files**
   - Clone or download this repository

2. **Create extension icons** (required)
   - Create an `icons` folder in the extension directory
   - Add three PNG icon files:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - You can use any icon or create a simple JSON-themed icon

3. **Open Chrome Extensions page**
   - Open Chrome and navigate to `chrome://extensions/`
   - Or click: Menu (⋮) → More Tools → Extensions

4. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

5. **Load the extension**
   - Click "Load unpacked"
   - Select the `sentinelone-json` folder
   - The extension should now appear in your extensions list

6. **Verify installation**
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
├── manifest.json       # Extension configuration
├── content.js          # Main logic for button injection and JSON extraction
├── styles.css          # Styling for button and modal
├── icons/              # Extension icons (you need to create these)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
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
- Check that Developer Mode is enabled
- Verify all files are in the correct location
- Check the Chrome Extensions page for error messages
- Make sure you've created the required icon files

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
