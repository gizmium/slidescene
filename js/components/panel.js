(function(app) {
  'use strict';

  var jCore = require('jcore');
  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.url = this.prop(props.url);
    this.top = this.prop(props.top);
    this.visible = this.prop(false);
    this.paddingTop = this.prop(12);
    this.paddingBottom = this.prop(12);
    this.content = new Panel.Content({ element: this.findElement('.panel-content') });
  });

  Panel.prototype.bottom = function() {
    return this.top() + this.paddingTop() + this.content.height() + this.paddingBottom();
  };

  Panel.prototype.left = function() {
    return -this.content.scrollLeft() % this.content.offsetWidth();
  };

  Panel.prototype.right = function() {
    return this.left() + this.content.offsetWidth();
  };

  Panel.prototype.move = function(dx) {
    this.content.move(dx);
  };

  Panel.prototype.moveWithAnimation = function(dx) {
    this.content.moveWithAnimation(dx);
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
      '<div class="panel-button-left panel-button"></div>',
      '<div class="panel-button-right panel-button"></div>',
    '</div>',
  ].join('');

  Panel.Content = (function() {
    var Content = jCore.Component.inherits(function() {
      this.width = this.prop(0);
      this.offsetWidth = this.prop(0);
      this.height = this.prop(0);
      this.scrollLeft = this.prop(0);
      this.moveWithAnimation = this.prop(0);
    });

    Content.prototype.move = function(dx) {
      var scrollLeft = helper.clamp(this.scrollLeft() - dx, 0, this.width() - this.offsetWidth());
      this.scrollLeft(scrollLeft);
    };

    Content.prototype.load = function(url) {
      return new Promise(function(resolve) {
        dom.once(this.element(), 'load', function() {
          this.width(dom.contentWidth(this.element()));
          this.offsetWidth(dom.offsetWidth(this.element()));
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

      this.redrawBy('moveWithAnimation', function(rest) {
        if (rest === 0) {
          return;
        }
        if (!dom.hasContent(this.element())) {
          this.moveWithAnimation(0);
          return;
        }
        var dx = (rest > 0 ? 1 : -1) * Math.min(Math.abs(rest), 24);
        this.move(dx);
        this.redraw();
        setTimeout(function() {
          this.moveWithAnimation(rest - dx);
        }.bind(this));
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
