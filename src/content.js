// SentinelOne JSON Viewer Content Script
// A Chrome extension to view SentinelOne event logs in JSON format

import { set } from 'lodash-es';
import $ from 'cash-dom';

// =============================================================================
// CONSTANTS
// =============================================================================

// Validation thresholds for property extraction
const MIN_KEY_LENGTH = 2;
const MAX_KEY_LENGTH = 150;
const MAX_SPECIAL_CHARS = 3;
const MIN_PROPERTY_COUNT = 5;

// Search functionality settings
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

// UI timing settings (milliseconds)
const FOCUS_DELAY_MS = 100;
const COPY_FEEDBACK_MS = 500;

// Tree view settings
const INDENT_PIXELS = 20;
const RANDOM_ID_START = 2;
const RANDOM_ID_END = 11;

// =============================================================================
// GLOBAL STATE
// =============================================================================

let observer = null;
let jsonModalOpen = false;

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the extension - set up mutation observer to detect event panels
 */
function init() {
  observer = new MutationObserver(() => {
    checkAndInjectButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  checkAndInjectButton();
}

// =============================================================================
// BUTTON INJECTION
// =============================================================================

/**
 * Check for SentinelOne event panels and inject the JSON button
 */
function checkAndInjectButton() {
  $('button').each(function() {
    const $btn = $(this);
    const text = $btn.text().trim();
    
    if (text === 'See in Thread Log') {
      const $container = $btn.parent();
      
      if ($container.attr('data-s1-json-processed') === 'true') {
        return;
      }
      
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
      
      if (hasOriginalLog && hasThreadLog && !hasJsonButton) {
        $container.attr('data-s1-json-processed', 'true');
        injectJsonButton($container.get(0));
        return false;
      }
    }
  });
}

/**
 * Inject the "See as JSON" button into the container
 */
function injectJsonButton(container) {
  const $container = $(container);
  const $existingButton = $container.find('button').first();
  
  const $jsonButton = $('<button>')
    .text('See as JSON')
    .addClass('s1-json-viewer-button')
    .attr('data-s1-json-button', 'true')
    .on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      extractAndShowJSON();
    });
  
  if ($existingButton.length) {
    const existingClasses = $existingButton.attr('class');
    $jsonButton.attr('class', existingClasses + ' s1-json-viewer-button');
  }
  
  const $lastButton = $container.find('button').last();
  if ($lastButton.length) {
    $lastButton.after($jsonButton);
  } else {
    $container.append($jsonButton);
  }
}

// =============================================================================
// DATA EXTRACTION
// =============================================================================

/**
 * Main function to extract event data and show the JSON modal
 */
function extractAndShowJSON() {
  const eventData = {};
  
  // Extract event time
  const bodyText = $('body').text();
  const eventTimeRegex = /Event Time[\s\S]*?(\w{3} \d{2}, \d{4} \d{2}:\d{2}:\d{2})/;
  const eventTimeMatch = eventTimeRegex.exec(bodyText);
  if (eventTimeMatch) {
    eventData.eventTime = eventTimeMatch[1];
  }
  
  // Extract properties from different sections
  let allProperties = {};
  
  const $propertiesSection = findSection('Event properties');
  if ($propertiesSection?.length) {
    allProperties = { ...allProperties, ...extractProperties($propertiesSection) };
  }
  
  const $serverInfoSection = findSection('Server info');
  if ($serverInfoSection?.length) {
    allProperties = { ...allProperties, ...extractProperties($serverInfoSection) };
  }
  
  if (Object.keys(allProperties).length === 0) {
    alert('Could not find event properties. Please make sure an event is open.');
    return;
  }
  
  displayJSONModal(eventData, allProperties);
}

/**
 * Find a section by its heading text
 */
function findSection(sectionName) {
  const $headings = $('h1, h2, h3, h4, h5, h6, div[class*="heading"], div[class*="title"], span[class*="heading"], span[class*="title"]');
  let $section = null;
  
  $headings.each(function() {
    const text = $(this).text().trim();
    
    if (text === sectionName) {
      let $container = $(this).parent();
      
      while ($container.length && !$container.is('body')) {
        const classes = $container.attr('class') || '';
        if (classes.includes('Shell') || classes.includes('Layout_container')) {
          break;
        }
        
        const $propertyWrappers = $container.find('div[class*="GyObjectAttribute-module_root-wrapper"]');
        if ($propertyWrappers.length > MIN_PROPERTY_COUNT) {
          $section = $container;
          return false;
        }
        
        const $collapsibleContent = $container.find('div[class*="collapsible-content"]');
        if ($collapsibleContent.length > 0) {
          $section = $container;
          return false;
        }
        
        $container = $container.parent();
      }
      
      if (!$section?.length) {
        $section = $(this).parent();
      }
      
      return false;
    }
  });
  
  return $section;
}

