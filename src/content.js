// SentinelOne JSON Viewer Content Script
import { set } from 'lodash-es';
import $ from 'cash-dom';

// Constants for validation thresholds
const MIN_KEY_LENGTH = 2;
const MAX_KEY_LENGTH = 150;
const MAX_SPECIAL_CHARS = 3;
const MIN_PROPERTY_COUNT = 5;

// Constants for search functionality
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

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
  
  // Show JSON in modal (with flat properties for optional parsing)
  displayJSONModal(eventData, allProperties);
}

/**
 * Try to parse a JSON string value
 */
function tryParseJSON(value) {
  if (typeof value !== 'string') return value;
  
  // Check if it looks like JSON (starts with [ or {)
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
    return value;
  }
  
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Recursively parse JSON strings in an object
 */
function parseJSONStrings(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return tryParseJSON(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => parseJSONStrings(item));
  }
  
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = parseJSONStrings(value);
  });
  
  return result;
}

/**
 * Converts flat dot-notation object to nested structure
 * Uses lodash.set for clean implementation
 */
function convertToNestedObject(flatObj, parseJSON = false) {
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
  
  // Parse JSON strings if requested
  if (parseJSON) {
    return parseJSONStrings(result);
  }
  
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
        
        // Look for SentinelOne's specific property wrapper classes
        const $propertyWrappers = $container.find('div[class*="GyObjectAttribute-module_root-wrapper"]');
        if ($propertyWrappers.length > MIN_PROPERTY_COUNT) {
          $section = $container;
          return false;
        }
        
        // Fallback: Look for a container that has property rows inside (but be more lenient)
        const $collapsibleContent = $container.find('div[class*="collapsible-content"]');
        if ($collapsibleContent.length > 0) {
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

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Create search functionality for JSON modal
 */
function createSearchFunctionality(getJsonString, $codeElement, $jsonContainer, $searchInfo, $prevBtn, $nextBtn, $searchInput) {
  let currentMatchIndex = -1;
  let matches = [];
  
  function highlightMatches(searchTerm) {
    const jsonString = getJsonString();
    let highlighted = '';
    let lastIndex = 0;
    
    matches.forEach((matchPos, idx) => {
      highlighted += escapeHtml(jsonString.substring(lastIndex, matchPos));
      highlighted += `<mark class="s1-json-search-highlight ${idx === currentMatchIndex ? 'current' : ''}" data-match-idx="${idx}">`;
      highlighted += escapeHtml(jsonString.substring(matchPos, matchPos + searchTerm.length));
      highlighted += '</mark>';
      lastIndex = matchPos + searchTerm.length;
    });
    
    highlighted += escapeHtml(jsonString.substring(lastIndex));
    $codeElement.html(highlighted);
  }
  
  function scrollToMatch(index) {
    const $marks = $codeElement.find('mark');
    $marks.removeClass('current');
    
    if (index >= 0 && index < matches.length) {
      const $currentMark = $marks.eq(index);
      $currentMark.addClass('current');
      
      // Scroll to the match using scrollIntoView for better reliability
      const markElement = $currentMark.get(0);
      if (markElement) {
        markElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }
  
  function updateSearchInfo() {
    if (matches.length > 0) {
      $searchInfo.text(`${currentMatchIndex + 1} of ${matches.length}`);
    }
  }
  
  function navigateToMatch(direction) {
    if (matches.length === 0) return;
    
    if (direction === 'next') {
      currentMatchIndex = (currentMatchIndex + 1) % matches.length;
    } else {
      currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    }
    
    scrollToMatch(currentMatchIndex);
    updateSearchInfo();
    highlightMatches($searchInput.val());
  }
  
  function performSearch(searchTerm) {
    const jsonString = getJsonString();
    
    // Reset highlighting
    $codeElement.html(escapeHtml(jsonString));
    matches = [];
    currentMatchIndex = -1;
    
    if (!searchTerm || searchTerm.length < MIN_SEARCH_LENGTH) {
      $searchInfo.text('');
      $prevBtn.prop('disabled', true);
      $nextBtn.prop('disabled', true);
      return;
    }
    
    // Find all matches (case-insensitive)
    const lowerJson = jsonString.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();
    let pos = 0;
    
    while ((pos = lowerJson.indexOf(lowerSearch, pos)) !== -1) {
      matches.push(pos);
      pos += searchTerm.length;
    }
    
    if (matches.length === 0) {
      $searchInfo.text('No matches');
      $prevBtn.prop('disabled', true);
      $nextBtn.prop('disabled', true);
      return;
    }
    
    // Highlight all matches
    highlightMatches(searchTerm);
    currentMatchIndex = 0;
    scrollToMatch(0);
    updateSearchInfo();
    $prevBtn.prop('disabled', false);
    $nextBtn.prop('disabled', false);
  }
  
  return {
    performSearch,
    navigateToMatch
  };
}

function displayJSONModal(eventData, flatProperties) {
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
  
  // State for JSON parsing
  let parseJSONStrings = false;
  
  function getJSONData() {
    const data = { ...eventData };
    data.properties = convertToNestedObject(flatProperties, parseJSONStrings);
    return data;
  }
  
  let jsonString = JSON.stringify(getJSONData(), null, 2);
  
  // Create search bar
  const $searchContainer = $('<div>').addClass('s1-json-search-container');
  const $searchInput = $('<input>')
    .attr('type', 'text')
    .attr('placeholder', 'Search in JSON...')
    .addClass('s1-json-search-input');
  
  const $searchInfo = $('<span>')
    .addClass('s1-json-search-info')
    .text('');
  
  const $searchNav = $('<div>').addClass('s1-json-search-nav');
  const $prevBtn = $('<button>')
    .text('↑')
    .addClass('s1-json-search-nav-btn')
    .attr('title', 'Previous match')
    .prop('disabled', true);
  
  const $nextBtn = $('<button>')
    .text('↓')
    .addClass('s1-json-search-nav-btn')
    .attr('title', 'Next match')
    .prop('disabled', true);
  
  $searchNav.append($prevBtn).append($nextBtn);
  $searchContainer.append($searchInput).append($searchInfo).append($searchNav);
  
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
  
  const $codeElement = $('<code>').text(jsonString);
  const $jsonContainer = $('<div>').addClass('s1-json-container')
    .append(
      $('<pre>').addClass('s1-json-pre')
        .append($codeElement)
    );
  
  // Initialize search functionality
  const search = createSearchFunctionality(
    () => jsonString, 
    $codeElement, 
    $jsonContainer, 
    $searchInfo, 
    $prevBtn, 
    $nextBtn, 
    $searchInput
  );
  
  // Search input event
  let searchTimeout;
  $searchInput.on('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      search.performSearch($(this).val());
    }, SEARCH_DEBOUNCE_MS);
  });
  
  // Navigation buttons
  $prevBtn.on('click', () => search.navigateToMatch('prev'));
  $nextBtn.on('click', () => search.navigateToMatch('next'));
  
  // Keyboard shortcuts in search
  $searchInput.on('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        search.navigateToMatch('prev');
      } else {
        search.navigateToMatch('next');
      }
    } else if (e.key === 'Escape') {
      $searchInput.val('');
      search.performSearch('');
    }
  });
  
  const $parseToggle = $('<button>')
    .text('🔄 Parse JSON Strings')
    .addClass('s1-json-parse-btn')
    .attr('title', 'Automatically parse JSON strings into objects')
    .on('click', function() {
      const $btn = $(this);
      parseJSONStrings = !parseJSONStrings;
      
      // Update button state
      if (parseJSONStrings) {
        $btn.text('✓ JSON Strings Parsed');
        $btn.addClass('active');
      } else {
        $btn.text('🔄 Parse JSON Strings');
        $btn.removeClass('active');
      }
      
      // Regenerate JSON with new parsing state
      jsonString = JSON.stringify(getJSONData(), null, 2);
      $codeElement.text(jsonString);
      
      // Re-run search if there's a search term
      const searchTerm = $searchInput.val();
      if (searchTerm && searchTerm.length >= MIN_SEARCH_LENGTH) {
        search.performSearch(searchTerm);
      }
    });
  
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
    .append($parseToggle)
    .append($copyBtn)
    .append($downloadBtn);
  
  const $modalContent = $('<div>')
    .addClass('s1-json-modal-content')
    .append($header)
    .append($searchContainer)
    .append($jsonContainer)
    .append($buttonContainer);
  
  $modal.append($modalContent);
  $('body').append($modal);
  
  // Focus search input (get DOM element from cash-dom wrapper)
  setTimeout(() => $searchInput.get(0)?.focus(), 100);
  
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
