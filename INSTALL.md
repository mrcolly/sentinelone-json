# Installation Guide

## Quick Installation Steps

### 1. Open Chrome Extensions Page
- Open Google Chrome
- Type `chrome://extensions/` in the address bar and press Enter
- OR click the menu (⋮) → More Tools → Extensions

### 2. Enable Developer Mode
- Look for the "Developer mode" toggle in the top-right corner
- Turn it ON (it should turn blue)

### 3. Load the Extension
- Click the "Load unpacked" button that appears after enabling Developer Mode
- Navigate to and select the `sentinelone-json` folder
- Click "Select" or "Open"

### 4. Verify Installation
- You should see "SentinelOne JSON Viewer" in your extensions list
- The extension should show as "Enabled"
- You may see the extension icon in your Chrome toolbar

### 5. Test the Extension
1. Navigate to SentinelOne: `https://euce1-klarna.sentinelone.net/events/search?_scopeId=2142298462648495003&_scopeLevel=account&_categoryId=eventSearch`
2. Click on any event to open the event details panel
3. Look for the new **"See as JSON"** button next to "See in Thread Log"
4. Click the button to view the event data in JSON format!

## Troubleshooting

### Extension doesn't appear
- Make sure Developer Mode is enabled
- Try refreshing the Extensions page
- Check that you selected the correct folder (the one containing manifest.json)

### Button doesn't show up
- Refresh the SentinelOne page
- Make sure you've opened an event (click on an event in the list)
- Check the browser console (F12) for any errors

### "Manifest file is missing or unreadable" error
- Make sure you selected the `sentinelone-json` folder, not a parent folder
- Verify that manifest.json exists in the selected folder

## Updating the Extension

If you make changes to the extension files:
1. Go to `chrome://extensions/`
2. Find "SentinelOne JSON Viewer"
3. Click the refresh icon (🔄) on the extension card
4. Refresh any open SentinelOne tabs

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "SentinelOne JSON Viewer"
3. Click "Remove"
4. Confirm the removal

## Support

If you encounter any issues, please check:
- The browser console (F12) for JavaScript errors
- That you're on the correct SentinelOne URL
- That the page has fully loaded before opening an event