// =============================================================================
// PROPERTY VALIDATION
// =============================================================================

/**
 * Check if key contains UI-related text that should be filtered out
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
 * Check if key contains log format patterns that should be filtered out
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
 * Validate if a key is a valid property name
 */
function isValidPropertyKey(key) {
  if (!key || key.length < MIN_KEY_LENGTH || key.length > MAX_KEY_LENGTH) return false;
  if (isUIElement(key) || isLogFormat(key)) return false;
  
  const emojiPattern = /[\u{1F000}-\u{1F9FF}]/u;
  if (emojiPattern.test(key)) return false;
  
  const specialChars = (key.match(/[^a-zA-Z0-9._-]/g) || []).length;
  return specialChars <= MAX_SPECIAL_CHARS;
}

/**
 * Clean and validate a property value
 */
function cleanPropertyValue(value) {
  if (!value) return null;
  return value.trim();
}

// =============================================================================
// PROPERTY EXTRACTION STRATEGIES
// =============================================================================

/**
 * Extract the property key from a label wrapper element
 */
function extractKeyFromLabel($labelWrapper) {
  // Try title attribute first
  let key = $labelWrapper.attr('title');
  if (key) return key;
  
  // Try child element with title
  const $childWithTitle = $labelWrapper.find('[title]').first();
  if ($childWithTitle.length) {
    key = $childWithTitle.attr('title');
    if (key) return key;
  }
  
  // Fall back to text content
  return $labelWrapper.text().trim();
}

/**
 * Process a single property wrapper and add to properties object
 */
function processPropertyWrapper($wrapper, properties) {
  const $innerDiv = $wrapper.find('div[class*="EventDetailField_container"]');
  if (!$innerDiv.length) return;
  
  const $labelWrapper = $innerDiv.find('div[class*="label-wrapper"]');
  const $valueWrapper = $innerDiv.find('div[class*="value-wrapper"]');
  
  if (!$labelWrapper.length || !$valueWrapper.length) return;
  
  const key = extractKeyFromLabel($labelWrapper);
  const value = $valueWrapper.text().trim();
  
  if (!isValidPropertyKey(key)) return;
  
  const cleanedValue = cleanPropertyValue(value);
  if (cleanedValue) {
    properties[key] = cleanedValue;
  }
}

/**
 * Extract properties from SentinelOne's specific DOM structure
 */
function extractFromPropertyWrappers($content) {
  const properties = {};
  const $propertyWrappers = $content.find('div[class*="GyObjectAttribute-module_root-wrapper"]');
  
  $propertyWrappers.each(function() {
    processPropertyWrapper($(this), properties);
  });
  
  return properties;
}

/**
 * Extract key-value from a row with 2 children
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
 * Extract key-value from spans/divs inside a row
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

/**
 * Main property extraction function - tries multiple strategies
 */
function extractProperties($container) {
  // Strategy 1: SentinelOne's specific property wrappers
  const $content = $container.find('div[class*="collapsible-content"]');
  if ($content.length) {
    const properties = extractFromPropertyWrappers($content);
    if (Object.keys(properties).length > 0) {
      return properties;
    }
  }
  
  // Strategy 2: Generic structure extraction
  const properties = extractFromGenericStructure($container);
  if (Object.keys(properties).length > 0) {
    return properties;
  }
  
  // Strategy 3: Parse visible text as last resort
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

// =============================================================================
// JSON TRANSFORMATION
// =============================================================================

/**
 * Try to parse a string as JSON
 */
function tryParseJSON(value) {
  if (typeof value !== 'string') return value;
  
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
    return value;
  }
  
  try {
    return JSON.parse(value);
  } catch {
    // Intentional: Value is not valid JSON, return original string
    // This is expected behavior for non-JSON strings
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
 * Convert flat dot-notation object to nested structure
 */
function convertToNestedObject(flatObj, parseJSON = false) {
  const result = {};
  
  Object.entries(flatObj).forEach(([key, value]) => {
    if (key.includes('...')) return;
    
    const cleanKey = key
      .split('.')
      .filter(segment => segment.trim().length > 0)
      .join('.');
    
    if (cleanKey && cleanKey.length > 0) {
      set(result, cleanKey, value);
    }
  });
  
  if (parseJSON) {
    return parseJSONStrings(result);
  }
  
  return result;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Fallback copy using textarea (for older browsers)
 */
function fallbackCopyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');  // eslint-disable-line
  } finally {
    textarea.remove();
  }
}

/**
 * Copy text to clipboard with fallback
 */
function copyToClipboard(text, onSuccess) {
  navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
    fallbackCopyToClipboard(text);
    onSuccess();
  });
}

