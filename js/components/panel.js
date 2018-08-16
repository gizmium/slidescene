(function(app) {
  'use strict';

  var jCore = require('jcore');
  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Button = app.Button || require('./button.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.url = this.prop(props.url);
    this.top = this.prop(props.top);
    this.visible = this.prop(false);
    this.paddingTop = this.prop(12);
    this.paddingBottom = this.prop(12);
    this.content = new Panel.Content({ element: this.findElement('.panel-content') });
    this.leftButton = new Button({ element: this.findElement('.panel-button-left') });
    this.rightButton = new Button({ element: this.findElement('.panel-button-right') });
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

  Panel.prototype.scroll = function(dx) {
    this.content.scroll(dx);
  };

  Panel.prototype.scrollWithAnimation = function(dx) {
    this.content.scrollWithAnimation(dx);
  };

  Panel.prototype.scrollToLeft = function() {
    this.content.scrollToLeft();
  };

  Panel.prototype.scrollToRight = function() {
    this.content.scrollToRight();
  };

  Panel.prototype.load = function() {
    return this.content.load(this.url()).then(function() {
      return this;
    }.bind(this));
  };

  Panel.prototype.render = function() {
    return dom.render(Panel.HTML_TEXT);
  };

  Panel.prototype.onappend = function() {
    this.content.on('scroll', this.onscroll.bind(this));
    this.content.on('animationend', this.onanimationend.bind(this));
    this.leftButton.on('tap', this.onleft.bind(this));
    this.rightButton.on('tap', this.onright.bind(this));
  };

  Panel.prototype.onremove = function() {
    this.content.removeAllListeners();
    this.leftButton.removeAllListeners();
    this.rightButton.removeAllListeners();
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

  Panel.prototype.onscroll = function() {
    this.leftButton.disabled(!this.content.canScrollToLeft());
    this.rightButton.disabled(!this.content.canScrollToRight());
  };

  Panel.prototype.onanimationend = function() {
    this.emit('animationend');
  };

  Panel.prototype.onleft = function() {
    if (this.content.canScrollToLeft()) {
      this.content.scrollToLeft();
    }
  };

  Panel.prototype.onright = function() {
    if (this.content.canScrollToRight()) {
      this.content.scrollToRight();
    }
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
      this.scrollWithAnimation = this.prop(0);
    });

    Content.prototype.fragment = function() {
      return dom.fragment(this.element());
    };

    Content.prototype.canScrollToLeft = function() {
      return (this.scrollLeft() > 0);
    };

    Content.prototype.canScrollToRight = function() {
      return (this.scrollLeft() < (this.width() - this.offsetWidth()));
    };

    Content.prototype.scroll = function(dx) {
      var scrollLeft = helper.clamp(this.scrollLeft() - dx, 0, this.width() - this.offsetWidth());
      this.scrollLeft(scrollLeft);
      setTimeout(function() {
        this.emit('scroll');
      }.bind(this), 0);
    };

    Content.prototype.scrollToLeft = function() {
      setTimeout(function() {
        var left = this.scrollLeft() % this.offsetWidth();
        this.scrollWithAnimation(left !== 0 ? left : this.offsetWidth());
      }.bind(this), 0);
    };

    Content.prototype.scrollToRight = function() {
      setTimeout(function() {
        var right = this.offsetWidth() - this.scrollLeft() % this.offsetWidth();
        this.scrollWithAnimation(right !== 0 ? -right : -this.offsetWidth());
      }.bind(this), 0);
    };

    Content.prototype.load = function(url) {
      return new Promise(function(resolve) {
        dom.once(this.element(), 'load', function() {
          this.width(dom.contentWidth(this.element()));
          this.offsetWidth(dom.offsetWidth(this.element()));
          this.height(dom.contentHeight(this.element()));
          this.scrollLeft(dom.scrollX(this.element()));
          this.emit('scroll');
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

      this.redrawBy('scrollWithAnimation', function(rest) {
        if (rest === 0) {
          this.emit('animationend');
          return;
        }
        if (!dom.hasContent(this.element())) {
          this.scrollWithAnimation(0);
          return;
        }
        var dx = (rest > 0 ? 1 : -1) * Math.min(Math.abs(rest), 24);
        this.scroll(dx);
        this.redraw();
        setTimeout(function() {
          this.scrollWithAnimation(rest - dx);
          this.emit('scroll');
        }.bind(this), 0);
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
