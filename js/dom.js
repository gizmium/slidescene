(function(app) {
  'use strict';

  var dom = {};

  dom.body = function() {
    return document.body;
  };

  dom.render = function(s) {
    var el = document.createRange().createContextualFragment(s).firstChild;
    el.parentNode.removeChild(el);
    return el;
  };

  dom.children = function(el) {
    return Array.prototype.slice.call(el.children);
  };

  dom.append = function(parent, child) {
    parent.appendChild(child);
  };

  dom.attr = function(el, props) {
    Object.keys(props).forEach(function(key) {
      el.setAttribute(key, props[key]);
    });
  };

  dom.css = function(el, props) {
    var style = el.style;
    Object.keys(props).forEach(function(key) {
      style[key] = props[key];
    });
  };

  dom.toggleClass = function(el, className, force) {
    if (force) {
      el.classList.add(className);
    } else {
      el.classList.remove(className);
    }
  };

  dom.data = function(el, key, value) {
    el.dataset[key] = value;
  };

  dom.offsetHeight = function(el) {
    return el.offsetHeight;
  };

  dom.transform = function(el, value) {
    dom.css(el, {
      transform: value,
      webkitTransform: value,
    });
  };

  dom.translateX = function(el, x) {
    dom.transform(el, 'translateX(' + x + 'px)');
  };

  dom.translateY = function(el, y) {
    dom.transform(el, 'translateY(' + y + 'px)');
  };

  dom.contentWindow = function(iframe) {
    return iframe.contentWindow;
  };

  dom.contentWidth = function(iframe) {
    return iframe.contentDocument.documentElement.scrollWidth;
  };

  dom.contentHeight = function(iframe) {
    return iframe.contentDocument.documentElement.scrollHeight;
  };

  dom.on = function(el, type, listener, useCapture) {
    el.addEventListener(type, listener, !!useCapture);
  };

  dom.off = function(el, type, listener, useCapture) {
    el.removeEventListener(type, listener, !!useCapture);
  };

  dom.once = function(el, type, listener, useCapture) {
    var wrapper = function() {
      dom.off(el, type, wrapper, useCapture);
      listener.apply(null, arguments);
    };
    dom.on(el, type, wrapper, useCapture);
  };

  dom.supportsTouch = function() {
    return ('createTouch' in document);
  };

  dom.changedTouch = function(event) {
    return (dom.supportsTouch() && 'changedTouches' in event ? event.changedTouches[0] : null);
  };

  dom.target = function(event) {
    var touch = dom.changedTouch(event);
    return (touch ? document.elementFromPoint(touch.clientX, touch.clientY) : event.target);
  };

  dom.cancel = function(event) {
    event.preventDefault();
  };

  dom.which = function(event) {
    return event.which;
  };

  dom.deltaY = function(event) {
    return event.deltaY;
  };

  dom.load = function(key, defaultValue) {
    return JSON.parse(sessionStorage.getItem(key)) || defaultValue;
  };

  dom.save = function(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = dom;
  } else {
    app.dom = dom;
  }
})(this.app || (this.app = {}));
