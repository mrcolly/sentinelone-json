# SentinelOne JSON Viewer

A Chrome extension that adds a "See as JSON" button to SentinelOne event logs, allowing you to view event properties in a beautiful, interactive JSON tree view.

## Features

- 🎯 **"See as JSON" button** - Adds a button next to "See in Thread Log" on event panels
- 🌲 **Interactive tree view** - Collapsible JSON with expand/collapse for objects and arrays
- 🔢 **Line numbers** - Easy reference and navigation
- 📋 **Double-click to copy** - Double-click any object/array to copy its JSON
- 🔍 **Search** - Find text in JSON with highlighting and navigation
- 🔄 **Parse JSON strings** - Automatically expand JSON embedded in string values
- 💾 **Download** - Save JSON as a file
- 🎨 **Dark theme** - Matches SentinelOne's interface

## Quick Start

1. Install the extension (see [Installation](#installation))
2. Navigate to SentinelOne and open an event
3. Click **"See as JSON"** next to "See in Thread Log"
4. Explore the JSON tree view!

## Development Setup

### First Time Setup

```bash
npm install
```

### Building

```bash
# Build once
npm run build

# Watch mode (rebuilds on file changes)
npm run watch

# Combined dev command
npm run dev
```

### NPM Packages

**Dependencies:**
- **cash-dom** - Lightweight jQuery alternative (~6KB)
- **lodash-es** - Utility library (using `set` for nested objects)

**Dev Dependencies:**
- **esbuild** - Fast JavaScript bundler
- **eslint** - JavaScript linter
- **stylelint** - CSS linter
- **prettier** - Code formatter

### File Structure

```
sentinelone-json/
├── src/
│   └── content.js      # Source code (with NPM imports)
├── build/
│   └── content.js      # Bundled file (used by extension)
├── manifest.json       # Extension configuration
├── styles.css          # Styling
├── build.js            # esbuild configuration
├── package.json        # NPM dependencies
├── icons/              # Extension icons
└── README.md
```

## Installation

### Option 1: Install from ZIP File

1. Extract `sentinelone-json.zip` to a folder
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the extracted folder
5. Navigate to SentinelOne and test!

### Option 2: Install from Repository

```bash
git clone <repository-url>
cd sentinelone-json
```

Then follow the same steps as Option 1, selecting the cloned folder.

> **Note**: Pre-built files are included - no need to run `npm install` unless modifying the code.

## Usage

### Basic Usage

1. Go to your SentinelOne instance
2. Click on any event to open the details panel
3. Click **"See as JSON"** button
4. View, search, or download the JSON

### Tree View Features

| Feature | How to Use |
|---------|------------|
| **Expand/Collapse** | Click the ▶ arrow |
| **Copy object/array** | Double-click on any `{` or `[` line |
| **Copy entire JSON** | Double-click the root `{` line |
| **Search** | Type in the search bar (min 2 chars) |
| **Navigate matches** | Use ↑/↓ buttons or Enter/Shift+Enter |
| **Parse JSON strings** | Click "🔄 Parse JSON Strings" button |
| **Download** | Click "Download JSON" button |
| **Close modal** | Press ESC or click outside |

### Search Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Next match |
| `Shift+Enter` | Previous match |
| `ESC` | Clear search |

### JSON String Parsing

Some API responses contain JSON as string values. Enable parsing to expand them:

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

## Creating a Distribution Package

```bash
npm run package
```

This creates `sentinelone-json.zip` with all necessary files.

## Troubleshooting

### Button not appearing
- Make sure you're on a SentinelOne page (`*.sentinelone.net`)
- Open an event (click on one in the list)
- Refresh the page and try again

### JSON data incomplete
- Scroll through event properties to trigger lazy loading
- Make sure the event panel is fully loaded

### Extension not loading after changes
- Run `npm run build`
- Go to `chrome://extensions/` and click refresh (🔄)
- Refresh SentinelOne tabs

### Uninstalling
1. Go to `chrome://extensions/`
2. Find "SentinelOne JSON Viewer"
3. Click **Remove**

## Privacy & Security

- Only runs on SentinelOne pages (`*.sentinelone.net`)
- No data sent to external servers
- All processing happens locally
- Only requires "activeTab" permission

## Version History

### 1.2.0
- Code quality improvements for SonarQube compliance
- Refactored for lower cognitive complexity
- Replaced deprecated APIs (unescape/escape)
- Added proper JSDoc documentation
- Extracted helper functions for better maintainability

### 1.1.0
- Added interactive tree view with expand/collapse
- Added line numbers
- Added double-click to copy any object/array
- Added JSON string parsing toggle
- Improved search with auto-expand and highlighting
- Removed Copy to Clipboard button (use double-click instead)

### 1.0.0
- Initial release
- "See as JSON" button
- JSON modal with copy and download

## License

MIT License - feel free to use and modify as needed.
