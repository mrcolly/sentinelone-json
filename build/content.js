// SentinelOne JSON Viewer - Bundled with esbuild
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/cash-dom/dist/cash.js
  var require_cash = __commonJS({
    "node_modules/cash-dom/dist/cash.js"(exports, module) {
      (function() {
        "use strict";
        var doc = document;
        var win = window;
        var docEle = doc.documentElement;
        var createElement = doc.createElement.bind(doc);
        var div = createElement("div");
        var table = createElement("table");
        var tbody = createElement("tbody");
        var tr = createElement("tr");
        var isArray2 = Array.isArray, ArrayPrototype = Array.prototype;
        var concat = ArrayPrototype.concat, filter = ArrayPrototype.filter, indexOf = ArrayPrototype.indexOf, map = ArrayPrototype.map, push = ArrayPrototype.push, slice = ArrayPrototype.slice, some = ArrayPrototype.some, splice2 = ArrayPrototype.splice;
        var idRe = /^#(?:[\w-]|\\.|[^\x00-\xa0])*$/;
        var classRe = /^\.(?:[\w-]|\\.|[^\x00-\xa0])*$/;
        var htmlRe = /<.+>/;
        var tagRe = /^\w+$/;
        function find(selector, context) {
          var isFragment = isDocumentFragment(context);
          return !selector || !isFragment && !isDocument(context) && !isElement(context) ? [] : !isFragment && classRe.test(selector) ? context.getElementsByClassName(selector.slice(1).replace(/\\/g, "")) : !isFragment && tagRe.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector);
        }
        var Cash = (
          /** @class */
          function() {
            function Cash2(selector, context) {
              if (!selector)
                return;
              if (isCash(selector))
                return selector;
              var eles = selector;
              if (isString(selector)) {
                var ctx = context || doc;
                eles = idRe.test(selector) && isDocument(ctx) ? ctx.getElementById(selector.slice(1).replace(/\\/g, "")) : htmlRe.test(selector) ? parseHTML(selector) : isCash(ctx) ? ctx.find(selector) : isString(ctx) ? cash(ctx).find(selector) : find(selector, ctx);
                if (!eles)
                  return;
              } else if (isFunction2(selector)) {
                return this.ready(selector);
              }
              if (eles.nodeType || eles === win)
                eles = [eles];
              this.length = eles.length;
              for (var i = 0, l = this.length; i < l; i++) {
                this[i] = eles[i];
              }
            }
            Cash2.prototype.init = function(selector, context) {
              return new Cash2(selector, context);
            };
            return Cash2;
          }()
        );
        var fn = Cash.prototype;
        var cash = fn.init;
        cash.fn = cash.prototype = fn;
        fn.length = 0;
        fn.splice = splice2;
        if (typeof Symbol === "function") {
          fn[Symbol["iterator"]] = ArrayPrototype[Symbol["iterator"]];
        }
        function isCash(value) {
          return value instanceof Cash;
        }
        function isWindow(value) {
          return !!value && value === value.window;
        }
        function isDocument(value) {
          return !!value && value.nodeType === 9;
        }
        function isDocumentFragment(value) {
          return !!value && value.nodeType === 11;
        }
        function isElement(value) {
          return !!value && value.nodeType === 1;
        }
        function isText(value) {
          return !!value && value.nodeType === 3;
        }
        function isBoolean(value) {
          return typeof value === "boolean";
        }
        function isFunction2(value) {
          return typeof value === "function";
        }
        function isString(value) {
          return typeof value === "string";
        }
        function isUndefined(value) {
          return value === void 0;
        }
        function isNull(value) {
          return value === null;
        }
        function isNumeric(value) {
          return !isNaN(parseFloat(value)) && isFinite(value);
        }
        function isPlainObject(value) {
          if (typeof value !== "object" || value === null)
            return false;
          var proto = Object.getPrototypeOf(value);
          return proto === null || proto === Object.prototype;
        }
        cash.isWindow = isWindow;
        cash.isFunction = isFunction2;
        cash.isArray = isArray2;
        cash.isNumeric = isNumeric;
        cash.isPlainObject = isPlainObject;
        function each(arr, callback, _reverse) {
          if (_reverse) {
            var i = arr.length;
            while (i--) {
              if (callback.call(arr[i], i, arr[i]) === false)
                return arr;
            }
          } else if (isPlainObject(arr)) {
            var keys = Object.keys(arr);
            for (var i = 0, l = keys.length; i < l; i++) {
              var key = keys[i];
              if (callback.call(arr[key], key, arr[key]) === false)
                return arr;
            }
          } else {
            for (var i = 0, l = arr.length; i < l; i++) {
              if (callback.call(arr[i], i, arr[i]) === false)
                return arr;
            }
          }
          return arr;
        }
        cash.each = each;
        fn.each = function(callback) {
          return each(this, callback);
        };
        fn.empty = function() {
          return this.each(function(i, ele) {
            while (ele.firstChild) {
              ele.removeChild(ele.firstChild);
            }
          });
        };
        function extend() {
          var sources = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            sources[_i] = arguments[_i];
          }
          var deep = isBoolean(sources[0]) ? sources.shift() : false;
          var target = sources.shift();
          var length = sources.length;
          if (!target)
            return {};
          if (!length)
            return extend(deep, cash, target);
          for (var i = 0; i < length; i++) {
            var source = sources[i];
            for (var key in source) {
              if (deep && (isArray2(source[key]) || isPlainObject(source[key]))) {
                if (!target[key] || target[key].constructor !== source[key].constructor)
                  target[key] = new source[key].constructor();
                extend(deep, target[key], source[key]);
              } else {
                target[key] = source[key];
              }
            }
          }
          return target;
        }
        cash.extend = extend;
        fn.extend = function(plugins) {
          return extend(fn, plugins);
        };
        var splitValuesRe = /\S+/g;
        function getSplitValues(str) {
          return isString(str) ? str.match(splitValuesRe) || [] : [];
        }
        fn.toggleClass = function(cls, force) {
          var classes = getSplitValues(cls);
          var isForce = !isUndefined(force);
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            each(classes, function(i2, c) {
              if (isForce) {
                force ? ele.classList.add(c) : ele.classList.remove(c);
              } else {
                ele.classList.toggle(c);
              }
            });
          });
        };
        fn.addClass = function(cls) {
          return this.toggleClass(cls, true);
        };
        fn.removeAttr = function(attr2) {
          var attrs = getSplitValues(attr2);
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            each(attrs, function(i2, a) {
              ele.removeAttribute(a);
            });
          });
        };
        function attr(attr2, value) {
          if (!attr2)
            return;
          if (isString(attr2)) {
            if (arguments.length < 2) {
              if (!this[0] || !isElement(this[0]))
                return;
              var value_1 = this[0].getAttribute(attr2);
              return isNull(value_1) ? void 0 : value_1;
            }
            if (isUndefined(value))
              return this;
            if (isNull(value))
              return this.removeAttr(attr2);
            return this.each(function(i, ele) {
              if (!isElement(ele))
                return;
              ele.setAttribute(attr2, value);
            });
          }
          for (var key in attr2) {
            this.attr(key, attr2[key]);
          }
          return this;
        }
        fn.attr = attr;
        fn.removeClass = function(cls) {
          if (arguments.length)
            return this.toggleClass(cls, false);
          return this.attr("class", "");
        };
        fn.hasClass = function(cls) {
          return !!cls && some.call(this, function(ele) {
            return isElement(ele) && ele.classList.contains(cls);
          });
        };
        fn.get = function(index) {
          if (isUndefined(index))
            return slice.call(this);
          index = Number(index);
          return this[index < 0 ? index + this.length : index];
        };
        fn.eq = function(index) {
          return cash(this.get(index));
        };
        fn.first = function() {
          return this.eq(0);
        };
        fn.last = function() {
          return this.eq(-1);
        };
        function text(text2) {
          if (isUndefined(text2)) {
            return this.get().map(function(ele) {
              return isElement(ele) || isText(ele) ? ele.textContent : "";
            }).join("");
          }
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            ele.textContent = text2;
          });
        }
        fn.text = text;
        function computeStyle(ele, prop, isVariable) {
          if (!isElement(ele))
            return;
          var style2 = win.getComputedStyle(ele, null);
          return isVariable ? style2.getPropertyValue(prop) || void 0 : style2[prop] || ele.style[prop];
        }
        function computeStyleInt(ele, prop) {
          return parseInt(computeStyle(ele, prop), 10) || 0;
        }
        function getExtraSpace(ele, xAxis) {
          return computeStyleInt(ele, "border".concat(xAxis ? "Left" : "Top", "Width")) + computeStyleInt(ele, "padding".concat(xAxis ? "Left" : "Top")) + computeStyleInt(ele, "padding".concat(xAxis ? "Right" : "Bottom")) + computeStyleInt(ele, "border".concat(xAxis ? "Right" : "Bottom", "Width"));
        }
        var defaultDisplay = {};
        function getDefaultDisplay(tagName) {
          if (defaultDisplay[tagName])
            return defaultDisplay[tagName];
          var ele = createElement(tagName);
          doc.body.insertBefore(ele, null);
          var display = computeStyle(ele, "display");
          doc.body.removeChild(ele);
          return defaultDisplay[tagName] = display !== "none" ? display : "block";
        }
        function isHidden(ele) {
          return computeStyle(ele, "display") === "none";
        }
        function matches(ele, selector) {
          var matches2 = ele && (ele["matches"] || ele["webkitMatchesSelector"] || ele["msMatchesSelector"]);
          return !!matches2 && !!selector && matches2.call(ele, selector);
        }
        function getCompareFunction(comparator) {
          return isString(comparator) ? function(i, ele) {
            return matches(ele, comparator);
          } : isFunction2(comparator) ? comparator : isCash(comparator) ? function(i, ele) {
            return comparator.is(ele);
          } : !comparator ? function() {
            return false;
          } : function(i, ele) {
            return ele === comparator;
          };
        }
        fn.filter = function(comparator) {
          var compare = getCompareFunction(comparator);
          return cash(filter.call(this, function(ele, i) {
            return compare.call(ele, i, ele);
          }));
        };
        function filtered(collection, comparator) {
          return !comparator ? collection : collection.filter(comparator);
        }
        fn.detach = function(comparator) {
          filtered(this, comparator).each(function(i, ele) {
            if (ele.parentNode) {
              ele.parentNode.removeChild(ele);
            }
          });
          return this;
        };
        var fragmentRe = /^\s*<(\w+)[^>]*>/;
        var singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
        var containers = {
          "*": div,
          tr: tbody,
          td: tr,
          th: tr,
          thead: table,
          tbody: table,
          tfoot: table
        };
        function parseHTML(html2) {
          if (!isString(html2))
            return [];
          if (singleTagRe.test(html2))
            return [createElement(RegExp.$1)];
          var fragment = fragmentRe.test(html2) && RegExp.$1;
          var container = containers[fragment] || containers["*"];
          container.innerHTML = html2;
          return cash(container.childNodes).detach().get();
        }
        cash.parseHTML = parseHTML;
        fn.has = function(selector) {
          var comparator = isString(selector) ? function(i, ele) {
            return find(selector, ele).length;
          } : function(i, ele) {
            return ele.contains(selector);
          };
          return this.filter(comparator);
        };
        fn.not = function(comparator) {
          var compare = getCompareFunction(comparator);
          return this.filter(function(i, ele) {
            return (!isString(comparator) || isElement(ele)) && !compare.call(ele, i, ele);
          });
        };
        function pluck(arr, prop, deep, until) {
          var plucked = [];
          var isCallback = isFunction2(prop);
          var compare = until && getCompareFunction(until);
          for (var i = 0, l = arr.length; i < l; i++) {
            if (isCallback) {
              var val_1 = prop(arr[i]);
              if (val_1.length)
                push.apply(plucked, val_1);
            } else {
              var val_2 = arr[i][prop];
              while (val_2 != null) {
                if (until && compare(-1, val_2))
                  break;
                plucked.push(val_2);
                val_2 = deep ? val_2[prop] : null;
              }
            }
          }
          return plucked;
        }
        function getValue2(ele) {
          if (ele.multiple && ele.options)
            return pluck(filter.call(ele.options, function(option) {
              return option.selected && !option.disabled && !option.parentNode.disabled;
            }), "value");
          return ele.value || "";
        }
        function val(value) {
          if (!arguments.length)
            return this[0] && getValue2(this[0]);
          return this.each(function(i, ele) {
            var isSelect = ele.multiple && ele.options;
            if (isSelect || checkableRe.test(ele.type)) {
              var eleValue_1 = isArray2(value) ? map.call(value, String) : isNull(value) ? [] : [String(value)];
              if (isSelect) {
                each(ele.options, function(i2, option) {
                  option.selected = eleValue_1.indexOf(option.value) >= 0;
                }, true);
              } else {
                ele.checked = eleValue_1.indexOf(ele.value) >= 0;
              }
            } else {
              ele.value = isUndefined(value) || isNull(value) ? "" : value;
            }
          });
        }
        fn.val = val;
        fn.is = function(comparator) {
          var compare = getCompareFunction(comparator);
          return some.call(this, function(ele, i) {
            return compare.call(ele, i, ele);
          });
        };
        cash.guid = 1;
        function unique(arr) {
          return arr.length > 1 ? filter.call(arr, function(item, index, self2) {
            return indexOf.call(self2, item) === index;
          }) : arr;
        }
        cash.unique = unique;
        fn.add = function(selector, context) {
          return cash(unique(this.get().concat(cash(selector, context).get())));
        };
        fn.children = function(comparator) {
          return filtered(cash(unique(pluck(this, function(ele) {
            return ele.children;
          }))), comparator);
        };
        fn.parent = function(comparator) {
          return filtered(cash(unique(pluck(this, "parentNode"))), comparator);
        };
        fn.index = function(selector) {
          var child = selector ? cash(selector)[0] : this[0];
          var collection = selector ? this : cash(child).parent().children();
          return indexOf.call(collection, child);
        };
        fn.closest = function(comparator) {
          var filtered2 = this.filter(comparator);
          if (filtered2.length)
            return filtered2;
          var $parent = this.parent();
          if (!$parent.length)
            return filtered2;
          return $parent.closest(comparator);
        };
        fn.siblings = function(comparator) {
          return filtered(cash(unique(pluck(this, function(ele) {
            return cash(ele).parent().children().not(ele);
          }))), comparator);
        };
        fn.find = function(selector) {
          return cash(unique(pluck(this, function(ele) {
            return find(selector, ele);
          })));
        };
        var HTMLCDATARe = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
        var scriptTypeRe = /^$|^module$|\/(java|ecma)script/i;
        var scriptAttributes = ["type", "src", "nonce", "noModule"];
        function evalScripts(node, doc2) {
          var collection = cash(node);
          collection.filter("script").add(collection.find("script")).each(function(i, ele) {
            if (scriptTypeRe.test(ele.type) && docEle.contains(ele)) {
              var script_1 = createElement("script");
              script_1.text = ele.textContent.replace(HTMLCDATARe, "");
              each(scriptAttributes, function(i2, attr2) {
                if (ele[attr2])
                  script_1[attr2] = ele[attr2];
              });
              doc2.head.insertBefore(script_1, null);
              doc2.head.removeChild(script_1);
            }
          });
        }
        function insertElement(anchor, target, left, inside, evaluate) {
          if (inside) {
            anchor.insertBefore(target, left ? anchor.firstChild : null);
          } else {
            if (anchor.nodeName === "HTML") {
              anchor.parentNode.replaceChild(target, anchor);
            } else {
              anchor.parentNode.insertBefore(target, left ? anchor : anchor.nextSibling);
            }
          }
          if (evaluate) {
            evalScripts(target, anchor.ownerDocument);
          }
        }
        function insertSelectors(selectors, anchors, inverse, left, inside, reverseLoop1, reverseLoop2, reverseLoop3) {
          each(selectors, function(si, selector) {
            each(cash(selector), function(ti, target) {
              each(cash(anchors), function(ai, anchor) {
                var anchorFinal = inverse ? target : anchor;
                var targetFinal = inverse ? anchor : target;
                var indexFinal = inverse ? ti : ai;
                insertElement(anchorFinal, !indexFinal ? targetFinal : targetFinal.cloneNode(true), left, inside, !indexFinal);
              }, reverseLoop3);
            }, reverseLoop2);
          }, reverseLoop1);
          return anchors;
        }
        fn.after = function() {
          return insertSelectors(arguments, this, false, false, false, true, true);
        };
        fn.append = function() {
          return insertSelectors(arguments, this, false, false, true);
        };
        function html(html2) {
          if (!arguments.length)
            return this[0] && this[0].innerHTML;
          if (isUndefined(html2))
            return this;
          var hasScript = /<script[\s>]/.test(html2);
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            if (hasScript) {
              cash(ele).empty().append(html2);
            } else {
              ele.innerHTML = html2;
            }
          });
        }
        fn.html = html;
        fn.appendTo = function(selector) {
          return insertSelectors(arguments, this, true, false, true);
        };
        fn.wrapInner = function(selector) {
          return this.each(function(i, ele) {
            var $ele = cash(ele);
            var contents = $ele.contents();
            contents.length ? contents.wrapAll(selector) : $ele.append(selector);
          });
        };
        fn.before = function() {
          return insertSelectors(arguments, this, false, true);
        };
        fn.wrapAll = function(selector) {
          var structure = cash(selector);
          var wrapper = structure[0];
          while (wrapper.children.length)
            wrapper = wrapper.firstElementChild;
          this.first().before(structure);
          return this.appendTo(wrapper);
        };
        fn.wrap = function(selector) {
          return this.each(function(i, ele) {
            var wrapper = cash(selector)[0];
            cash(ele).wrapAll(!i ? wrapper : wrapper.cloneNode(true));
          });
        };
        fn.insertAfter = function(selector) {
          return insertSelectors(arguments, this, true, false, false, false, false, true);
        };
        fn.insertBefore = function(selector) {
          return insertSelectors(arguments, this, true, true);
        };
        fn.prepend = function() {
          return insertSelectors(arguments, this, false, true, true, true, true);
        };
        fn.prependTo = function(selector) {
          return insertSelectors(arguments, this, true, true, true, false, false, true);
        };
        fn.contents = function() {
          return cash(unique(pluck(this, function(ele) {
            return ele.tagName === "IFRAME" ? [ele.contentDocument] : ele.tagName === "TEMPLATE" ? ele.content.childNodes : ele.childNodes;
          })));
        };
        fn.next = function(comparator, _all, _until) {
          return filtered(cash(unique(pluck(this, "nextElementSibling", _all, _until))), comparator);
        };
        fn.nextAll = function(comparator) {
          return this.next(comparator, true);
        };
        fn.nextUntil = function(until, comparator) {
          return this.next(comparator, true, until);
        };
        fn.parents = function(comparator, _until) {
          return filtered(cash(unique(pluck(this, "parentElement", true, _until))), comparator);
        };
        fn.parentsUntil = function(until, comparator) {
          return this.parents(comparator, until);
        };
        fn.prev = function(comparator, _all, _until) {
          return filtered(cash(unique(pluck(this, "previousElementSibling", _all, _until))), comparator);
        };
        fn.prevAll = function(comparator) {
          return this.prev(comparator, true);
        };
        fn.prevUntil = function(until, comparator) {
          return this.prev(comparator, true, until);
        };
        fn.map = function(callback) {
          return cash(concat.apply([], map.call(this, function(ele, i) {
            return callback.call(ele, i, ele);
          })));
        };
        fn.clone = function() {
          return this.map(function(i, ele) {
            return ele.cloneNode(true);
          });
        };
        fn.offsetParent = function() {
          return this.map(function(i, ele) {
            var offsetParent = ele.offsetParent;
            while (offsetParent && computeStyle(offsetParent, "position") === "static") {
              offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || docEle;
          });
        };
        fn.slice = function(start, end) {
          return cash(slice.call(this, start, end));
        };
        var dashAlphaRe = /-([a-z])/g;
        function camelCase(str) {
          return str.replace(dashAlphaRe, function(match, letter) {
            return letter.toUpperCase();
          });
        }
        fn.ready = function(callback) {
          var cb = function() {
            return setTimeout(callback, 0, cash);
          };
          if (doc.readyState !== "loading") {
            cb();
          } else {
            doc.addEventListener("DOMContentLoaded", cb);
          }
          return this;
        };
        fn.unwrap = function() {
          this.parent().each(function(i, ele) {
            if (ele.tagName === "BODY")
              return;
            var $ele = cash(ele);
            $ele.replaceWith($ele.children());
          });
          return this;
        };
        fn.offset = function() {
          var ele = this[0];
          if (!ele)
            return;
          var rect = ele.getBoundingClientRect();
          return {
            top: rect.top + win.pageYOffset,
            left: rect.left + win.pageXOffset
          };
        };
        fn.position = function() {
          var ele = this[0];
          if (!ele)
            return;
          var isFixed = computeStyle(ele, "position") === "fixed";
          var offset = isFixed ? ele.getBoundingClientRect() : this.offset();
          if (!isFixed) {
            var doc_1 = ele.ownerDocument;
            var offsetParent = ele.offsetParent || doc_1.documentElement;
            while ((offsetParent === doc_1.body || offsetParent === doc_1.documentElement) && computeStyle(offsetParent, "position") === "static") {
              offsetParent = offsetParent.parentNode;
            }
            if (offsetParent !== ele && isElement(offsetParent)) {
              var parentOffset = cash(offsetParent).offset();
              offset.top -= parentOffset.top + computeStyleInt(offsetParent, "borderTopWidth");
              offset.left -= parentOffset.left + computeStyleInt(offsetParent, "borderLeftWidth");
            }
          }
          return {
            top: offset.top - computeStyleInt(ele, "marginTop"),
            left: offset.left - computeStyleInt(ele, "marginLeft")
          };
        };
        var propMap = {
          /* GENERAL */
          class: "className",
          contenteditable: "contentEditable",
          /* LABEL */
          for: "htmlFor",
          /* INPUT */
          readonly: "readOnly",
          maxlength: "maxLength",
          tabindex: "tabIndex",
          /* TABLE */
          colspan: "colSpan",
          rowspan: "rowSpan",
          /* IMAGE */
          usemap: "useMap"
        };
        fn.prop = function(prop, value) {
          if (!prop)
            return;
          if (isString(prop)) {
            prop = propMap[prop] || prop;
            if (arguments.length < 2)
              return this[0] && this[0][prop];
            return this.each(function(i, ele) {
              ele[prop] = value;
            });
          }
          for (var key in prop) {
            this.prop(key, prop[key]);
          }
          return this;
        };
        fn.removeProp = function(prop) {
          return this.each(function(i, ele) {
            delete ele[propMap[prop] || prop];
          });
        };
        var cssVariableRe = /^--/;
        function isCSSVariable(prop) {
          return cssVariableRe.test(prop);
        }
        var prefixedProps = {};
        var style = div.style;
        var vendorsPrefixes = ["webkit", "moz", "ms"];
        function getPrefixedProp(prop, isVariable) {
          if (isVariable === void 0) {
            isVariable = isCSSVariable(prop);
          }
          if (isVariable)
            return prop;
          if (!prefixedProps[prop]) {
            var propCC = camelCase(prop);
            var propUC = "".concat(propCC[0].toUpperCase()).concat(propCC.slice(1));
            var props = "".concat(propCC, " ").concat(vendorsPrefixes.join("".concat(propUC, " "))).concat(propUC).split(" ");
            each(props, function(i, p) {
              if (p in style) {
                prefixedProps[prop] = p;
                return false;
              }
            });
          }
          return prefixedProps[prop];
        }
        var numericProps = {
          animationIterationCount: true,
          columnCount: true,
          flexGrow: true,
          flexShrink: true,
          fontWeight: true,
          gridArea: true,
          gridColumn: true,
          gridColumnEnd: true,
          gridColumnStart: true,
          gridRow: true,
          gridRowEnd: true,
          gridRowStart: true,
          lineHeight: true,
          opacity: true,
          order: true,
          orphans: true,
          widows: true,
          zIndex: true
        };
        function getSuffixedValue(prop, value, isVariable) {
          if (isVariable === void 0) {
            isVariable = isCSSVariable(prop);
          }
          return !isVariable && !numericProps[prop] && isNumeric(value) ? "".concat(value, "px") : value;
        }
        function css(prop, value) {
          if (isString(prop)) {
            var isVariable_1 = isCSSVariable(prop);
            prop = getPrefixedProp(prop, isVariable_1);
            if (arguments.length < 2)
              return this[0] && computeStyle(this[0], prop, isVariable_1);
            if (!prop)
              return this;
            value = getSuffixedValue(prop, value, isVariable_1);
            return this.each(function(i, ele) {
              if (!isElement(ele))
                return;
              if (isVariable_1) {
                ele.style.setProperty(prop, value);
              } else {
                ele.style[prop] = value;
              }
            });
          }
          for (var key in prop) {
            this.css(key, prop[key]);
          }
          return this;
        }
        ;
        fn.css = css;
        function attempt(fn2, arg) {
          try {
            return fn2(arg);
          } catch (_a) {
            return arg;
          }
        }
        var JSONStringRe = /^\s+|\s+$/;
        function getData(ele, key) {
          var value = ele.dataset[key] || ele.dataset[camelCase(key)];
          if (JSONStringRe.test(value))
            return value;
          return attempt(JSON.parse, value);
        }
        function setData(ele, key, value) {
          value = attempt(JSON.stringify, value);
          ele.dataset[camelCase(key)] = value;
        }
        function data(name, value) {
          if (!name) {
            if (!this[0])
              return;
            var datas = {};
            for (var key in this[0].dataset) {
              datas[key] = getData(this[0], key);
            }
            return datas;
          }
          if (isString(name)) {
            if (arguments.length < 2)
              return this[0] && getData(this[0], name);
            if (isUndefined(value))
              return this;
            return this.each(function(i, ele) {
              setData(ele, name, value);
            });
          }
          for (var key in name) {
            this.data(key, name[key]);
          }
          return this;
        }
        fn.data = data;
        function getDocumentDimension(doc2, dimension) {
          var docEle2 = doc2.documentElement;
          return Math.max(doc2.body["scroll".concat(dimension)], docEle2["scroll".concat(dimension)], doc2.body["offset".concat(dimension)], docEle2["offset".concat(dimension)], docEle2["client".concat(dimension)]);
        }
        each([true, false], function(i, outer) {
          each(["Width", "Height"], function(i2, prop) {
            var name = "".concat(outer ? "outer" : "inner").concat(prop);
            fn[name] = function(includeMargins) {
              if (!this[0])
                return;
              if (isWindow(this[0]))
                return outer ? this[0]["inner".concat(prop)] : this[0].document.documentElement["client".concat(prop)];
              if (isDocument(this[0]))
                return getDocumentDimension(this[0], prop);
              return this[0]["".concat(outer ? "offset" : "client").concat(prop)] + (includeMargins && outer ? computeStyleInt(this[0], "margin".concat(i2 ? "Top" : "Left")) + computeStyleInt(this[0], "margin".concat(i2 ? "Bottom" : "Right")) : 0);
            };
          });
        });
        each(["Width", "Height"], function(index, prop) {
          var propLC = prop.toLowerCase();
          fn[propLC] = function(value) {
            if (!this[0])
              return isUndefined(value) ? void 0 : this;
            if (!arguments.length) {
              if (isWindow(this[0]))
                return this[0].document.documentElement["client".concat(prop)];
              if (isDocument(this[0]))
                return getDocumentDimension(this[0], prop);
              return this[0].getBoundingClientRect()[propLC] - getExtraSpace(this[0], !index);
            }
            var valueNumber = parseInt(value, 10);
            return this.each(function(i, ele) {
              if (!isElement(ele))
                return;
              var boxSizing = computeStyle(ele, "boxSizing");
              ele.style[propLC] = getSuffixedValue(propLC, valueNumber + (boxSizing === "border-box" ? getExtraSpace(ele, !index) : 0));
            });
          };
        });
        var displayProperty = "___cd";
        fn.toggle = function(force) {
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            var hidden = isHidden(ele);
            var show = isUndefined(force) ? hidden : force;
            if (show) {
              ele.style.display = ele[displayProperty] || "";
              if (isHidden(ele)) {
                ele.style.display = getDefaultDisplay(ele.tagName);
              }
            } else if (!hidden) {
              ele[displayProperty] = computeStyle(ele, "display");
              ele.style.display = "none";
            }
          });
        };
        fn.hide = function() {
          return this.toggle(false);
        };
        fn.show = function() {
          return this.toggle(true);
        };
        var eventsNamespace = "___ce";
        var eventsNamespacesSeparator = ".";
        var eventsFocus = { focus: "focusin", blur: "focusout" };
        var eventsHover = { mouseenter: "mouseover", mouseleave: "mouseout" };
        var eventsMouseRe = /^(mouse|pointer|contextmenu|drag|drop|click|dblclick)/i;
        function getEventNameBubbling(name) {
          return eventsHover[name] || eventsFocus[name] || name;
        }
        function parseEventName(eventName) {
          var parts = eventName.split(eventsNamespacesSeparator);
          return [parts[0], parts.slice(1).sort()];
        }
        fn.trigger = function(event, data2) {
          if (isString(event)) {
            var _a = parseEventName(event), nameOriginal = _a[0], namespaces = _a[1];
            var name_1 = getEventNameBubbling(nameOriginal);
            if (!name_1)
              return this;
            var type = eventsMouseRe.test(name_1) ? "MouseEvents" : "HTMLEvents";
            event = doc.createEvent(type);
            event.initEvent(name_1, true, true);
            event.namespace = namespaces.join(eventsNamespacesSeparator);
            event.___ot = nameOriginal;
          }
          event.___td = data2;
          var isEventFocus = event.___ot in eventsFocus;
          return this.each(function(i, ele) {
            if (isEventFocus && isFunction2(ele[event.___ot])) {
              ele["___i".concat(event.type)] = true;
              ele[event.___ot]();
              ele["___i".concat(event.type)] = false;
            }
            ele.dispatchEvent(event);
          });
        };
        function getEventsCache(ele) {
          return ele[eventsNamespace] = ele[eventsNamespace] || {};
        }
        function addEvent(ele, name, namespaces, selector, callback) {
          var eventCache = getEventsCache(ele);
          eventCache[name] = eventCache[name] || [];
          eventCache[name].push([namespaces, selector, callback]);
          ele.addEventListener(name, callback);
        }
        function hasNamespaces(ns1, ns2) {
          return !ns2 || !some.call(ns2, function(ns) {
            return ns1.indexOf(ns) < 0;
          });
        }
        function removeEvent(ele, name, namespaces, selector, callback) {
          var cache = getEventsCache(ele);
          if (!name) {
            for (name in cache) {
              removeEvent(ele, name, namespaces, selector, callback);
            }
          } else if (cache[name]) {
            cache[name] = cache[name].filter(function(_a) {
              var ns = _a[0], sel = _a[1], cb = _a[2];
              if (callback && cb.guid !== callback.guid || !hasNamespaces(ns, namespaces) || selector && selector !== sel)
                return true;
              ele.removeEventListener(name, cb);
            });
          }
        }
        fn.off = function(eventFullName, selector, callback) {
          var _this = this;
          if (isUndefined(eventFullName)) {
            this.each(function(i, ele) {
              if (!isElement(ele) && !isDocument(ele) && !isWindow(ele))
                return;
              removeEvent(ele);
            });
          } else if (!isString(eventFullName)) {
            for (var key in eventFullName) {
              this.off(key, eventFullName[key]);
            }
          } else {
            if (isFunction2(selector)) {
              callback = selector;
              selector = "";
            }
            each(getSplitValues(eventFullName), function(i, eventFullName2) {
              var _a = parseEventName(eventFullName2), nameOriginal = _a[0], namespaces = _a[1];
              var name = getEventNameBubbling(nameOriginal);
              _this.each(function(i2, ele) {
                if (!isElement(ele) && !isDocument(ele) && !isWindow(ele))
                  return;
                removeEvent(ele, name, namespaces, selector, callback);
              });
            });
          }
          return this;
        };
        fn.remove = function(comparator) {
          filtered(this, comparator).detach().off();
          return this;
        };
        fn.replaceWith = function(selector) {
          return this.before(selector).remove();
        };
        fn.replaceAll = function(selector) {
          cash(selector).replaceWith(this);
          return this;
        };
        function on(eventFullName, selector, data2, callback, _one) {
          var _this = this;
          if (!isString(eventFullName)) {
            for (var key in eventFullName) {
              this.on(key, selector, data2, eventFullName[key], _one);
            }
            return this;
          }
          if (!isString(selector)) {
            if (isUndefined(selector) || isNull(selector)) {
              selector = "";
            } else if (isUndefined(data2)) {
              data2 = selector;
              selector = "";
            } else {
              callback = data2;
              data2 = selector;
              selector = "";
            }
          }
          if (!isFunction2(callback)) {
            callback = data2;
            data2 = void 0;
          }
          if (!callback)
            return this;
          each(getSplitValues(eventFullName), function(i, eventFullName2) {
            var _a = parseEventName(eventFullName2), nameOriginal = _a[0], namespaces = _a[1];
            var name = getEventNameBubbling(nameOriginal);
            var isEventHover = nameOriginal in eventsHover;
            var isEventFocus = nameOriginal in eventsFocus;
            if (!name)
              return;
            _this.each(function(i2, ele) {
              if (!isElement(ele) && !isDocument(ele) && !isWindow(ele))
                return;
              var finalCallback = function(event) {
                if (event.target["___i".concat(event.type)])
                  return event.stopImmediatePropagation();
                if (event.namespace && !hasNamespaces(namespaces, event.namespace.split(eventsNamespacesSeparator)))
                  return;
                if (!selector && (isEventFocus && (event.target !== ele || event.___ot === name) || isEventHover && event.relatedTarget && ele.contains(event.relatedTarget)))
                  return;
                var thisArg = ele;
                if (selector) {
                  var target = event.target;
                  while (!matches(target, selector)) {
                    if (target === ele)
                      return;
                    target = target.parentNode;
                    if (!target)
                      return;
                  }
                  thisArg = target;
                }
                Object.defineProperty(event, "currentTarget", {
                  configurable: true,
                  get: function() {
                    return thisArg;
                  }
                });
                Object.defineProperty(event, "delegateTarget", {
                  configurable: true,
                  get: function() {
                    return ele;
                  }
                });
                Object.defineProperty(event, "data", {
                  configurable: true,
                  get: function() {
                    return data2;
                  }
                });
                var returnValue = callback.call(thisArg, event, event.___td);
                if (_one) {
                  removeEvent(ele, name, namespaces, selector, finalCallback);
                }
                if (returnValue === false) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              };
              finalCallback.guid = callback.guid = callback.guid || cash.guid++;
              addEvent(ele, name, namespaces, selector, finalCallback);
            });
          });
          return this;
        }
        fn.on = on;
        function one(eventFullName, selector, data2, callback) {
          return this.on(eventFullName, selector, data2, callback, true);
        }
        ;
        fn.one = one;
        var queryEncodeCRLFRe = /\r?\n/g;
        function queryEncode(prop, value) {
          return "&".concat(encodeURIComponent(prop), "=").concat(encodeURIComponent(value.replace(queryEncodeCRLFRe, "\r\n")));
        }
        var skippableRe = /file|reset|submit|button|image/i;
        var checkableRe = /radio|checkbox/i;
        fn.serialize = function() {
          var query = "";
          this.each(function(i, ele) {
            each(ele.elements || [ele], function(i2, ele2) {
              if (ele2.disabled || !ele2.name || ele2.tagName === "FIELDSET" || skippableRe.test(ele2.type) || checkableRe.test(ele2.type) && !ele2.checked)
                return;
              var value = getValue2(ele2);
              if (!isUndefined(value)) {
                var values = isArray2(value) ? value : [value];
                each(values, function(i3, value2) {
                  query += queryEncode(ele2.name, value2);
                });
              }
            });
          });
          return query.slice(1);
        };
        if (typeof exports !== "undefined") {
          module.exports = cash;
        } else {
          win["cash"] = win["$"] = cash;
        }
      })();
    }
  });

  // node_modules/lodash-es/_freeGlobal.js
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  var freeGlobal_default = freeGlobal;

  // node_modules/lodash-es/_root.js
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal_default || freeSelf || Function("return this")();
  var root_default = root;

  // node_modules/lodash-es/_Symbol.js
  var Symbol2 = root_default.Symbol;
  var Symbol_default = Symbol2;

  // node_modules/lodash-es/_getRawTag.js
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol_default ? Symbol_default.toStringTag : void 0;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  var getRawTag_default = getRawTag;

  // node_modules/lodash-es/_objectToString.js
  var objectProto2 = Object.prototype;
  var nativeObjectToString2 = objectProto2.toString;
  function objectToString(value) {
    return nativeObjectToString2.call(value);
  }
  var objectToString_default = objectToString;

  // node_modules/lodash-es/_baseGetTag.js
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var symToStringTag2 = Symbol_default ? Symbol_default.toStringTag : void 0;
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag2 && symToStringTag2 in Object(value) ? getRawTag_default(value) : objectToString_default(value);
  }
  var baseGetTag_default = baseGetTag;

  // node_modules/lodash-es/isObjectLike.js
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  var isObjectLike_default = isObjectLike;

  // node_modules/lodash-es/isSymbol.js
  var symbolTag = "[object Symbol]";
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike_default(value) && baseGetTag_default(value) == symbolTag;
  }
  var isSymbol_default = isSymbol;

  // node_modules/lodash-es/_arrayMap.js
  function arrayMap(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length, result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }
  var arrayMap_default = arrayMap;

  // node_modules/lodash-es/isArray.js
  var isArray = Array.isArray;
  var isArray_default = isArray;

  // node_modules/lodash-es/_baseToString.js
  var INFINITY = 1 / 0;
  var symbolProto = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolToString = symbolProto ? symbolProto.toString : void 0;
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isArray_default(value)) {
      return arrayMap_default(value, baseToString) + "";
    }
    if (isSymbol_default(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  var baseToString_default = baseToString;

  // node_modules/lodash-es/isObject.js
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  var isObject_default = isObject;

  // node_modules/lodash-es/isFunction.js
  var asyncTag = "[object AsyncFunction]";
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var proxyTag = "[object Proxy]";
  function isFunction(value) {
    if (!isObject_default(value)) {
      return false;
    }
    var tag = baseGetTag_default(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  var isFunction_default = isFunction;

  // node_modules/lodash-es/_coreJsData.js
  var coreJsData = root_default["__core-js_shared__"];
  var coreJsData_default = coreJsData;

  // node_modules/lodash-es/_isMasked.js
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData_default && coreJsData_default.keys && coreJsData_default.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  var isMasked_default = isMasked;

  // node_modules/lodash-es/_toSource.js
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  var toSource_default = toSource;

  // node_modules/lodash-es/_baseIsNative.js
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto2 = Function.prototype;
  var objectProto3 = Object.prototype;
  var funcToString2 = funcProto2.toString;
  var hasOwnProperty2 = objectProto3.hasOwnProperty;
  var reIsNative = RegExp(
    "^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  function baseIsNative(value) {
    if (!isObject_default(value) || isMasked_default(value)) {
      return false;
    }
    var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource_default(value));
  }
  var baseIsNative_default = baseIsNative;

  // node_modules/lodash-es/_getValue.js
  function getValue(object, key) {
    return object == null ? void 0 : object[key];
  }
  var getValue_default = getValue;

  // node_modules/lodash-es/_getNative.js
  function getNative(object, key) {
    var value = getValue_default(object, key);
    return baseIsNative_default(value) ? value : void 0;
  }
  var getNative_default = getNative;

  // node_modules/lodash-es/_defineProperty.js
  var defineProperty = function() {
    try {
      var func = getNative_default(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {
    }
  }();
  var defineProperty_default = defineProperty;

  // node_modules/lodash-es/_isIndex.js
  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  var isIndex_default = isIndex;

  // node_modules/lodash-es/_baseAssignValue.js
  function baseAssignValue(object, key, value) {
    if (key == "__proto__" && defineProperty_default) {
      defineProperty_default(object, key, {
        "configurable": true,
        "enumerable": true,
        "value": value,
        "writable": true
      });
    } else {
      object[key] = value;
    }
  }
  var baseAssignValue_default = baseAssignValue;

  // node_modules/lodash-es/eq.js
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var eq_default = eq;

  // node_modules/lodash-es/_assignValue.js
  var objectProto4 = Object.prototype;
  var hasOwnProperty3 = objectProto4.hasOwnProperty;
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty3.call(object, key) && eq_default(objValue, value)) || value === void 0 && !(key in object)) {
      baseAssignValue_default(object, key, value);
    }
  }
  var assignValue_default = assignValue;

  // node_modules/lodash-es/_isKey.js
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  function isKey(value, object) {
    if (isArray_default(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol_default(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  var isKey_default = isKey;

  // node_modules/lodash-es/_nativeCreate.js
  var nativeCreate = getNative_default(Object, "create");
  var nativeCreate_default = nativeCreate;

  // node_modules/lodash-es/_hashClear.js
  function hashClear() {
    this.__data__ = nativeCreate_default ? nativeCreate_default(null) : {};
    this.size = 0;
  }
  var hashClear_default = hashClear;

  // node_modules/lodash-es/_hashDelete.js
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  var hashDelete_default = hashDelete;

  // node_modules/lodash-es/_hashGet.js
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var objectProto5 = Object.prototype;
  var hasOwnProperty4 = objectProto5.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate_default) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty4.call(data, key) ? data[key] : void 0;
  }
  var hashGet_default = hashGet;

  // node_modules/lodash-es/_hashHas.js
  var objectProto6 = Object.prototype;
  var hasOwnProperty5 = objectProto6.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate_default ? data[key] !== void 0 : hasOwnProperty5.call(data, key);
  }
  var hashHas_default = hashHas;

  // node_modules/lodash-es/_hashSet.js
  var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate_default && value === void 0 ? HASH_UNDEFINED2 : value;
    return this;
  }
  var hashSet_default = hashSet;

  // node_modules/lodash-es/_Hash.js
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear_default;
  Hash.prototype["delete"] = hashDelete_default;
  Hash.prototype.get = hashGet_default;
  Hash.prototype.has = hashHas_default;
  Hash.prototype.set = hashSet_default;
  var Hash_default = Hash;

  // node_modules/lodash-es/_listCacheClear.js
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  var listCacheClear_default = listCacheClear;

  // node_modules/lodash-es/_assocIndexOf.js
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq_default(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  var assocIndexOf_default = assocIndexOf;

  // node_modules/lodash-es/_listCacheDelete.js
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  var listCacheDelete_default = listCacheDelete;

  // node_modules/lodash-es/_listCacheGet.js
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  var listCacheGet_default = listCacheGet;

  // node_modules/lodash-es/_listCacheHas.js
  function listCacheHas(key) {
    return assocIndexOf_default(this.__data__, key) > -1;
  }
  var listCacheHas_default = listCacheHas;

  // node_modules/lodash-es/_listCacheSet.js
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  var listCacheSet_default = listCacheSet;

  // node_modules/lodash-es/_ListCache.js
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear_default;
  ListCache.prototype["delete"] = listCacheDelete_default;
  ListCache.prototype.get = listCacheGet_default;
  ListCache.prototype.has = listCacheHas_default;
  ListCache.prototype.set = listCacheSet_default;
  var ListCache_default = ListCache;

  // node_modules/lodash-es/_Map.js
  var Map = getNative_default(root_default, "Map");
  var Map_default = Map;

  // node_modules/lodash-es/_mapCacheClear.js
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      "hash": new Hash_default(),
      "map": new (Map_default || ListCache_default)(),
      "string": new Hash_default()
    };
  }
  var mapCacheClear_default = mapCacheClear;

  // node_modules/lodash-es/_isKeyable.js
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  var isKeyable_default = isKeyable;

  // node_modules/lodash-es/_getMapData.js
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable_default(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  var getMapData_default = getMapData;

  // node_modules/lodash-es/_mapCacheDelete.js
  function mapCacheDelete(key) {
    var result = getMapData_default(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  var mapCacheDelete_default = mapCacheDelete;

  // node_modules/lodash-es/_mapCacheGet.js
  function mapCacheGet(key) {
    return getMapData_default(this, key).get(key);
  }
  var mapCacheGet_default = mapCacheGet;

  // node_modules/lodash-es/_mapCacheHas.js
  function mapCacheHas(key) {
    return getMapData_default(this, key).has(key);
  }
  var mapCacheHas_default = mapCacheHas;

  // node_modules/lodash-es/_mapCacheSet.js
  function mapCacheSet(key, value) {
    var data = getMapData_default(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  var mapCacheSet_default = mapCacheSet;

  // node_modules/lodash-es/_MapCache.js
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear_default;
  MapCache.prototype["delete"] = mapCacheDelete_default;
  MapCache.prototype.get = mapCacheGet_default;
  MapCache.prototype.has = mapCacheHas_default;
  MapCache.prototype.set = mapCacheSet_default;
  var MapCache_default = MapCache;

  // node_modules/lodash-es/memoize.js
  var FUNC_ERROR_TEXT = "Expected a function";
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver != null && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache_default)();
    return memoized;
  }
  memoize.Cache = MapCache_default;
  var memoize_default = memoize;

  // node_modules/lodash-es/_memoizeCapped.js
  var MAX_MEMOIZE_SIZE = 500;
  function memoizeCapped(func) {
    var result = memoize_default(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }
  var memoizeCapped_default = memoizeCapped;

  // node_modules/lodash-es/_stringToPath.js
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = memoizeCapped_default(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  var stringToPath_default = stringToPath;

  // node_modules/lodash-es/toString.js
  function toString(value) {
    return value == null ? "" : baseToString_default(value);
  }
  var toString_default = toString;

  // node_modules/lodash-es/_castPath.js
  function castPath(value, object) {
    if (isArray_default(value)) {
      return value;
    }
    return isKey_default(value, object) ? [value] : stringToPath_default(toString_default(value));
  }
  var castPath_default = castPath;

  // node_modules/lodash-es/_toKey.js
  var INFINITY2 = 1 / 0;
  function toKey(value) {
    if (typeof value == "string" || isSymbol_default(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY2 ? "-0" : result;
  }
  var toKey_default = toKey;

  // node_modules/lodash-es/_baseSet.js
  function baseSet(object, path, value, customizer) {
    if (!isObject_default(object)) {
      return object;
    }
    path = castPath_default(path, object);
    var index = -1, length = path.length, lastIndex = length - 1, nested = object;
    while (nested != null && ++index < length) {
      var key = toKey_default(path[index]), newValue = value;
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return object;
      }
      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : void 0;
        if (newValue === void 0) {
          newValue = isObject_default(objValue) ? objValue : isIndex_default(path[index + 1]) ? [] : {};
        }
      }
      assignValue_default(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }
  var baseSet_default = baseSet;

  // node_modules/lodash-es/set.js
  function set(object, path, value) {
    return object == null ? object : baseSet_default(object, path, value);
  }
  var set_default = set;

  // src/content.js
  var import_cash_dom = __toESM(require_cash(), 1);
  var observer = null;
  var jsonModalOpen = false;
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
  function checkAndInjectButton() {
    (0, import_cash_dom.default)("div, header").each(function() {
      const $container = (0, import_cash_dom.default)(this);
      const $buttons = $container.find("button");
      let hasOriginalLog = false;
      let hasThreadLog = false;
      let hasJsonButton = false;
      $buttons.each(function() {
        const text = (0, import_cash_dom.default)(this).text().trim();
        if (text === "See in Original Log")
          hasOriginalLog = true;
        if (text === "See in Thread Log")
          hasThreadLog = true;
        if (text === "See as JSON" || this.dataset.s1JsonButton === "true")
          hasJsonButton = true;
      });
      if (hasOriginalLog && hasThreadLog && !hasJsonButton) {
        injectJsonButton(this);
        return false;
      }
    });
  }
  function injectJsonButton(container) {
    const $container = (0, import_cash_dom.default)(container);
    const $existingButton = $container.find("button").first();
    const $jsonButton = (0, import_cash_dom.default)("<button>").text("See as JSON").addClass("s1-json-viewer-button").attr("data-s1-json-button", "true").on("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      extractAndShowJSON();
    });
    if ($existingButton.length) {
      const existingClasses = $existingButton.attr("class");
      $jsonButton.attr("class", existingClasses + " s1-json-viewer-button");
    }
    const $lastButton = $container.find("button").last();
    if ($lastButton.length) {
      $lastButton.after($jsonButton);
    } else {
      $container.append($jsonButton);
    }
  }
  function extractAndShowJSON() {
    const eventData = {};
    const $propertiesSection = findEventPropertiesSection();
    if (!($propertiesSection == null ? void 0 : $propertiesSection.length)) {
      alert("Could not find event properties. Please make sure an event is open.");
      return;
    }
    const bodyText = (0, import_cash_dom.default)("body").text();
    const eventTimeRegex = /Event Time[\s\S]*?(\w{3} \d{2}, \d{4} \d{2}:\d{2}:\d{2})/;
    const eventTimeMatch = eventTimeRegex.exec(bodyText);
    if (eventTimeMatch) {
      eventData.eventTime = eventTimeMatch[1];
    }
    const properties = extractProperties($propertiesSection);
    const nestedProperties = convertToNestedObject(properties);
    eventData.properties = nestedProperties;
    displayJSONModal(eventData);
  }
  function convertToNestedObject(flatObj) {
    const result = {};
    Object.entries(flatObj).forEach(([key, value]) => {
      if (key.includes("..."))
        return;
      const cleanKey = key.split(".").filter((segment) => segment.trim().length > 0).join(".");
      if (cleanKey && cleanKey.length > 0) {
        set_default(result, cleanKey, value);
      }
    });
    return result;
  }
  function findEventPropertiesSection() {
    const $headings = (0, import_cash_dom.default)('h1, h2, h3, h4, h5, h6, div[class*="heading"], div[class*="title"], span[class*="heading"], span[class*="title"]');
    let $section = null;
    $headings.each(function() {
      const text = (0, import_cash_dom.default)(this).text().trim();
      if (text === "Event properties") {
        let $container = (0, import_cash_dom.default)(this).parent();
        while ($container.length && !$container.is("body")) {
          const classes = $container.attr("class") || "";
          if (classes.includes("Shell") || classes.includes("Layout_container")) {
            break;
          }
          const propertyRegex = /^[a-z]+\.[a-z_]+\.[a-z_]+$/;
          const $props = $container.find("div").filter(function() {
            const text2 = (0, import_cash_dom.default)(this).text();
            return propertyRegex.test(text2);
          });
          if ($props.length > 5) {
            $section = $container;
            return false;
          }
          $container = $container.parent();
        }
        if (!($section == null ? void 0 : $section.length)) {
          $section = (0, import_cash_dom.default)(this).parent();
        }
        return false;
      }
    });
    if ($section == null ? void 0 : $section.length) {
      return $section;
    }
    let $found = null;
    let maxProps = 0;
    (0, import_cash_dom.default)("div[class], section[class]").each(function() {
      const $container = (0, import_cash_dom.default)(this);
      const classes = $container.attr("class") || "";
      if (classes.includes("Shell") || classes.includes("Layout_container") || classes.includes("App")) {
        return;
      }
      const $children = $container.children();
      let propCount = 0;
      const propertyKeyRegex = /^[a-z]+\.[a-z_.]+$/;
      $children.each(function() {
        const $child = (0, import_cash_dom.default)(this);
        if ($child.children().length === 2) {
          const key = $child.children().eq(0).text().trim();
          if (propertyKeyRegex.test(key)) {
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
  function isUIElement(key) {
    return key.includes("See as JSON") || key.includes("See in ") || key.includes("Collapse") || key.includes("Search") || key.includes("Event properties") || key.includes("Event Time");
  }
  function isLogFormat(key) {
    const timePattern = /\d{1,2}:\d{2}:\d{2}/;
    return key.includes("|") || key.includes("PM") || key.includes("AM") || key.includes("=") || key.includes("'") || key.includes('"') || key.includes("...") || timePattern.test(key);
  }
  function isValidPropertyKey(key) {
    if (!key || key.length < 2 || key.length > 150)
      return false;
    if (!key.includes(".") && !key.includes("_"))
      return false;
    if (isUIElement(key) || isLogFormat(key))
      return false;
    const emojiPattern = /[\u{1F000}-\u{1F9FF}]/u;
    if (emojiPattern.test(key))
      return false;
    const specialChars = (key.match(/[^a-zA-Z0-9._-]/g) || []).length;
    return specialChars <= 3;
  }
  function cleanPropertyValue(value) {
    if (!value)
      return null;
    const cleaned = value.trim();
    if (cleaned.length > 1e3)
      return null;
    if (cleaned.includes("|") && cleaned.length > 100)
      return null;
    return cleaned;
  }
  function extractFromPropertyWrappers($content) {
    const properties = {};
    const $propertyWrappers = $content.find('div[class*="GyObjectAttribute-module_root-wrapper"]');
    $propertyWrappers.each(function() {
      const $wrapper = (0, import_cash_dom.default)(this);
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
    return properties;
  }
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
  function extractFromSpans($row, properties) {
    const $spans = $row.find("span, div, td");
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
  function extractFromGenericStructure($container) {
    const properties = {};
    const $rows = $container.find('div[class*="row"], tr, li, div[class*="property"], div[class*="item"]');
    $rows.each(function() {
      const $row = (0, import_cash_dom.default)(this);
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
    const $content = $container.find('div[class*="collapsible-content"]');
    if ($content.length) {
      const properties2 = extractFromPropertyWrappers($content);
      if (Object.keys(properties2).length > 0) {
        return properties2;
      }
    }
    const properties = extractFromGenericStructure($container);
    if (Object.keys(properties).length > 0) {
      return properties;
    }
    const textProperties = {};
    const text = $container.text();
    const lines = text.split("\n").filter((line) => line.trim());
    for (let i = 0; i < lines.length - 1; ) {
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
    const $existing = (0, import_cash_dom.default)("#s1-json-modal");
    if ($existing.length) {
      $existing.remove();
      jsonModalOpen = false;
      return;
    }
    jsonModalOpen = true;
    const $modal = (0, import_cash_dom.default)("<div>").attr("id", "s1-json-modal").addClass("s1-json-modal");
    const jsonString = JSON.stringify(data, null, 2);
    const $header = (0, import_cash_dom.default)("<div>").addClass("s1-json-modal-header").append((0, import_cash_dom.default)("<h2>").text("Event JSON")).append(
      (0, import_cash_dom.default)("<button>").text("\xD7").addClass("s1-json-modal-close").on("click", () => {
        $modal.remove();
        jsonModalOpen = false;
      })
    );
    const $jsonContainer = (0, import_cash_dom.default)("<div>").addClass("s1-json-container").append(
      (0, import_cash_dom.default)("<pre>").addClass("s1-json-pre").append((0, import_cash_dom.default)("<code>").text(jsonString))
    );
    const $copyBtn = (0, import_cash_dom.default)("<button>").text("Copy to Clipboard").addClass("s1-json-copy-btn").on("click", function() {
      const $btn = (0, import_cash_dom.default)(this);
      navigator.clipboard.writeText(jsonString).then(() => {
        const originalText = $btn.text();
        $btn.text("\u2713 Copied!");
        setTimeout(() => $btn.text(originalText), 2e3);
      });
    });
    const $downloadBtn = (0, import_cash_dom.default)("<button>").text("Download JSON").addClass("s1-json-download-btn").on("click", () => {
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const $a = (0, import_cash_dom.default)("<a>").attr("href", url).attr("download", `sentinelone-event-${Date.now()}.json`).get(0);
      $a.click();
      URL.revokeObjectURL(url);
    });
    const $buttonContainer = (0, import_cash_dom.default)("<div>").addClass("s1-json-button-container").append($copyBtn).append($downloadBtn);
    const $modalContent = (0, import_cash_dom.default)("<div>").addClass("s1-json-modal-content").append($header).append($jsonContainer).append($buttonContainer);
    $modal.append($modalContent);
    (0, import_cash_dom.default)("body").append($modal);
    $modal.on("click", function(e) {
      if (e.target === this) {
        (0, import_cash_dom.default)(this).remove();
        jsonModalOpen = false;
      }
    });
    const escapeHandler = (e) => {
      if (e.key === "Escape" && jsonModalOpen) {
        $modal.remove();
        jsonModalOpen = false;
        (0, import_cash_dom.default)(document).off("keydown", escapeHandler);
      }
    };
    (0, import_cash_dom.default)(document).on("keydown", escapeHandler);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
/*! Bundled license information:

lodash-es/lodash.js:
  (**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   *)
*/