// =============================================================================
// JSON TREE VIEW RENDERING
// =============================================================================

/**
 * Get the type of a value for JSON rendering
 */
function getValueType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Generate a unique ID for tree elements
 */
function generateTreeId() {
  return `tree-${Math.random().toString(36).substring(RANDOM_ID_START, RANDOM_ID_END)}`;
}

/**
 * Encode a value to Base64 for storage in data attributes
 * Using TextEncoder for modern browsers (avoids deprecated unescape)
 */
function encodeToBase64(value) {
  const jsonStr = JSON.stringify(value);
  const bytes = new TextEncoder().encode(jsonStr);
  const binString = Array.from(bytes, byte => String.fromCodePoint(byte)).join('');
  return btoa(binString);
}

/**
 * Decode Base64 string back to JSON
 */
function decodeFromBase64(base64) {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, char => char.codePointAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Get the display value for a primitive type
 */
function getPrimitiveDisplayValue(value, type) {
  if (type === 'string') {
    return `"${escapeHtml(value)}"`;
  }
  if (type === 'null') {
    return 'null';
  }
  return value;
}

/**
 * Render a primitive JSON value (string, number, boolean, null)
 */
function renderPrimitiveHtml(value, type) {
  const typeClassMap = {
    string: 'json-tree-string',
    number: 'json-tree-number',
    boolean: 'json-tree-boolean',
    null: 'json-tree-null'
  };
  
  const className = typeClassMap[type];
  const displayValue = getPrimitiveDisplayValue(value, type);
  
  return `<span class="${className}">${displayValue}</span>`;
}

/**
 * Create the key part of a JSON tree line
 */
function createKeyHtml(key, isArrayIndex) {
  if (isArrayIndex) {
    return `<span class="json-tree-index">[${escapeHtml(key)}]</span>`;
  }
  return `<span class="json-tree-key">"${escapeHtml(key)}"</span><span class="json-tree-colon">: </span>`;
}

/**
 * Render JSON data as an interactive collapsible tree view
 */
function renderJSONTree(data, isExpanded = true) {
  let lineNumber = 0;

  function lineNum() {
    lineNumber++;
    return `<span class="json-tree-line-number">${lineNumber}</span>`;
  }

  function renderValue(value, key, level = 0, isArrayIndex = false, isLast = true) {
    const type = getValueType(value);
    const indent = level * INDENT_PIXELS;
    const keyPart = createKeyHtml(key, isArrayIndex);
    const comma = isLast ? '' : '<span class="json-tree-comma">,</span>';

    // Object rendering
    if (type === 'object' && value !== null) {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return `<div class="json-tree-line">${lineNum()}<span class="json-tree-content" style="padding-left: ${indent}px;">${keyPart}<span class="json-tree-bracket">{}</span>${comma}</span></div>`;
      }

      const id = generateTreeId();
      const jsonBase64 = encodeToBase64(value);
      const expandedClass = isExpanded ? 'expanded' : '';
      
      const openLine = `<div class="json-tree-line json-tree-collapsible" data-json-b64="${jsonBase64}" data-target="${id}">${lineNum()}<span class="json-tree-content" style="padding-left: ${indent}px;"><button class="json-tree-toggle ${expandedClass}" data-target="${id}">▶</button>${keyPart}<span class="json-tree-bracket">{</span><span class="json-tree-count">${entries.length} properties</span></span></div>`;
      const childrenHtml = entries.map(([k, v], idx) => renderValue(v, k, level + 1, false, idx === entries.length - 1)).join('');
      const closeLine = `<div class="json-tree-line">${lineNum()}<span class="json-tree-content" style="padding-left: ${indent}px;"><span class="json-tree-bracket">}</span>${comma}</span></div>`;

      return `${openLine}<div class="json-tree-children ${expandedClass}" id="${id}">${childrenHtml}</div>${closeLine}`;
    }

    // Array rendering
    if (type === 'array') {
      if (value.length === 0) {
        return `<div class="json-tree-line">${lineNum()}<span class="json-tree-content" style="padding-left: ${indent}px;">${keyPart}<span class="json-tree-bracket">[]</span>${comma}</span></div>`;
      }

      const id = generateTreeId();
      const jsonBase64 = encodeToBase64(value);
      const expandedClass = isExpanded ? 'expanded' : '';
      
      const openLine = `<div class="json-tree-line json-tree-collapsible" data-json-b64="${jsonBase64}" data-target="${id}">${lineNum()}<span class="json-tree-content" style="padding-left: ${indent}px;"><button class="json-tree-toggle ${expandedClass}" data-target="${id}">▶</button>${keyPart}<span class="json-tree-bracket">[</span><span class="json-tree-count">${value.length} items</span></span></div>`;
      const childrenHtml = value.map((item, idx) => renderValue(item, idx.toString(), level + 1, true, idx === value.length - 1)).join('');
      const closeLine = `<div class="json-tree-line">${lineNum()}<span class="json-tree-content" style="padding-left: ${indent}px;"><span class="json-tree-bracket">]</span>${comma}</span></div>`;

      return `${openLine}<div class="json-tree-children ${expandedClass}" id="${id}">${childrenHtml}</div>${closeLine}`;
    }

    // Primitive value rendering
    const valueHtml = renderPrimitiveHtml(value, type);
    return `<div class="json-tree-line">${lineNum()}<span class="json-tree-content" style="padding-left: ${indent}px;">${keyPart}${valueHtml}${comma}</span></div>`;
  }

  // Render root object
  const type = getValueType(data);
  if (type === 'object' && data !== null) {
    const entries = Object.entries(data);
    const rootJsonB64 = encodeToBase64(data);
    const openLine = `<div class="json-tree-line json-tree-collapsible json-tree-root-line" data-json-b64="${rootJsonB64}">${lineNum()}<span class="json-tree-content"><span class="json-tree-bracket">{</span><span class="json-tree-count">${entries.length} properties · double-click to copy all</span></span></div>`;
    const childrenHtml = entries.map(([k, v], idx) => renderValue(v, k, 1, false, idx === entries.length - 1)).join('');
    const closeLine = `<div class="json-tree-line">${lineNum()}<span class="json-tree-content"><span class="json-tree-bracket">}</span></span></div>`;

    return `<div class="json-tree-root">${openLine}${childrenHtml}${closeLine}</div>`;
  }

  return `<div class="json-tree-root">${renderValue(data, 'root', 0, false, true)}</div>`;
}

