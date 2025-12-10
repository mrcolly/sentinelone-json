// SentinelOne JSON Viewer Content Script
import { set } from 'lodash-es';
import $ from 'cash-dom';

// Constants for validation thresholds
const MIN_KEY_LENGTH = 2;
const MAX_KEY_LENGTH = 150;
const MAX_SPECIAL_CHARS = 3;
const MIN_PROPERTY_COUNT = 5;

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
  // Look for button groups that contain "See in Original Log" and "See in Thread Log"
  // Check if container is already processed
  $('button').each(function() {
    const $btn = $(this);
    const text = $btn.text().trim();
    
    // Found a "See in Thread Log" button
    if (text === 'See in Thread Log') {
      const $container = $btn.parent();
      
      // Skip if already processed
      if ($container.attr('data-s1-json-processed') === 'true') {
        return; // Continue to next
      }
      
      // Check if siblings include required buttons
      const $siblings = $container.find('button');
      let hasOriginalLog = false;
      let hasThreadLog = false;
      let hasJsonButton = false;
      
      $siblings.each(function() {
        const siblingText = $(this).text().trim();
        if (siblingText === 'See in Original Log') hasOriginalLog = true;
        if (siblingText === 'See in Thread Log') hasThreadLog = true;
        if (siblingText === 'See as JSON' || this.dataset.s1JsonButton === 'true') hasJsonButton = true;
      });
      
      // If we have both required buttons and no JSON button, inject it
      if (hasOriginalLog && hasThreadLog && !hasJsonButton) {
        $container.attr('data-s1-json-processed', 'true');
        injectJsonButton($container.get(0));
        return false; // Break the loop
      }
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
  
  // Extract event time
  const bodyText = $('body').text();
  const eventTimeRegex = /Event Time[\s\S]*?(\w{3} \d{2}, \d{4} \d{2}:\d{2}:\d{2})/;
  const eventTimeMatch = eventTimeRegex.exec(bodyText);
  if (eventTimeMatch) {
    eventData.eventTime = eventTimeMatch[1];
  }
  
  // Find and extract Event properties section
  const $propertiesSection = findSection('Event properties');
  let allProperties = {};
  
  if ($propertiesSection?.length) {
    const properties = extractProperties($propertiesSection);
    allProperties = { ...allProperties, ...properties };
  }
  
  // Find and extract Server info section
  const $serverInfoSection = findSection('Server info');
  if ($serverInfoSection?.length) {
    const serverInfo = extractProperties($serverInfoSection);
    allProperties = { ...allProperties, ...serverInfo };
  }
  
  if (Object.keys(allProperties).length === 0) {
    alert('Could not find event properties. Please make sure an event is open.');
    return;
  }
  
  // Convert flat properties to nested structure using lodash
  const nestedProperties = convertToNestedObject(allProperties);
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

/**
 * Find a section by its heading text (e.g., "Event properties", "Server info")
 */
function findSection(sectionName) {
  // Look for heading with the section name
  const $headings = $('h1, h2, h3, h4, h5, h6, div[class*="heading"], div[class*="title"], span[class*="heading"], span[class*="title"]');
  
  let $section = null;
  
  $headings.each(function() {
    const text = $(this).text().trim();
    
    if (text === sectionName) {
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
        const propertyRegex = /^[a-z]+\.[a-z_]+\.[a-z_]+$/;
        const $props = $container.find('div').filter(function() {
          const divText = $(this).text();
          return propertyRegex.test(divText);
        });
        
        if ($props.length > MIN_PROPERTY_COUNT) {
          $section = $container;
          return false;
        }
        
        $container = $container.parent();
      }
      
      // If we didn't find a good container, use the immediate parent
      if (!$section?.length) {
        $section = $(this).parent();
      }
      
      return false; // Break loop
    }
  });
  
  return $section;
}

/**
 * Check if key contains UI-related text
 */
function isUIElement(key) {
  return key.includes('See as JSON') || 
         key.includes('See in ') ||
         key.includes('Collapse') ||
         key.includes('Search') ||
         key.includes('Event properties') ||
         key.includes('Event Time');
}

/**
 * Check if key contains log format characters
 */
function isLogFormat(key) {
  const timePattern = /\d{1,2}:\d{2}:\d{2}/;
  return key.includes('|') || 
         key.includes('PM') || 
         key.includes('AM') ||
         key.includes('=') ||
         key.includes('\'') ||
         key.includes('"') ||
         key.includes('...') ||
         timePattern.test(key);
}

/**
 * Checks if a key is a valid property name (not UI text or log format)
 */
function isValidPropertyKey(key) {
  // Basic validation
  if (!key || key.length < MIN_KEY_LENGTH || key.length > MAX_KEY_LENGTH) return false;
  
  // Skip UI elements and log formats
  if (isUIElement(key) || isLogFormat(key)) return false;
  
  // Skip keys with emojis (log messages)
  const emojiPattern = /[\u{1F000}-\u{1F9FF}]/u;
  if (emojiPattern.test(key)) return false;
  
  // Should look like a property path (alphanumeric, dots, underscores, hyphens)
  const specialChars = (key.match(/[^a-zA-Z0-9._-]/g) || []).length;
  return specialChars <= MAX_SPECIAL_CHARS;
}

/**
 * Cleans and validates a property value
 */
function cleanPropertyValue(value) {
  if (!value) return null;
  
  return value.trim();
}

/**
 * Extract properties from SentinelOne's property wrapper structure
 */
function extractFromPropertyWrappers($content) {
  const properties = {};
  const $propertyWrappers = $content.find('div[class*="GyObjectAttribute-module_root-wrapper"]');
  
  $propertyWrappers.each(function() {
    const $wrapper = $(this);
    const $innerDiv = $wrapper.find('div[class*="EventDetailField_container"]');
    
    if ($innerDiv.length) {
      const $labelWrapper = $innerDiv.find('div[class*="label-wrapper"]');
      const $valueWrapper = $innerDiv.find('div[class*="value-wrapper"]');
      
      if ($labelWrapper.length && $valueWrapper.length) {
        // Try to get full key from title attribute (check wrapper and child elements)
        let key = $labelWrapper.attr('title');
        
        // If no title on wrapper, check child elements (like span)
        if (!key) {
          const $childWithTitle = $labelWrapper.find('[title]').first();
          if ($childWithTitle.length) {
            key = $childWithTitle.attr('title');
          }
        }
        
        // Fallback to text content if no title found
        if (!key) {
          key = $labelWrapper.text().trim();
        }
        
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
  
  return properties;
}

/**
 * Try to extract key-value from a row with 2 children
 */
function extractFromTwoChildren($children, properties) {
  const key = $children.eq(0).text().trim();
  const value = $children.eq(1).text().trim();
  
  if (isValidPropertyKey(key)) {
    const cleanedValue = cleanPropertyValue(value);
    if (cleanedValue) {
      properties[key] = cleanedValue;
    }
  }
}

/**
 * Try to extract key-value from spans/divs inside a row
 */
function extractFromSpans($row, properties) {
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

/**
 * Fallback extraction for generic DOM structures
 */
function extractFromGenericStructure($container) {
  const properties = {};
  const $rows = $container.find('div[class*="row"], tr, li, div[class*="property"], div[class*="item"]');
  
  $rows.each(function() {
    const $row = $(this);
    const $children = $row.children();
    
    if ($children.length === 2) {
      extractFromTwoChildren($children, properties);
    } else if ($children.length > 0) {
      extractFromSpans($row, properties);
    }
  });
  
  return properties;
}

function extractProperties($container) {
  // Find the collapsible content div (where properties actually are)
  const $content = $container.find('div[class*="collapsible-content"]');
  
  if ($content.length) {
    const properties = extractFromPropertyWrappers($content);
    if (Object.keys(properties).length > 0) {
      return properties;
    }
  }
  
  // Fallback: Try generic structure extraction
  const properties = extractFromGenericStructure($container);
  if (Object.keys(properties).length > 0) {
    return properties;
  }
  
  // Last resort: Parse visible text
  const textProperties = {};
  const text = $container.text();
  const lines = text.split('\n').filter(line => line.trim());
  
  for (let i = 0; i < lines.length - 1;) {
    const key = lines[i].trim();
    const value = lines[i + 1].trim();
    
    if (isValidPropertyKey(key)) {
      const cleanedValue = cleanPropertyValue(value);
      if (cleanedValue) {
        textProperties[key] = cleanedValue;
        i += 2;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }
  
  return textProperties;
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
