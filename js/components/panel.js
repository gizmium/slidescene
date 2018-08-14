(function(app) {
  'use strict';

  var jCore = require('jcore');
  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.url = this.prop(props.url);
    this.top = this.prop(props.top);
    this.visible = this.prop(false);
    this.width = this.prop(624);
    this.paddingTop = this.prop(12);
    this.paddingBottom = this.prop(12);
    this.moveWithAnimation = this.prop(0);
    this.content = new Panel.Content({ element: this.findElement('.panel-content') });
  });

  Panel.prototype.height = function() {
    return this.content.height();
  };

  Panel.prototype.bottom = function() {
    return this.top() + this.paddingTop() + this.height() + this.paddingBottom();
  };

  Panel.prototype.scrollLeft = function(value) {
    if (typeof value === 'undefined') {
      return this.content.scrollLeft();
    }
    this.content.scrollLeft(helper.clamp(value, 0, this.content.width() - this.width()));
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

    this.redrawBy('moveWithAnimation', function(rest) {
      if (rest === 0) {
        return;
      }
      if (!this.content.hasContent()) {
        this.moveWithAnimation(0);
        return;
      }
      var dx = (rest > 0 ? 1 : -1) * Math.min(Math.abs(rest), 24);
      this.move(dx);
      this.content.redraw();
      setTimeout(function() {
        this.moveWithAnimation(rest - dx);
      }.bind(this));
    });
  };

  Panel.HTML_TEXT = [
    '<div class="panel">',
      '<iframe class="panel-content" scrolling="no"></iframe>',
      '<div class="panel-controls">',
        '<div class="panel-left-button panel-controls-item hide"></div>',
        '<div class="panel-right-button panel-controls-item hide"></div>',
      '</div>',
    '</div>',
  ].join('');

  Panel.Content = (function() {
    var Content = jCore.Component.inherits(function() {
      this.width = this.prop(0);
      this.height = this.prop(0);
      this.scrollLeft = this.prop(0);
    });

    Content.prototype.hasContent = function() {
      return dom.hasContent(this.element());
    };

    Content.prototype.load = function(url) {
      return new Promise(function(resolve) {
        dom.once(this.element(), 'load', function() {
          this.width(dom.contentWidth(this.element()));
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
