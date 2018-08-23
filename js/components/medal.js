(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');

  var Medal = jCore.Component.inherits(function() {
    this.name = this.prop('');
  });

  Medal.prototype.change = function(name) {
    if (name === this.name()) {
      return Promise.resolve();
    }
    this.name(name);
    return new Promise(function(resolve) {
      var children = dom.children(this.element());
      var src = 'medals/' + this.name() + '.svg';
      var onfailed = function() {
        src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==';
        dom.attr(children[0], { src: src });
      };
      dom.once(children[0], 'load', function() {
        dom.off(children[0], 'error', onfailed);
        dom.off(children[0], 'abort', onfailed);
        dom.once(this.element(), 'transitionend', function() {
          dom.append(this.element(), children[0]);
          dom.attr(children[1], { src: src });
          dom.css(this.element(), { 'background-image': 'url("' + src + '")' });
          resolve();
        }.bind(this));
        dom.toggleClass(children[0], 'hide', false);
        dom.toggleClass(children[1], 'hide', true);
      }.bind(this));
      dom.on(children[0], 'error', onfailed);
      dom.on(children[0], 'abort', onfailed);
      dom.attr(children[0], { src: src });
    }.bind(this));
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Medal;
  } else {
    app.Medal = Medal;
  }
})(this.app || (this.app = {}));
