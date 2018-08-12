(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.url = this.prop(props.url);
    this.top = this.prop(props.top);
    this.visible = this.prop(false);
    this.content = new Panel.Content({ element: this.findElement('.panel-content') });
  });

  Panel.prototype.height = function() {
    return this.content.height();
  };

  Panel.prototype.bottom = function() {
    return this.top() + this.height();
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
  };

  Panel.HTML_TEXT = [
    '<div class="panel">',
      '<iframe class="panel-content" scrolling="no"></iframe>',
    '</div>',
  ].join('');

  Panel.Content = (function() {
    var Content = jCore.Component.inherits(function() {
      this.height = this.prop(0);
    });

    Content.prototype.load = function(url) {
      return new Promise(function(resolve) {
        dom.once(this.element(), 'load', function() {
          this.height(dom.contentHeight(this.element()));
          dom.css(this.element(), { height: this.height() + 'px' });
          return resolve();
        }.bind(this));
        dom.attr(this.element(), { src: url });
      }.bind(this));
    };

    return Content;
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Panel;
  } else {
    app.Panel = Panel;
  }
})(this.app || (this.app = {}));
