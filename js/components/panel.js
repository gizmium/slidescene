(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.url = this.prop(props.url);
    this.top = this.prop(props.top);
    this.height = this.prop(props.height);
    this.visible = this.prop(false);
    this.paddingTop = this.prop(12);
    this.paddingBottom = this.prop(12);
  });

  Panel.prototype.bottom = function() {
    return this.top() + this.paddingTop() + this.height() + this.paddingBottom();
  };

  Panel.prototype.load = function() {
    return new Promise(function(resolve) {
      dom.attr(this.findElement('.panel-content'), { src: this.url() });
      return resolve(this);
    }.bind(this));
  };

  Panel.prototype.render = function() {
    return dom.render(Panel.HTML_TEXT);
  };

  Panel.prototype.onredraw = function() {
    this.redrawBy('top', function(top) {
      dom.translateY(this.element(), top);
    });

    this.redrawBy('height', function(height) {
      dom.css(this.element(), { height: height + 'px' });
    });

    this.redrawBy('visible', function(visible) {
      dom.toggleClass(this.element(), 'hide', !visible);
    });

    this.redrawBy('paddingTop', function(paddingTop) {
      dom.css(this.element(), { 'padding-top': paddingTop + 'px' });
    });

    this.redrawBy('paddingBottom', function(paddingBottom) {
      dom.css(this.element(), { 'padding-bottom': paddingBottom + 'px' });
    });
  };

  Panel.HTML_TEXT = [
    '<div class="panel">',
      '<iframe class="panel-content" scrolling="no"></iframe>',
    '</div>',
  ].join('');

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Panel;
  } else {
    app.Panel = Panel;
  }
})(this.app || (this.app = {}));
