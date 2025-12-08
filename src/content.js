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
    set(result, key, value);
  });
  
  return result;
}

function findEventPropertiesSection() {
  // Look for "Event properties" heading
  const $headings = $('h1, h2, h3, h4, h5, h6, div[class*="heading"], div[class*="title"]');
  
  let $section = null;
  
  $headings.each(function() {
    if ($(this).text().trim() === 'Event properties') {
      // Return the parent container
      $section = $(this).closest('div[class*="section"], section');
      if (!$section.length) {
        $section = $(this).parent();
      }
      return false; // Break loop
    }
  });
  
  if ($section && $section.length) {
    return $section;
  }
  
  // Alternative: look for elements containing property-like patterns
  let $found = null;
  $('div').each(function() {
    const text = $(this).text();
    if (text.includes('log.meta.') || text.includes('source.c2c.')) {
      $found = $(this);
      return false; // Break
    }
  });
  
  return $found;
}

function extractProperties($container) {
  const properties = {};
  
  // Try multiple strategies to extract key-value pairs
  
  // Strategy 1: Look for paired elements (common in modern web apps)
  const $rows = $container.find('div[class*="row"], tr, li, div[class*="property"], div[class*="item"]');
  
  $rows.each(function() {
    const $row = $(this);
    const $children = $row.children();
    
    // If row has exactly 2 children, they might be key-value
    if ($children.length === 2) {
      const key = $children.eq(0).text().trim();
      const value = $children.eq(1).text().trim();
      if (key && value && key.length < 200) {
        properties[key] = value;
      }
    }
    // Try to extract from text content with patterns like "key value"
    else if ($children.length > 0) {
      const $spans = $row.find('span, div, td');
      if ($spans.length >= 2) {
        const key = $spans.eq(0).text().trim();
        const value = $spans.eq(1).text().trim();
        if (key && value && (key.includes('.') || key.includes('_'))) {
          properties[key] = value;
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

