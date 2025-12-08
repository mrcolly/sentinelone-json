# NPM Packages Used

This extension uses a modern build setup with NPM packages for cleaner, more maintainable code.

## Dependencies

### 1. **cash-dom** (8.1.5)
**Purpose:** Lightweight jQuery alternative for DOM manipulation  
**Size:** ~6KB gzipped  
**Why:** Makes DOM queries and manipulation much cleaner

**Before (vanilla JS):**
```javascript
const buttons = container.querySelectorAll('button');
buttons.forEach(btn => {
  const text = btn.textContent.trim();
  // ...
});
```

**After (with cash-dom):**
```javascript
$container.find('button').each(function() {
  const text = $(this).text().trim();
  // ...
});
```

**Key Features Used:**
- `$()` - jQuery-like selector
- `.find()` - Find descendants
- `.each()` - Iterate elements
- `.text()` - Get/set text content
- `.addClass()`, `.attr()` - Manipulate attributes
- `.on()` - Event handling
- `.append()`, `.after()` - DOM insertion

---

### 2. **lodash-es** (4.17.21)
**Purpose:** Utility library for data manipulation  
**Size:** ~24KB (only `set` function is bundled)  
**Why:** Clean implementation of nested object creation

**Before (manual implementation):**
```javascript
function convertToNestedObject(flatObj) {
  const result = {};
  for (const [key, value] of Object.entries(flatObj)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  return result;
}
```

**After (with lodash):**
```javascript
import { set } from 'lodash-es';

function convertToNestedObject(flatObj) {
  const result = {};
  Object.entries(flatObj).forEach(([key, value]) => {
    set(result, key, value);
  });
  return result;
}
```

**Key Features Used:**
- `set(object, path, value)` - Sets value at object path (handles nested creation)

---

## Dev Dependencies

### 3. **esbuild** (0.19.11)
**Purpose:** Fast JavaScript bundler  
**Why:** Bundles NPM packages into a single file for the extension

**Features:**
- ⚡ Extremely fast (builds in ~30ms)
- 📦 Tree-shaking (only includes used code)
- 🎯 ES6 module support
- 🔧 Watch mode for development

### 4. **eslint** (8.57.1)
**Purpose:** JavaScript linter  
**Why:** Catches errors and enforces code quality

### 5. **stylelint** (16.1.0)
**Purpose:** CSS linter  
**Why:** Ensures CSS follows best practices

### 6. **prettier** (3.1.1)
**Purpose:** Code formatter  
**Why:** Consistent code style across the project

---

## Bundle Size Analysis

| Package | Raw Size | Bundled Size | Gzipped |
|---------|----------|--------------|---------|
| cash-dom | ~30KB | ~20KB | ~6KB |
| lodash-es (set only) | ~24KB | ~5KB | ~2KB |
| **Total** | **~54KB** | **~25KB** | **~8KB** |

**Final bundle:** `content.js` = **70.8KB** (includes all code)

---

## Benefits of Using NPM Packages

### ✅ Pros

1. **Cleaner Code**
   - More readable and maintainable
   - Less boilerplate
   - Industry-standard APIs

2. **Battle-Tested**
   - Packages are used by millions
   - Well-documented
   - Actively maintained

3. **Faster Development**
   - Don't reinvent the wheel
   - Focus on business logic
   - Less bugs

4. **Modern Tooling**
   - ES6 modules
   - Tree-shaking
   - Source maps for debugging

### ⚠️ Cons

1. **Build Step Required**
   - Must run `npm run build` after changes
   - Adds complexity

2. **Larger Bundle**
   - 70KB vs ~9KB (vanilla version)
   - Still acceptable for extension

3. **Dependencies**
   - Need to manage package versions
   - Potential security updates

---

## When to Use This Setup

### ✅ Use NPM packages if:
- You're comfortable with build tools
- You value clean, maintainable code
- You plan to add more features
- Team collaboration (standard tools)

### ❌ Stick with vanilla if:
- You want zero dependencies
- Minimal bundle size is critical
- Simple, one-off project
- No build step tolerance

---

## Alternative Packages Considered

### For DOM Manipulation
- **jQuery** - Too heavy (87KB minified)
- **Zepto** - Outdated, not maintained
- **umbrella.js** - Good alternative (3KB)
- **cash-dom** ✅ - Best balance (6KB, modern)

### For Utilities
- **lodash** (full) - Too heavy (71KB)
- **lodash-es** ✅ - Tree-shakeable, only bundle what you use
- **ramda** - Functional but larger
- **just-*** - Micro packages (good for single functions)

---

## Build Commands

```bash
# Install dependencies
npm install

# Build once
npm run build

# Watch mode (auto-rebuild)
npm run watch

# Development (build + watch)
npm run dev

# Lint code
npm run lint

# Format code
npm run format
```

---

## Comparison: Before vs After

### Lines of Code
- **Before:** 329 lines
- **After:** 285 lines (src/content.js)
- **Reduction:** 44 lines (~13% less code)

### Readability
- **Before:** ⭐⭐⭐ (Good)
- **After:** ⭐⭐⭐⭐⭐ (Excellent)

### Maintainability
- **Before:** ⭐⭐⭐ (Good)
- **After:** ⭐⭐⭐⭐⭐ (Excellent)

### Bundle Size
- **Before:** ~9KB
- **After:** ~71KB (but still fast)

---

## Conclusion

The NPM package approach provides **significantly cleaner code** at the cost of a **build step** and **larger bundle**. For a Chrome extension, 71KB is still very reasonable and the improved maintainability is worth it.

**Recommendation:** Use this setup for active development and team projects.

