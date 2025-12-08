// SentinelOne JSON Viewer Content Script

// Wait for the DOM to be ready and watch for changes
let observer = null;
let jsonModalOpen = false;

function init() {
  // Use MutationObserver to detect when event panel opens
  observer = new MutationObserver((mutations) => {
    checkAndInjectButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial check
  checkAndInjectButton();
}

function checkAndInjectButton() {
  // Look for the button container with "See in Original Log" and "See in Thread Log"
  const buttonContainers = document.querySelectorAll('div, header');
  
  for (const container of buttonContainers) {
    const buttons = container.querySelectorAll('button');
    let hasOriginalLog = false;
    let hasThreadLog = false;
    let hasJsonButton = false;
    
    buttons.forEach(btn => {
      const text = btn.textContent.trim();
      if (text === 'See in Original Log') hasOriginalLog = true;
      if (text === 'See in Thread Log') hasThreadLog = true;
      if (text === 'See as JSON' || btn.dataset.s1JsonButton === 'true') hasJsonButton = true;
    });
    
    // If we found both buttons and haven't added our button yet
    if (hasOriginalLog && hasThreadLog && !hasJsonButton) {
      injectJsonButton(container);
      break;
    }
  }
}

function injectJsonButton(container) {
  // Create the JSON button
  const jsonButton = document.createElement('button');
  jsonButton.textContent = 'See as JSON';
  jsonButton.className = 's1-json-viewer-button';
  jsonButton.dataset.s1JsonButton = 'true'; // Mark button to prevent duplicates
  
  // Try to match the styling of existing buttons
  const existingButton = container.querySelector('button');
  if (existingButton) {
    // Copy classes from existing button (but keep our custom class too)
    const existingClasses = existingButton.className;
    jsonButton.className = existingClasses + ' s1-json-viewer-button';
  }
  
  jsonButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    extractAndShowJSON();
  });
  
  // Insert the button after the last button in the container
  const lastButton = Array.from(container.querySelectorAll('button')).pop();
  if (lastButton?.parentNode) {
    lastButton.parentNode.insertBefore(jsonButton, lastButton.nextSibling);
  } else {
    container.appendChild(jsonButton);
  }
}

function extractAndShowJSON() {
  const eventData = {};
  
  // Find the Event properties section
  const propertiesSection = findEventPropertiesSection();
  
  if (!propertiesSection) {
    alert('Could not find event properties. Please make sure an event is open.');
    return;
  }
  
  // Extract event time
  const bodyText = document.querySelector('body')?.innerText;
  const eventTimeRegex = /Event Time[\s\S]*?(\w{3} \d{2}, \d{4} \d{2}:\d{2}:\d{2})/;
  const eventTimeElement = bodyText ? eventTimeRegex.exec(bodyText) : null;
  if (eventTimeElement) {
    eventData.eventTime = eventTimeElement[1];
  }
  
  // Extract all property rows
  const properties = extractProperties(propertiesSection);
  
  // Convert flat properties to nested structure
  const nestedProperties = convertToNestedObject(properties);
  eventData.properties = nestedProperties;
  
  // Show JSON in modal
  displayJSONModal(eventData);
}

function convertToNestedObject(flatObj) {
  const result = {};
  
  for (const [key, value] of Object.entries(flatObj)) {
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (i === parts.length - 1) {
        // Last part, set the value
        current[part] = value;
      } else {
        // Create nested object if it doesn't exist
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  
  return result;
}

function findEventPropertiesSection() {
  // Look for "Event properties" heading
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, div[class*="heading"], div[class*="title"]');
  
  for (const heading of headings) {
    if (heading.textContent.trim() === 'Event properties') {
      // Return the parent container
      return heading.closest('div[class*="section"], section') || heading.parentElement;
    }
  }
  
  // Alternative: look for elements containing property-like patterns
  const allDivs = document.querySelectorAll('div');
  for (const div of allDivs) {
    const text = div.textContent;
    if (text.includes('log.meta.') || text.includes('source.c2c.')) {
      return div;
    }
  }
  
  return null;
}

function extractProperties(container) {
  const properties = {};
  
  // Try multiple strategies to extract key-value pairs
  
  // Strategy 1: Look for paired elements (common in modern web apps)
  const rows = container.querySelectorAll('div[class*="row"], tr, li, div[class*="property"], div[class*="item"]');
  
  rows.forEach(row => {
    const children = Array.from(row.children);
    
    // If row has exactly 2 children, they might be key-value
    if (children.length === 2) {
      const key = children[0].textContent.trim();
      const value = children[1].textContent.trim();
      if (key && value && key.length < 200) {
        properties[key] = value;
      }
    }
    // Try to extract from text content with patterns like "key value"
    else if (children.length > 0) {
      const spans = row.querySelectorAll('span, div, td');
      if (spans.length >= 2) {
        const key = spans[0].textContent.trim();
        const value = spans[1].textContent.trim();
        if (key && value && (key.includes('.') || key.includes('_'))) {
          properties[key] = value;
        }
      }
    }
  });
  
  // Strategy 2: If no properties found, try to parse visible text
  if (Object.keys(properties).length === 0) {
    const text = container.textContent;
    const lines = text.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length - 1;) {
      const key = lines[i].trim();
      const value = lines[i + 1].trim();
      
      // Look for property-like keys
      if ((key.includes('.') || key.includes('_')) && 
          key.length < 100 && 
          value.length < 500 &&
          !key.includes('Event properties') &&
          !key.includes('Search')) {
        properties[key] = value;
        i += 2; // Skip both key and value lines
      } else {
        i++;
      }
    }
  }
  
  return properties;
}

function displayJSONModal(data) {
  // Remove existing modal if any
  const existing = document.getElementById('s1-json-modal');
  if (existing) {
    existing.remove();
    jsonModalOpen = false;
    return;
  }
  
  jsonModalOpen = true;
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 's1-json-modal';
  modal.className = 's1-json-modal';
  
  const modalContent = document.createElement('div');
  modalContent.className = 's1-json-modal-content';
  
  // Header
  const header = document.createElement('div');
  header.className = 's1-json-modal-header';
  
  const title = document.createElement('h2');
  title.textContent = 'Event JSON';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.className = 's1-json-modal-close';
  closeBtn.onclick = () => {
    modal.remove();
    jsonModalOpen = false;
  };
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // JSON content
  const jsonContainer = document.createElement('div');
  jsonContainer.className = 's1-json-container';
  
  const pre = document.createElement('pre');
  pre.className = 's1-json-pre';
  
  const code = document.createElement('code');
  code.textContent = JSON.stringify(data, null, 2);
  
  pre.appendChild(code);
  jsonContainer.appendChild(pre);
  
  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy to Clipboard';
  copyBtn.className = 's1-json-copy-btn';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });
  };
  
  // Download button
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = 'Download JSON';
  downloadBtn.className = 's1-json-download-btn';
  downloadBtn.onclick = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinelone-event-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 's1-json-button-container';
  buttonContainer.appendChild(copyBtn);
  buttonContainer.appendChild(downloadBtn);
  
  modalContent.appendChild(header);
  modalContent.appendChild(jsonContainer);
  modalContent.appendChild(buttonContainer);
  modal.appendChild(modalContent);
  
  document.body.appendChild(modal);
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      jsonModalOpen = false;
    }
  });
  
  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape' && jsonModalOpen) {
      modal.remove();
      jsonModalOpen = false;
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