// =============================================================================
// TREE VIEW INTERACTIONS
// =============================================================================

/**
 * Handle double-click on a collapsible JSON tree element to copy its content
 */
function handleTreeDoubleClick(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const targetElement = event.currentTarget;
  const jsonB64 = targetElement.dataset.jsonB64;
  
  if (!jsonB64) return;
  
  try {
    const json = decodeFromBase64(jsonB64);
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, 2);
    
    copyToClipboard(formatted, () => {
      targetElement.classList.add('json-tree-copied');
      setTimeout(() => targetElement.classList.remove('json-tree-copied'), COPY_FEEDBACK_MS);
    });
  } catch {
    // Intentional: JSON parsing or clipboard operation failed
    // User feedback is provided via visual indication only
  }
}

/**
 * Initialize tree view toggle buttons and double-click copy handlers
 */
function initTreeToggles($container) {
  // Single click on toggle button - expand/collapse
  $container.find('.json-tree-toggle').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const $btn = $(this);
    const targetId = $btn.attr('data-target');
    const $target = $(`#${targetId}`);
    
    $btn.toggleClass('expanded');
    $target.toggleClass('expanded');
  });

  // Double-click on collapsible line - copy full JSON
  const collapsibleElements = $container.find('.json-tree-collapsible').get();
  collapsibleElements.forEach(el => {
    el.addEventListener('dblclick', handleTreeDoubleClick);
  });
}

// =============================================================================
// SEARCH FUNCTIONALITY
// =============================================================================

/**
 * Create search functionality for the JSON tree view
 * @param {Object} options - Search configuration
 * @param {Function} options.getJsonString - Function to get current JSON string
 * @param {Object} options.$displayElement - jQuery element containing the tree view
 * @param {Object} options.$searchInfo - jQuery element for search info text
 * @param {Object} options.$prevBtn - jQuery element for previous button
 * @param {Object} options.$nextBtn - jQuery element for next button
 * @param {Object} options.$searchInput - jQuery element for search input
 */
