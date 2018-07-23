(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.url = this.prop(props.url);
    this.top = this.prop(props.top);
    this.height = this.prop(props.height);
    this.hasBorder = this.prop(props.border !== false);
  });

  Panel.prototype.load = function() {
    return dom.ajax({ type: 'GET', url: this.url() }).then(function(text) {
      dom.html(this.findElement('.panel-content'), text);
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

    this.redrawBy('hasBorder', function(hasBorder) {
      dom.toggleClass(this.element(), 'no-border', !hasBorder);
    });
  };

  Panel.HTML_TEXT = [
    '<div class="panel hide">',
      '<div class="panel-content"></div>',
    '</div>',
  ].join('');

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Panel;
  } else {
    app.Panel = Panel;
  }
})(this.app || (this.app = {}));
