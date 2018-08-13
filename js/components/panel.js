(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.url = this.prop(props.url);
    this.top = this.prop(props.top);
    this.visible = this.prop(false);
    this.paddingTop = this.prop(12);
    this.paddingBottom = this.prop(12);
    this.content = new Panel.Content({ element: this.findElement('.panel-content') });
  });

  Panel.prototype.height = function() {
    return this.content.height();
  };

  Panel.prototype.bottom = function() {
    return this.top() + this.paddingTop() + this.height() + this.paddingBottom();
  };

  Panel.prototype.scrollLeft = function(value) {
    return this.content.scrollLeft(value);
  };

  Panel.prototype.move = function(dx) {
    this.scrollLeft(this.scrollLeft() - dx);
  };

  Panel.prototype.load = function() {
    return this.content.load(this.url()).then(function() {
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

  Panel.Content = (function() {
    var Content = jCore.Component.inherits(function() {
      this.height = this.prop(0);
      this.scrollLeft = this.prop(0);
    });

    Content.prototype.load = function(url) {
      return new Promise(function(resolve) {
        dom.once(this.element(), 'load', function() {
          this.height(dom.contentHeight(this.element()));
          this.scrollLeft(dom.scrollX(this.element()));
          dom.css(this.element(), { height: this.height() + 'px' });
          return resolve();
        }.bind(this));
        dom.attr(this.element(), { src: url });
      }.bind(this));
    };

    Content.prototype.onredraw = function() {
      this.redrawBy('scrollLeft', function(scrollLeft) {
        dom.scrollTo(this.element(), scrollLeft, 0);
      });
    };

    return Content;
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Panel;
  } else {
    app.Panel = Panel;
  }
})(this.app || (this.app = {}));