function createSearchFunctionality(options) {
  const { getJsonString, $displayElement, $searchInfo, $prevBtn, $nextBtn, $searchInput } = options;
  
  let currentMatchIndex = -1;
  let matches = [];
  
  function highlightMatches(searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    const $treeView = $displayElement.find('.json-tree-root');
    
    if (!$treeView.length) return;
    
    const $textElements = $treeView.find('.json-tree-string, .json-tree-number, .json-tree-boolean, .json-tree-key, .json-tree-index');
    
    // Normalize all text elements first
    $textElements.each(function() {
      const $el = $(this);
      $el.text($el.text());
    });
    
    // Apply highlights
    let matchIndex = 0;
    $textElements.each(function() {
      const $el = $(this);
      const text = $el.text();
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes(lowerSearch)) {
        let highlighted = '';
        let lastIndex = 0;
        let pos = 0;
        
        while ((pos = lowerText.indexOf(lowerSearch, lastIndex)) !== -1) {
          highlighted += escapeHtml(text.substring(lastIndex, pos));
          highlighted += `<mark class="s1-json-search-highlight ${matchIndex === currentMatchIndex ? 'current' : ''}" data-match-idx="${matchIndex}">`;
          highlighted += escapeHtml(text.substring(pos, pos + searchTerm.length));
          highlighted += '</mark>';
          lastIndex = pos + searchTerm.length;
          matchIndex++;
        }
        
        highlighted += escapeHtml(text.substring(lastIndex));
        $el.html(highlighted);
      }
    });
  }
  
  function scrollToMatch(index) {
    const $marks = $displayElement.find('mark');
    $marks.removeClass('current');
    
    if (index >= 0 && index < matches.length) {
      const $currentMark = $marks.eq(index);
      $currentMark.addClass('current');
      
      // Expand parent nodes
      $currentMark.parents('.json-tree-children').each(function() {
        $(this).addClass('expanded');
        const id = $(this).attr('id');
        $(`.json-tree-toggle[data-target="${id}"]`).addClass('expanded');
      });
      
      const markElement = $currentMark.get(0);
      if (markElement) {
        markElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  }
  
  function updateSearchInfo() {
    if (matches.length > 0) {
      $searchInfo.text(`${currentMatchIndex + 1} of ${matches.length}`);
    } else {
      $searchInfo.text('');
    }
  }
  
  function navigateToMatch(direction) {
    if (matches.length === 0) return;
    
    if (direction === 'next') {
      currentMatchIndex = (currentMatchIndex + 1) % matches.length;
    } else {
      currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    }
    
    highlightMatches($searchInput.val());
    scrollToMatch(currentMatchIndex);
    updateSearchInfo();
  }
  
  function performSearch(searchTerm) {
    const jsonString = getJsonString();
    matches = [];
    currentMatchIndex = -1;
    
    if (!searchTerm || searchTerm.length < MIN_SEARCH_LENGTH) {
      // Clear highlights
      const $treeView = $displayElement.find('.json-tree-root');
      if ($treeView.length) {
        const $textElements = $treeView.find('.json-tree-string, .json-tree-number, .json-tree-boolean, .json-tree-key, .json-tree-index');
        $textElements.each(function() {
          $(this).text($(this).text());
        });
      }
      
      $searchInfo.text('');
      $prevBtn.prop('disabled', true);
      $nextBtn.prop('disabled', true);
      return;
    }
    
    // Find matches in JSON string
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
    
    highlightMatches(searchTerm);
    currentMatchIndex = 0;
    scrollToMatch(0);
    updateSearchInfo();
    $prevBtn.prop('disabled', false);
    $nextBtn.prop('disabled', false);
  }
  
  return { performSearch, navigateToMatch };
}

// =============================================================================
// MODAL DISPLAY
// =============================================================================

/**
 * Display the JSON modal with all features
 */
function displayJSONModal(eventData, flatProperties) {
  // Toggle modal if already open
  const $existing = $('#s1-json-modal');
  if ($existing.length) {
    $existing.remove();
    jsonModalOpen = false;
    return;
  }
  
  jsonModalOpen = true;
  
  // State
  let parseJSONStringsEnabled = false;
  let jsonString = '';
  
  function getJSONData() {
    const data = { ...eventData };
    data.properties = convertToNestedObject(flatProperties, parseJSONStringsEnabled);
    return data;
  }
  
  // Create modal structure
  const $modal = $('<div>').attr('id', 's1-json-modal').addClass('s1-json-modal');
  
  // Header
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
  
  // Search bar
  const $searchContainer = $('<div>').addClass('s1-json-search-container');
  const $searchInput = $('<input>')
    .attr('type', 'text')
    .attr('placeholder', 'Search in JSON...')
    .addClass('s1-json-search-input');
  const $searchInfo = $('<span>').addClass('s1-json-search-info');
  const $searchNav = $('<div>').addClass('s1-json-search-nav');
  const $prevBtn = $('<button>').text('↑').addClass('s1-json-search-nav-btn').attr('title', 'Previous match').prop('disabled', true);
  const $nextBtn = $('<button>').text('↓').addClass('s1-json-search-nav-btn').attr('title', 'Next match').prop('disabled', true);
  
  $searchNav.append($prevBtn).append($nextBtn);
  $searchContainer.append($searchInput).append($searchInfo).append($searchNav);
  
  // JSON display
  const $jsonContainer = $('<div>').addClass('s1-json-container');
  const $jsonDisplay = $('<div>').addClass('s1-json-display');
  $jsonContainer.append($jsonDisplay);
  
  function updateDisplay() {
    const jsonData = getJSONData();
    jsonString = JSON.stringify(jsonData, null, 2);
    
    $jsonDisplay.html(renderJSONTree(jsonData, true));
    $jsonDisplay.addClass('s1-json-tree-view');
    initTreeToggles($jsonDisplay);
    
    $searchInput.val('');
    $searchInfo.text('');
    $prevBtn.prop('disabled', true);
    $nextBtn.prop('disabled', true);
  }
  
  updateDisplay();
  
  // Initialize search
  const search = createSearchFunctionality({
    getJsonString: () => jsonString,
    $displayElement: $jsonDisplay,
    $searchInfo,
    $prevBtn,
    $nextBtn,
    $searchInput
  });
  
  let searchTimeout;
  $searchInput.on('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => search.performSearch($(this).val()), SEARCH_DEBOUNCE_MS);
  });
  
  $prevBtn.on('click', () => search.navigateToMatch('prev'));
  $nextBtn.on('click', () => search.navigateToMatch('next'));
  
  $searchInput.on('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      search.navigateToMatch(e.shiftKey ? 'prev' : 'next');
    } else if (e.key === 'Escape') {
      if ($searchInput.val()) {
        // First ESC: clear search
        $searchInput.val('');
        search.performSearch('');
      } else {
        // Second ESC (or search already empty): close modal
        $modal.remove();
        jsonModalOpen = false;
      }
    }
  });
  
  // Action buttons
  const $parseToggle = $('<button>')
    .text('🔄 Parse JSON Strings')
    .addClass('s1-json-parse-btn')
    .attr('title', 'Automatically parse JSON strings into objects')
    .on('click', function() {
      const $btn = $(this);
      parseJSONStringsEnabled = !parseJSONStringsEnabled;
      
      if (parseJSONStringsEnabled) {
        $btn.text('✓ JSON Strings Parsed').addClass('active');
      } else {
        $btn.text('🔄 Parse JSON Strings').removeClass('active');
      }
      
      updateDisplay();
    });
  
  const $downloadBtn = $('<button>')
    .text('Download JSON')
    .addClass('s1-json-download-btn')
    .on('click', () => {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const $a = $('<a>').attr('href', url).attr('download', `sentinelone-event-${Date.now()}.json`).get(0);
      $a.click();
      URL.revokeObjectURL(url);
    });
  
  const $buttonContainer = $('<div>').addClass('s1-json-button-container').append($parseToggle).append($downloadBtn);
  
  // Assemble modal
  const $modalContent = $('<div>')
    .addClass('s1-json-modal-content')
    .append($header)
    .append($searchContainer)
    .append($jsonContainer)
    .append($buttonContainer);
  
  $modal.append($modalContent);
  $('body').append($modal);
  
  // Focus search and setup close handlers
  setTimeout(() => $searchInput.get(0)?.focus(), FOCUS_DELAY_MS);
  
  $modal.on('click', function(e) {
    if (e.target === this) {
      $(this).remove();
      jsonModalOpen = false;
    }
  });
  
  const escapeHandler = (e) => {
    if (e.key === 'Escape' && jsonModalOpen) {
      $modal.remove();
      jsonModalOpen = false;
      $(document).off('keydown', escapeHandler);
    }
  };
  $(document).on('keydown', escapeHandler);
}

// =============================================================================
// ENTRY POINT
// =============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
