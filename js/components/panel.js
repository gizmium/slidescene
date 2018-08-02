(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.url = this.prop(props.url);
    this.top = this.prop(props.top);
    this.height = this.prop(props.height);
    this.visible = this.prop(false);
    this.marginTop = this.prop(24);
  });

  Panel.prototype.load = function() {
    return dom.ajax({ type: 'GET', url: this.url() }).then(function(text) {
      dom.html(this.findElement('.panel-content'), text);
      return this;
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
  };

  Panel.HTML_TEXT = [
    '<div class="panel">',
      '<div class="panel-content"></div>',
    '</div>',
  ].join('');

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Panel;
  } else {
    app.Panel = Panel;
  }
})(this.app || (this.app = {}));
