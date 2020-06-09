;(function(global, factory) {
  'use strict'
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = global.document
      ? factory(global, true)
      : function(w) {
          if (!w.document) {
            throw new Error('fantast requires a window with a document')
          }
          return factory(w)
        }
  } else {
    factory(global)
  }
})(typeof window !== 'undefined' ? window : this, function(window, noGlobal) {
  'use strict'
  var fantast = {}
  var emptyArr = []
  var uniq
  var filter = emptyArr.filter

  var class2type = {}
  var classCache = {}
  var fragmentRE = /^\s*<(\w+|!)[^>]*>/
  var singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/
  var readyRE = (readyRE = /complete|loaded|interactive/)
  var tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi
  var simpleSelectorRE = /^[\w-]*$/
  var capitalRE = /([A-Z])/g
  var table = window.document.createElement('table')
  var tableRow = window.document.createElement('tr')
  var containers = {
    tr: window.document.createElement('tbody'),
    tbody: table,
    thead: table,
    tfoot: table,
    td: tableRow,
    th: tableRow,
    '*': window.document.createElement('div')
  }
  function h(selector, context) {
    return fantast.init(selector, context)
  }

  if (window.JSON) h.parseJSON = JSON.parse
  h.each = function(elements, callback) {
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false)
          return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false)
          return elements
    }

    return elements
  }

  h.map = function(elements, callback) {
    var value,
      values = [],
      i,
      key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  h.contains = document.documentElement.contains
    ? function(parent, node) {
        return parent !== node && parent.contains(node)
      }
    : function(parent, node) {
        while (node && (node = node.parentNode))
          if (node === parent) return true
        return false
      }
  function extend(target, source, deep) {
    for (var key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key])) target[key] = []
        extend(target[key], source[key], deep)
      } else if (source[key] !== undefined) target[key] = source[key]
  }
  h.extend = function(target) {
    var deep,
      args = emptyArr.slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg) {
      extend(target, arg, deep)
    })
    return target
  }
  // 滚动到顶部
  h.aniToTop = function() {
    // 距离顶部的位置
    var offset = document.body.scrollTop || document.documentElement.scrollTop
    // 初函数值
    var a = 2,
      x = 0,
      y = 0
    update()
    function update() {
      y = offset - a * Math.pow(x, 2)
      scrollTo(0, y)
      if (y <= 0) {
        cancelAnimationFrame(update)
        return
      }
      x++
      requestAnimationFrame(update)
    }
  }

  h.fn = {
    constructor: fantast.H,
    forEach: emptyArr.forEach,
    concat: function() {
      var i,
        value,
        args = []
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i]
        args[i] = fantast.isH(value) ? value.toArray() : value
      }
      return emptyArr.concat.apply(
        fantast.isH(this) ? this.toArray() : this,
        args
      )
    },
    size: function() {
      return this.length
    },
    get: function(idx) {
      return idx === undefined
        ? emptyArr.slice.call(this)
        : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function() {
      return this.get()
    },
    each: function(callback) {
      emptyArr.every.call(this, function(el, idx) {
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector) {
      if (isFunction(selector)) return this.not(this.not(selector))
      return h(
        filter.call(this, function(element) {
          return fantast.matches(element, selector)
        })
      )
    },
    is: function(selector) {
      return this.length > 0 && fantast.matches(this[0], selector)
    },
    add: function(selector, context) {
      return h(uniq(this.concat(h(selector, context))))
    },
    offset: function(coordinates) {
      if (coordinates)
        return this.each(function(index) {
          var $this = h(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top: coords.top - parentOffset.top,
              left: coords.left - parentOffset.left
            }

          if ($this.css('position') == 'static') props['position'] = 'relative'
          $this.css(props)
        })
      if (!this.length) return null
      if (
        document.documentElement !== this[0] &&
        !h.contains(document.documentElement, this[0])
      )
        return { top: 0, left: 0 }
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    not: function(selector) {
      var nodes = []
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx) {
          if (!selector.call(this, idx)) nodes.push(this)
        })
      else {
        var excludes =
          typeof selector == 'string'
            ? this.filter(selector)
            : likeArray(selector) && isFunction(selector.item)
            ? emptyArr.slice.call(selector)
            : h(selector)
        this.forEach(function(el) {
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return h(nodes)
    },
    remove() {
      return this.each(function() {
        if (this.parentNode != null) this.parentNode.removeChild(this)
      })
    },
    css: function(property, value) {
      if (arguments.length < 2) {
        var element = this[0]
        if (typeof property == 'string') {
          if (!element) return
          return (
            element.style[camelize(property)] ||
            getComputedStyle(element, '').getPropertyValue(property)
          )
        } else if (isArray(property)) {
          if (!element) return
          var props = {}
          var computedStyle = getComputedStyle(element, '')
          h.each(property, function(_, prop) {
            props[prop] =
              element.style[camelize(prop)] ||
              computedStyle.getPropertyValue(prop)
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function() {
            this.style.removeProperty(dasherize(property))
          })
        else css = dasherize(property) + ':' + maybeAddPx(property, value)
      } else {
        for (var key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function() {
              this.style.removeProperty(dasherize(key))
            })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function() {
        this.style.cssText += ';' + css
      })
    },
    hasClass: function(name) {
      if (!name) return false
      return emptyArr.some.call(
        this,
        function(el) {
          return this.test(className(el))
        },
        classRE(name)
      )
    },
    addClass: function(name) {
      if (!name) return this
      return this.each(function(idx) {
        if (!('className' in this)) return
        var classList = []
        var cls = className(this),
          newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass) {
          if (!h(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length &&
          className(this, cls + (cls ? ' ' : '') + classList.join(' '))
      })
    },
    removeClass: function(name) {
      return this.each(function(idx) {
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList)
          .split(/\s+/g)
          .forEach(function(klass) {
            classList = classList.replace(classRE(klass), ' ')
          })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when) {
      if (!name) return this
      return this.each(function(idx) {
        var $this = $(this),
          names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass) {
          ;(when === undefined
          ? !$this.hasClass(klass)
          : when)
            ? $this.addClass(klass)
            : $this.removeClass(klass)
        })
      })
    },
    prev: function(selector) {
      return h(this.pluck('previousElementSibling')).filter(selector || '*')
    },
    next: function(selector) {
      return h(this.pluck('nextElementSibling')).filter(selector || '*')
    },
    html: function(html) {
      return 0 in arguments
        ? this.each(function(idx) {
            var originHtml = this.innerHTML
            h(this)
              .empty()
              .append(funcArg(this, html, idx, originHtml))
          })
        : 0 in this
        ? this[0].innerHTML
        : null
    },
    text: function(text) {
      return 0 in arguments
        ? this.each(function(idx) {
            var newText = funcArg(this, text, idx, this.textContent)
            this.textContent = newText == null ? '' : '' + newText
          })
        : 0 in this
        ? this.pluck('textContent').join('')
        : null
    },
    attr: function(name, value) {
      var result
      return typeof name == 'string' && !(1 in arguments)
        ? 0 in this &&
          this[0].nodeType == 1 &&
          (result = this[0].getAttribute(name)) != null
          ? result
          : undefined
        : this.each(function(idx) {
            if (this.nodeType !== 1) return
            if (isObject(name))
              for (var key in name) setAttribute(this, key, name[key])
            else
              setAttribute(
                this,
                name,
                funcArg(this, value, idx, this.getAttribute(name))
              )
          })
    },
    removeAttr: function(name) {
      return this.each(function() {
        this.nodeType === 1 &&
          name.split(' ').forEach(function(attribute) {
            setAttribute(this, attribute)
          }, this)
      })
    },
    data: function(name, value) {
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data =
        1 in arguments ? this.attr(attrName, value) : this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    empty: function() {
      return this.each(function() {
        this.innerHTML = ''
      })
    },
    pluck: function(property) {
      return h.map(this, function(el) {
        return el[property]
      })
    },
    val: function(value) {
      if (0 in arguments) {
        if (value == null) value = ''
        return this.each(function(idx) {
          this.value = funcArg(this, value, idx, this.value)
        })
      } else {
        return (
          this[0] &&
          (this[0].multiple
            ? h(this[0])
                .find('option')
                .filter(function() {
                  return this.selected
                })
                .pluck('value')
            : this[0].value)
        )
      }
    },
    closest: function(selector, context) {
      var nodes = [],
        collection = typeof selector == 'object' && $(selector)
      this.each(function(_, node) {
        while (
          node &&
          !(collection
            ? collection.indexOf(node) >= 0
            : fantast.matches(node, selector))
        )
          node = node !== context && !isDocument(node) && node.parentNode
        if (node && nodes.indexOf(node) < 0) nodes.push(node)
      })
      return h(nodes)
    },
    ready: function(callback) {
      // 检查是否document ready的状态和document.body是否存在
      if (readyRE.test(document.readyState) && document.body) callback(this)
      else
        document.addEventListener(
          'DOMContentLoaded',
          function() {
            callback(this)
          },
          false
        )
      return this
    },
    find: function(selector) {
      var result,
        $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = h(selector).filter(function() {
          var node = this
          return emptyArr.some.call($this, function(parent) {
            return h.contains(parent, node)
          })
        })
      else if (this.length == 1) result = h(fantast.qsa(this[0], selector))
      else
        result = this.map(function() {
          return fantast.qsa(this, selector)
        })
      return result
    }
  }

  function H(dom, selector) {
    var i,
      len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
  }

  fantast.H = function(dom, context) {
    return new H(dom, context)
  }
  fantast.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector =
      element.matches ||
      element.webkitMatchesSelector ||
      element.mozMatchesSelector ||
      element.oMatchesSelector ||
      element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match,
      parent = element.parentNode,
      temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~fantast.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    console.log('match', match)

    return match
  }

  fantast.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = h(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, '<$1></$2>')
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = h.each(emptyArr.slice.call(container.childNodes), function() {
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = h(dom)
      h.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  fantast.qsa = function(element, selector) {
    var found,
      maybeID = selector[0] == '#',
      maybeClass = !maybeID && selector[0] == '.',
      nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
      isSimple = simpleSelectorRE.test(nameOnly)
    return element.getElementById && isSimple && maybeID // Safari DocumentFragment doesn't have getElementById
      ? (found = element.getElementById(nameOnly))
        ? [found]
        : []
      : element.nodeType !== 1 &&
        element.nodeType !== 9 &&
        element.nodeType !== 11
      ? []
      : emptyArr.slice.call(
          isSimple && !maybeID && element.getElementsByClassName // DocumentFragment doesn't have getElementsByClassName/TagName
            ? maybeClass
              ? element.getElementsByClassName(nameOnly) // If it's simple, it could be a class
              : element.getElementsByTagName(selector) // Or a tag
            : element.querySelectorAll(selector) // Or it's not simple, and we need to query all
        )
  }
  fantast.isH = function(object) {
    return object instanceof fantast.H
  }
  fantast.init = function(selector, context) {
    var dom
    // 不传值的情况
    if (!selector) return fantast.H()
    // 对字符串的selector进行优化
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // 判断是否是以<开头
      if (selector[0] == '<' && fragmentRE.test(selector))
        (dom = fantast.fragment(selector, RegExp.$1, context)),
          (selector = null)
      // 是否有context,有就继续查找
      else if (context !== undefined) return h(context).find(selector)
      // 如果是css 选择器,使用它去选中节点
      else dom = fantast.qsa(document, selector)
    }
    // 如果是方法,待dom ready之后执行
    else if (isFunction(selector)) {
      console.log('comehere', 'coms')

      return h(document).ready(selector)
    }
    // 如果是H的实例就返回
    else if (fantast.isH(selector)) return selector
    else {
      // 如果是数组,返回一个过滤完空的数组
      if (isArray(selector)) dom = compact(selector)
      // dom对象直接使用数组包裹返回
      else if (isObject(selector)) (dom = [selector]), (selector = null)
      // 如果是html字符串,创建dom
      else if (fragmentRE.test(selector))
        (dom = fantast.fragment(selector.trim(), RegExp.$1, context)),
          (selector = null)
      // 如果有上下文对象,在上下文对象中继续查找
      else if (context !== undefined) return h(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      // 最重要的,如果是css的选择器,直接使用查找nodes
      else dom = fantast.qsa(document, selector)
    }
    // 从查找到的dom中创建一个new H 集合
    return fantast.H(dom, selector)
  }

  // 数组中去掉为null的
  function compact(array) {
    return emptyArr.filter.call(array, function(item) {
      return item != null
    })
  }

  'Boolean Number String Function Array Date RegExp Object Error'
    .split(' ')
    .forEach(function(name) {
      class2type['[object ' + name + ']'] = name.toLowerCase()
    })
  function type(obj) {
    return obj == null
      ? String(obj)
      : class2type[toString.call(obj)] || 'object'
  }

  function isArray(val) {
    return type(val) === 'array'
  }
  function isObject(val) {
    return type(val) === 'object'
  }
  function isWindow(obj) {
    return obj != null && obj == obj.window
  }
  function isPlainObject(obj) {
    return (
      isObject(obj) &&
      !isWindow(obj) &&
      Object.getPrototypeOf(obj) == Object.prototype
    )
  }
  function isFunction(val) {
    return type(val) === 'function'
  }

  function isWindow(obj) {
    return obj != null && obj == obj.window
  }
  // 属性变驼峰
  function camelize(str) {
    return str.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : ''
    })
  }

  // 驼峰变css属性
  function dasherize(str) {
    return str
      .replace(/::/g, '/')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .replace(/([a-z\d])([A-Z])/g, '$1_$2')
      .replace(/_/g, '-')
      .toLowerCase()
  }

  function classRE(name) {
    return name in classCache
      ? classCache[name]
      : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }
  // access className property while respecting SVGAnimatedString
  function className(node, value) {
    var klass = node.className || '',
      svg = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  var cssNumber = {
    'column-count': 1,
    columns: 1,
    'font-weight': 1,
    'line-height': 1,
    opacity: 1,
    'z-index': 1,
    zoom: 1
  }
  // 添加px,不包含上面声明的cssNumber
  function maybeAddPx(name, value) {
    return typeof value == 'number' && !cssNumber[dasherize(name)]
      ? value + 'px'
      : value
  }

  // 判断是否是类数组
  function likeArray(obj) {
    var length = !!obj && 'length' in obj && obj.length,
      type = h.type(obj)

    return (
      'function' != type &&
      !isWindow(obj) &&
      ('array' == type ||
        length === 0 ||
        (typeof length == 'number' && length > 0 && length - 1 in obj))
    )
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self

  function deserializeValue(value) {
    try {
      return value
        ? value == 'true' ||
            (value == 'false'
              ? false
              : value == 'null'
              ? null
              : +value + '' == value
              ? +value
              : /^[\[\{]/.test(value)
              ? h.parseJSON(value)
              : value)
        : value
    } catch (e) {
      return value
    }
  }
  var adjacencyOperators = ['after', 'prepend', 'before', 'append']
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    h.fn[operator] = function() {
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType
      var nodes = h.map(arguments, function(arg) {
          var arr = []
          argType = type(arg)
          if (argType == 'array') {
            arg.forEach(function(el) {
              if (el.nodeType !== undefined) return arr.push(el)
              else if (fantast.isH(el)) return (arr = arr.concat(el.get()))
              arr = arr.concat(fantast.fragment(el))
            })
            return arr
          }
          return argType == 'object' || arg == null
            ? arg
            : fantast.fragment(arg)
        }),
        parent,
        copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target) {
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target =
          operatorIndex == 0
            ? target.nextSibling
            : operatorIndex == 1
            ? target.firstChild
            : operatorIndex == 2
            ? target
            : null

        var parentInDocument = h.contains(document.documentElement, parent)

        nodes.forEach(function(node) {
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return h(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument)
            traverseNode(node, function(el) {
              if (
                el.nodeName != null &&
                el.nodeName.toUpperCase() === 'SCRIPT' &&
                (!el.type || el.type === 'text/javascript') &&
                !el.src
              ) {
                var target = el.ownerDocument
                  ? el.ownerDocument.defaultView
                  : window
                target['eval'].call(target, el.innerHTML)
              }
            })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    h.fn[
      inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')
    ] = function(html) {
      h(html)[operator](this)
      return this
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  function flatten(array) {
    return array.length > 0 ? emptyArr.concat.apply([], array) : array
  }
  uniq = function(array) {
    return filter.call(array, function(item, idx) {
      return array.indexOf(item) == idx
    })
  }
  h.type = type
  h.isFunction = isFunction
  h.isWindow = isWindow
  h.isArray = isArray

  fantast.H.prototype = H.prototype = h.fn
  ;(function($) {
    var _zid = 1,
      undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj) {
        return typeof obj == 'string'
      },
      handlers = {},
      specialEvents = {},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove =
      'MouseEvents'

    function zid(element) {
      return element._zid || (element._zid = _zid++)
    }
    function findHandlers(element, event, fn, selector) {
      event = parse(event)
      if (event.ns) var matcher = matcherFor(event.ns)
      return (handlers[zid(element)] || []).filter(function(handler) {
        return (
          handler &&
          (!event.e || handler.e == event.e) &&
          (!event.ns || matcher.test(handler.ns)) &&
          (!fn || zid(handler.fn) === zid(fn)) &&
          (!selector || handler.sel == selector)
        )
      })
    }
    function parse(event) {
      var parts = ('' + event).split('.')
      return {
        e: parts[0],
        ns: parts
          .slice(1)
          .sort()
          .join(' ')
      }
    }
    function matcherFor(ns) {
      return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
    }

    function eventCapture(handler, captureSetting) {
      return (
        (handler.del && !focusinSupported && handler.e in focus) ||
        !!captureSetting
      )
    }

    function realEvent(type) {
      return hover[type] || (focusinSupported && focus[type]) || type
    }

    function add(element, events, fn, data, selector, delegator, capture) {
      var id = zid(element),
        set = handlers[id] || (handlers[id] = [])
      events.split(/\s/).forEach(function(event) {
        if (event == 'ready') return $(document).ready(fn)
        var handler = parse(event)
        handler.fn = fn
        handler.sel = selector
        // emulate mouseenter, mouseleave
        if (handler.e in hover)
          fn = function(e) {
            var related = e.relatedTarget
            if (!related || (related !== this && !$.contains(this, related)))
              return handler.fn.apply(this, arguments)
          }
        handler.del = delegator
        var callback = delegator || fn
        handler.proxy = function(e) {
          e = compatible(e)
          if (e.isImmediatePropagationStopped()) return
          e.data = data
          var result = callback.apply(
            element,
            e._args == undefined ? [e] : [e].concat(e._args)
          )
          if (result === false) e.preventDefault(), e.stopPropagation()
          return result
        }
        handler.i = set.length
        set.push(handler)
        if ('addEventListener' in element)
          element.addEventListener(
            realEvent(handler.e),
            handler.proxy,
            eventCapture(handler, capture)
          )
      })
    }
    function remove(element, events, fn, selector, capture) {
      var id = zid(element)
      ;(events || '').split(/\s/).forEach(function(event) {
        findHandlers(element, event, fn, selector).forEach(function(handler) {
          delete handlers[id][handler.i]
          if ('removeEventListener' in element)
            element.removeEventListener(
              realEvent(handler.e),
              handler.proxy,
              eventCapture(handler, capture)
            )
        })
      })
    }

    $.event = { add: add, remove: remove }

    $.proxy = function(fn, context) {
      var args = 2 in arguments && slice.call(arguments, 2)
      if (isFunction(fn)) {
        var proxyFn = function() {
          return fn.apply(
            context,
            args ? args.concat(slice.call(arguments)) : arguments
          )
        }
        proxyFn._zid = zid(fn)
        return proxyFn
      } else if (isString(context)) {
        if (args) {
          args.unshift(fn[context], fn)
          return $.proxy.apply(null, args)
        } else {
          return $.proxy(fn[context], fn)
        }
      } else {
        throw new TypeError('expected function')
      }
    }

    $.fn.bind = function(event, data, callback) {
      return this.on(event, data, callback)
    }
    $.fn.unbind = function(event, callback) {
      return this.off(event, callback)
    }
    $.fn.one = function(event, selector, data, callback) {
      return this.on(event, selector, data, callback, 1)
    }

    var returnTrue = function() {
        return true
      },
      returnFalse = function() {
        return false
      },
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

    function compatible(event, source) {
      if (source || !event.isDefaultPrevented) {
        source || (source = event)

        $.each(eventMethods, function(name, predicate) {
          var sourceMethod = source[name]
          event[name] = function() {
            this[predicate] = returnTrue
            return sourceMethod && sourceMethod.apply(source, arguments)
          }
          event[predicate] = returnFalse
        })

        event.timeStamp || (event.timeStamp = Date.now())

        if (
          source.defaultPrevented !== undefined
            ? source.defaultPrevented
            : 'returnValue' in source
            ? source.returnValue === false
            : source.getPreventDefault && source.getPreventDefault()
        )
          event.isDefaultPrevented = returnTrue
      }
      return event
    }

    function createProxy(event) {
      var key,
        proxy = { originalEvent: event }
      for (key in event)
        if (!ignoreProperties.test(key) && event[key] !== undefined)
          proxy[key] = event[key]

      return compatible(proxy, event)
    }

    $.fn.delegate = function(selector, event, callback) {
      return this.on(event, selector, callback)
    }
    $.fn.undelegate = function(selector, event, callback) {
      return this.off(event, selector, callback)
    }

    $.fn.live = function(event, callback) {
      $(document.body).delegate(this.selector, event, callback)
      return this
    }
    $.fn.die = function(event, callback) {
      $(document.body).undelegate(this.selector, event, callback)
      return this
    }

    $.fn.on = function(event, selector, data, callback, one) {
      var autoRemove,
        delegator,
        $this = this
      if (event && !isString(event)) {
        $.each(event, function(type, fn) {
          $this.on(type, selector, data, fn, one)
        })
        return $this
      }

      if (!isString(selector) && !isFunction(callback) && callback !== false)
        (callback = data), (data = selector), (selector = undefined)
      if (callback === undefined || data === false)
        (callback = data), (data = undefined)

      if (callback === false) callback = returnFalse

      return $this.each(function(_, element) {
        if (one)
          autoRemove = function(e) {
            remove(element, e.type, callback)
            return callback.apply(this, arguments)
          }

        if (selector)
          delegator = function(e) {
            var evt,
              match = $(e.target)
                .closest(selector, element)
                .get(0)
            if (match && match !== element) {
              evt = $.extend(createProxy(e), {
                currentTarget: match,
                liveFired: element
              })
              return (autoRemove || callback).apply(
                match,
                [evt].concat(slice.call(arguments, 1))
              )
            }
          }

        add(element, event, callback, data, selector, delegator || autoRemove)
      })
    }
    $.fn.off = function(event, selector, callback) {
      var $this = this
      if (event && !isString(event)) {
        $.each(event, function(type, fn) {
          $this.off(type, selector, fn)
        })
        return $this
      }

      if (!isString(selector) && !isFunction(callback) && callback !== false)
        (callback = selector), (selector = undefined)

      if (callback === false) callback = returnFalse

      return $this.each(function() {
        remove(this, event, callback, selector)
      })
    }

    $.fn.trigger = function(event, args) {
      event =
        isString(event) || $.isPlainObject(event)
          ? $.Event(event)
          : compatible(event)
      event._args = args
      return this.each(function() {
        // handle focus(), blur() by calling them directly
        if (event.type in focus && typeof this[event.type] == 'function')
          this[event.type]()
        // items in the collection might not be DOM elements
        else if ('dispatchEvent' in this) this.dispatchEvent(event)
        else $(this).triggerHandler(event, args)
      })
    }

    // triggers event handlers on current element just as if an event occurred,
    // doesn't trigger an actual event, doesn't bubble
    $.fn.triggerHandler = function(event, args) {
      var e, result
      this.each(function(i, element) {
        e = createProxy(isString(event) ? $.Event(event) : event)
        e._args = args
        e.target = element
        $.each(findHandlers(element, event.type || event), function(
          i,
          handler
        ) {
          result = handler.proxy(e)
          if (e.isImmediatePropagationStopped()) return false
        })
      })
      return result
    }

    // shortcut methods for `.bind(event, fn)` for each event type
    ;(
      'focusin focusout focus blur load resize scroll unload click dblclick ' +
      'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
      'change select keydown keypress keyup error'
    )
      .split(' ')
      .forEach(function(event) {
        $.fn[event] = function(callback) {
          return 0 in arguments
            ? this.bind(event, callback)
            : this.trigger(event)
        }
      })

    $.Event = function(type, props) {
      if (!isString(type)) (props = type), (type = props.type)
      var event = document.createEvent(specialEvents[type] || 'Events'),
        bubbles = true
      if (props)
        for (var name in props)
          name == 'bubbles'
            ? (bubbles = !!props[name])
            : (event[name] = props[name])
      event.initEvent(type, bubbles, true)
      return compatible(event)
    }
  })(h)
  window.fan = h
  return h
})
