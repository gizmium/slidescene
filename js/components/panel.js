(function(app) {
  'use strict';

  var jCore = require('jcore');
  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Button = app.Button || require('./button.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.width = this.prop(624);
    this.top = this.prop(props.top);
    this.paddingTop = this.prop(12);
    this.paddingBottom = this.prop(12);
    this.visible = this.prop(false);
    this.url = this.prop('');
    this.content = new Panel.Content({ element: this.findElement('.panel-content') });
    this.leftButton = new Button({ element: this.findElement('.panel-button-left') });
    this.rightButton = new Button({ element: this.findElement('.panel-button-right') });
    this.previous = props.previous;
  });

  Panel.prototype.height = function() {
    return this.paddingTop() + this.content.height() + this.paddingBottom();
  };

  Panel.prototype.bottom = function() {
    return this.top() + this.height();
  };

  Panel.prototype.left = function() {
    return -this.content.scrollLeft() % this.width();
  };

  Panel.prototype.right = function() {
    return this.left() + this.width();
  };

  Panel.prototype.medalIndex = function() {
    return Math.round(this.content.scrollLeft() / this.width());
  };

  Panel.prototype.medal = function() {
    return this.content.medal(this.medalIndex());
  };

  Panel.prototype.next = function() {
    return this.content.next(this.medalIndex());
  };

  Panel.prototype.sound = function() {
    return this.content.sound();
  };

  Panel.prototype.load = function(url, medal) {
    this.url(url);
    return this.content.load(url).then(function() {
      var index = (medal ? this.content.indexOf(medal) : 0);
      this.content.scrollLeft(this.width() * index);
      return this;
    }.bind(this));
  };

  Panel.prototype.scroll = function(dx) {
    var scrollLeft = helper.clamp(this.content.scrollLeft() - dx, 0, this.content.width() - this.width());
    this.content.scrollLeft(scrollLeft);
  };

  Panel.prototype.scrollWithAnimation = function(dx) {
    this.content.scrollWithAnimation(dx);
  };

  Panel.prototype.canScrollToLeft = function() {
    return (this.content.scrollLeft() > 0);
  };

  Panel.prototype.canScrollToRight = function() {
    return (this.content.scrollLeft() < (this.content.width() - this.width()));
  };

  Panel.prototype.scrollToLeft = function() {
    this.scrollWithAnimation(-this.left() || this.width());
  };

  Panel.prototype.scrollToRight = function() {
    this.scrollWithAnimation(-this.right() || -this.width());
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

    this.redrawBy('paddingTop', function(paddingTop) {
      dom.css(this.element(), { 'padding-top': paddingTop + 'px' });
    });

    this.redrawBy('paddingBottom', function(paddingBottom) {
      dom.css(this.element(), { 'padding-bottom': paddingBottom + 'px' });
    });

    this.redrawBy('visible', function(visible) {
      dom.toggleClass(this.element(), 'hide', !visible);
    });
  };

  Panel.prototype.onscroll = function() {
    this.leftButton.disabled(!this.canScrollToLeft());
    this.rightButton.disabled(!this.canScrollToRight());
  };

  Panel.prototype.onanimationend = function() {
    if (this.content.scrollLeft() % this.width() === 0) {
      this.emit('animationend', this);
    }
  };

  Panel.prototype.onleft = function() {
    if (this.canScrollToLeft()) {
      this.scrollToLeft();

      // XXX: start scrolling not to be interrupted by dragging content
      this.content.redraw();
    }
  };

  Panel.prototype.onright = function() {
    if (this.canScrollToRight()) {
      this.scrollToRight();

      // XXX: start scrolling not to be interrupted by dragging content
      this.content.redraw();
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
      this.height = this.prop(0);
      this.scrollLeft = this.prop(-1);
      this.scrollWithAnimation = this.prop(0);
      this.module = null;
    });

    Content.prototype.indexOf = function(medal) {
      return (this.module ? this.module.medals.indexOf(medal) : -1);
    };

    Content.prototype.medal = function(index) {
      return (this.module ? this.module.medals[index] : '');
    };

    Content.prototype.next = function(index) {
      return (this.module ? this.module.nexts[index] : '');
    };

    Content.prototype.sound = function() {
      return (this.module ? this.module.sound : '');
    };

    Content.prototype.load = function(url) {
      return new Promise(function(resolve) {
        dom.once(this.element(), 'load', function() {
          resolve(dom.contentWindow(this.element()).scene.exports);
        }.bind(this));
        dom.attr(this.element(), { src: url });
      }.bind(this)).then(function(module) {
        this.width(dom.contentWidth(this.element()));
        this.height(dom.contentHeight(this.element()));

        // XXX: redraw once before acquiring module not to dispatch events for scrolling
        this.redraw();
        this.module = module;
      }.bind(this));
    };

    Content.prototype.onredraw = function() {
      this.redrawBy('width', 'height', function(width, height) {
        dom.css(this.element(), {
          height: height + 'px',
          width: width + 'px',
        });
      });

      this.redrawBy('scrollLeft', function(scrollLeft) {
        if (!this.module) {
          return;
        }
        this.onscroll(scrollLeft);
      });

      this.redrawBy('scrollWithAnimation', function(rest) {
        if (!this.module) {
          return;
        }
        if (rest === 0) {
          setTimeout(this.emit.bind(this), 0, 'animationend');
          return;
        }
        var dx = (rest > 0 ? 1 : -1) * Math.min(Math.abs(rest), 24);
        this.scrollLeft(this.scrollLeft() - dx);
        this.onscroll(this.scrollLeft());
        setTimeout(this.scrollWithAnimation.bind(this), 0, rest - dx);
      });
    };

    Content.prototype.onscroll = function(scrollLeft) {
      dom.translateX(this.element(), -scrollLeft);
      this.module.onscroll(scrollLeft);
      setTimeout(this.emit.bind(this), 0, 'scroll');
    };

    return Content;
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Panel;
  } else {
    app.Panel = Panel;
  }
})(this.app || (this.app = {}));
