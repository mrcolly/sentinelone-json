// SentinelOne JSON Viewer Content Script
import { set } from 'lodash-es';
import $ from 'cash-dom';

// Wait for the DOM to be ready and watch for changes
let observer = null;
let jsonModalOpen = false;

function init() {
  // Use MutationObserver to detect when event panel opens
  observer = new MutationObserver(() => {
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
  $('div, header').each(function() {
    const $container = $(this);
    const $buttons = $container.find('button');
    
    let hasOriginalLog = false;
    let hasThreadLog = false;
    let hasJsonButton = false;
    
    $buttons.each(function() {
      const text = $(this).text().trim();
      if (text === 'See in Original Log') hasOriginalLog = true;
      if (text === 'See in Thread Log') hasThreadLog = true;
      if (text === 'See as JSON' || this.dataset.s1JsonButton === 'true') hasJsonButton = true;
    });
    
    // If we found both buttons and haven't added our button yet
    if (hasOriginalLog && hasThreadLog && !hasJsonButton) {
      injectJsonButton(this);
      return false; // Break the loop
    }
  });
}

function injectJsonButton(container) {
  const $container = $(container);
  const $existingButton = $container.find('button').first();
  
  // Create the JSON button with cash-dom
  const $jsonButton = $('<button>')
    .text('See as JSON')
    .addClass('s1-json-viewer-button')
    .attr('data-s1-json-button', 'true')
    .on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      extractAndShowJSON();
    });
  
  // Copy classes from existing button if available
  if ($existingButton.length) {
    const existingClasses = $existingButton.attr('class');
    $jsonButton.attr('class', existingClasses + ' s1-json-viewer-button');
  }
  
  // Insert after the last button
  const $lastButton = $container.find('button').last();
  if ($lastButton.length) {
    $lastButton.after($jsonButton);
  } else {
    $container.append($jsonButton);
  }
}

function extractAndShowJSON() {
  const eventData = {};
  
  // Find the Event properties section
  const $propertiesSection = findEventPropertiesSection();
  
  if (!$propertiesSection || !$propertiesSection.length) {
    alert('Could not find event properties. Please make sure an event is open.');
    return;
  }
  
  // Extract event time
  const bodyText = $('body').text();
  const eventTimeRegex = /Event Time[\s\S]*?(\w{3} \d{2}, \d{4} \d{2}:\d{2}:\d{2})/;
  const eventTimeMatch = eventTimeRegex.exec(bodyText);
  if (eventTimeMatch) {
    eventData.eventTime = eventTimeMatch[1];
  }
  
  // Extract all property rows
  const properties = extractProperties($propertiesSection);
  
  // Convert flat properties to nested structure using lodash
  const nestedProperties = convertToNestedObject(properties);
  eventData.properties = nestedProperties;
  
  // Show JSON in modal
  displayJSONModal(eventData);
}

/**
 * Converts flat dot-notation object to nested structure
 * Uses lodash.set for clean implementation
 */
function convertToNestedObject(flatObj) {
  const result = {};
  
  Object.entries(flatObj).forEach(([key, value]) => {
    // Skip keys with ellipsis (truncated UI text)
    if (key.includes('...')) return;
    
    // Clean the key - remove any empty segments
    const cleanKey = key
      .split('.')
      .filter(segment => segment.trim().length > 0)
      .join('.');
    
    // Only add if we have a valid key after cleaning
    if (cleanKey && cleanKey.length > 0) {
      set(result, cleanKey, value);
    }
  });
  
  return result;
}

function findEventPropertiesSection() {
  // Look for "Event properties" heading
  const $headings = $('h1, h2, h3, h4, h5, h6, div[class*="heading"], div[class*="title"], span[class*="heading"], span[class*="title"]');
  
  let $section = null;
  
  $headings.each(function() {
    const text = $(this).text().trim();
    
    if (text === 'Event properties') {
      // Try to find the container with the properties
      let $container = $(this).parent();
      
      // Try to find a more specific container (not the whole page)
      while ($container.length && !$container.is('body')) {
        const classes = $container.attr('class') || '';
        // Skip if it's the main shell/layout container
        if (classes.includes('Shell') || classes.includes('Layout_container')) {
          break;
        }
        // Look for a container that has property rows inside
        const $props = $container.find('div').filter(function() {
          const text = $(this).text();
          return text.match(/^[a-z]+\.[a-z_]+\.[a-z_]+$/);
        });
        
        if ($props.length > 5) {
          $section = $container;
          return false;
        }
        
        $container = $container.parent();
      }
      
      // If we didn't find a good container, use the immediate parent
      if (!$section || !$section.length) {
        $section = $(this).parent();
      }
      
      return false; // Break loop
    }
  });
  
  if ($section && $section.length) {
    return $section;
  }
  
  // Alternative: look for a container with many property-like elements
  // but NOT the main shell container
  let $found = null;
  let maxProps = 0;
  
  $('div[class], section[class]').each(function() {
    const $container = $(this);
    const classes = $container.attr('class') || '';
    
    // Skip main layout containers
    if (classes.includes('Shell') || 
        classes.includes('Layout_container') ||
        classes.includes('App')) {
      return; // Continue
    }
    
    // Count how many property-like direct children it has
    const $children = $container.children();
    let propCount = 0;
    
    $children.each(function() {
      const $child = $(this);
      if ($child.children().length === 2) {
        const key = $child.children().eq(0).text().trim();
        if (key.match(/^[a-z]+\.[a-z_.]+$/)) {
          propCount++;
        }
      }
    });
    
    if (propCount > maxProps && propCount > 3) {
      maxProps = propCount;
      $found = $container;
    }
  });
  
  return $found;
}

/**
 * Checks if a key is a valid property name (not UI text or log format)
 */
function isValidPropertyKey(key) {
  // Skip empty or very short keys
  if (!key || key.length < 2) return false;
  
  // Skip UI elements and buttons
  if (key.includes('See as JSON') || 
      key.includes('See in ') ||
      key.includes('Collapse') ||
      key.includes('Search')) {
    return false;
  }
  
  // Skip truncated text with ellipsis (UI abbreviation)
  if (key.includes('...')) return false;
  
  // Skip log message formats with pipes and datetime stamps
  if (key.includes('|') || 
      key.includes('PM') || 
      key.includes('AM') ||
      key.match(/\d{1,2}:\d{2}:\d{2}/)) { // Time pattern
    return false;
  }
  
  // Skip keys with equals signs (log format)
  if (key.includes('=')) return false;
  
  // Skip keys with emojis (log messages)
  if (key.match(/[\u{1F000}-\u{1F9FF}]/u)) return false;
  
  // Skip keys with quotes (log message attributes)
  if (key.includes('\'') || key.includes('"')) return false;
  
  // Skip header-like text
  if (key.includes('Event properties') || 
      key.includes('Event Time')) {
    return false;
  }
  
  // Must contain dot or underscore (property naming convention)
  if (!key.includes('.') && !key.includes('_')) return false;
  
  // Must be reasonable length
  if (key.length > 150) return false;
  
  // Should look like a property path (alphanumeric, dots, underscores, hyphens)
  // Allow some special chars but not too many
  const specialChars = (key.match(/[^a-zA-Z0-9._-]/g) || []).length;
  if (specialChars > 3) return false;
  
  return true;
}

/**
 * Cleans and validates a property value
 */
function cleanPropertyValue(value) {
  if (!value) return null;
  
  const cleaned = value.trim();
  
  // Skip very long values (likely corrupted data)
  if (cleaned.length > 1000) return null;
  
  // Skip values that look like they contain full log lines
  if (cleaned.includes('|') && cleaned.length > 100) return null;
  
  return cleaned;
}

function extractProperties($container) {
  const properties = {};
  
  // Find the collapsible content div (where properties actually are)
  const $content = $container.find('div[class*="collapsible-content"]');
  
  if ($content.length) {
    // EXTRACT: Find all property wrappers and extract key-value pairs
    const $propertyWrappers = $content.find('div[class*="GyObjectAttribute-module_root-wrapper"]');
    
    $propertyWrappers.each(function() {
      const $wrapper = $(this);
      const $innerDiv = $wrapper.find('div[class*="EventDetailField_container"]');
      
      if ($innerDiv.length) {
        const $labelWrapper = $innerDiv.find('div[class*="label-wrapper"]');
        const $valueWrapper = $innerDiv.find('div[class*="value-wrapper"]');
        
        if ($labelWrapper.length && $valueWrapper.length) {
          const key = $labelWrapper.text().trim();
          const value = $valueWrapper.text().trim();
          
          if (isValidPropertyKey(key)) {
            const cleanedValue = cleanPropertyValue(value);
            if (cleanedValue) {
              properties[key] = cleanedValue;
            }
          }
        }
      }
    });
    
    // If we found properties, return them now
    if (Object.keys(properties).length > 0) {
      return properties;
    }
  }
  
  // Otherwise fall back to old strategies
  
  // Strategy 1: Look for paired elements (common in modern web apps)
  const $rows = $container.find('div[class*="row"], tr, li, div[class*="property"], div[class*="item"]');
  
  $rows.each(function() {
    const $row = $(this);
    const $children = $row.children();
    
    // If row has exactly 2 children, they might be key-value
    if ($children.length === 2) {
      const key = $children.eq(0).text().trim();
      const value = $children.eq(1).text().trim();
      
      if (isValidPropertyKey(key)) {
        const cleanedValue = cleanPropertyValue(value);
        if (cleanedValue) {
          properties[key] = cleanedValue;
        }
      }
    }
    // Try to extract from text content with patterns like "key value"
    else if ($children.length > 0) {
      const $spans = $row.find('span, div, td');
      if ($spans.length >= 2) {
        const key = $spans.eq(0).text().trim();
        const value = $spans.eq(1).text().trim();
        
        if (isValidPropertyKey(key)) {
          const cleanedValue = cleanPropertyValue(value);
          if (cleanedValue) {
            properties[key] = cleanedValue;
          }
        }
      }
    }
  });
  
  // Strategy 2: If no properties found, try to parse visible text
  if (Object.keys(properties).length === 0) {
    const text = $container.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length - 1;) {
      const key = lines[i].trim();
      const value = lines[i + 1].trim();
      
      if (isValidPropertyKey(key)) {
        const cleanedValue = cleanPropertyValue(value);
        if (cleanedValue) {
          properties[key] = cleanedValue;
          i += 2; // Skip both key and value lines
        } else {
          i++;
        }
      } else {
        i++;
      }
    }
  }
  
  return properties;
}

function displayJSONModal(data) {
  // Remove existing modal if any
  const $existing = $('#s1-json-modal');
  if ($existing.length) {
    $existing.remove();
    jsonModalOpen = false;
    return;
  }
  
  jsonModalOpen = true;
  
  // Create modal with cash-dom
  const $modal = $('<div>')
    .attr('id', 's1-json-modal')
    .addClass('s1-json-modal');
  
  const jsonString = JSON.stringify(data, null, 2);
  
  // Build modal structure with cash-dom
  const $header = $('<div>').addClass('s1-json-modal-header')
    .append($('<h2>').text('Event JSON'))
    .append(
      $('<button>')
        .text('×')
        .addClass('s1-json-modal-close')
        .on('click', () => {
          $modal.remove();
          jsonModalOpen = false;
        })
    );
  
  const $jsonContainer = $('<div>').addClass('s1-json-container')
    .append(
      $('<pre>').addClass('s1-json-pre')
        .append($('<code>').text(jsonString))
    );
  
  const $copyBtn = $('<button>')
    .text('Copy to Clipboard')
    .addClass('s1-json-copy-btn')
    .on('click', function() {
      const $btn = $(this);
      navigator.clipboard.writeText(jsonString).then(() => {
        const originalText = $btn.text();
        $btn.text('✓ Copied!');
        setTimeout(() => $btn.text(originalText), 2000);
      });
    });
  
  const $downloadBtn = $('<button>')
    .text('Download JSON')
    .addClass('s1-json-download-btn')
    .on('click', () => {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const $a = $('<a>')
        .attr('href', url)
        .attr('download', `sentinelone-event-${Date.now()}.json`)
        .get(0);
      $a.click();
      URL.revokeObjectURL(url);
    });
  
  const $buttonContainer = $('<div>')
    .addClass('s1-json-button-container')
    .append($copyBtn)
    .append($downloadBtn);
  
  const $modalContent = $('<div>')
    .addClass('s1-json-modal-content')
    .append($header)
    .append($jsonContainer)
    .append($buttonContainer);
  
  $modal.append($modalContent);
  $('body').append($modal);
  
  // Close on outside click
  $modal.on('click', function(e) {
    if (e.target === this) {
      $(this).remove();
      jsonModalOpen = false;
    }
  });
  
  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape' && jsonModalOpen) {
      $modal.remove();
      jsonModalOpen = false;
      $(document).off('keydown', escapeHandler);
    }
  };
  $(document).on('keydown', escapeHandler);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
