(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');

  var Medal = jCore.Component.inherits(function() {
    this.name = this.prop('');
  });

  Medal.prototype.src = function() {
    return (this.name() ? 'medals/' + this.name() + '.svg' : Medal.SRC_EMPTY);
  };

  Medal.prototype.change = function(name) {
    this.name(name);
    return new Promise(function(resolve, reject) {
      var children = dom.children(this.element());
      var name = this.name();
      dom.once(children[0], 'load', function() {
        if (this.name() && name !== this.name()) {
          return reject();
        }
        dom.once(this.element(), 'transitionend', function() {
          if (this.name() && name !== this.name()) {
            return reject();
          }
          dom.append(this.element(), children[0]);
          dom.attr(children[1], { src: this.src() });
          dom.css(this.element(), { 'background-image': 'url("' + this.src() + '")' });
          resolve();
        }.bind(this));
        dom.toggleClass(children[0], 'hide', false);
        dom.toggleClass(children[1], 'hide', true);
      }.bind(this));
      dom.attr(children[0], { src: this.src() });
    }.bind(this));
  };

  Medal.prototype.oninit = function() {
    var onfailed = this.onfailed.bind(this);
    dom.children(this.element()).forEach(function(child) {
      dom.on(child, 'error', onfailed);
      dom.on(child, 'abort', onfailed);
    });
  };

  Medal.prototype.onfailed = function(event) {
    this.name('');
    dom.attr(dom.target(event), { src: this.src() });
  };

  Medal.SRC_EMPTY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWP49evXfwAJzgPuP0JMDwAAAABJRU5ErkJggg==';

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Medal;
  } else {
    app.Medal = Medal;
  }
})(this.app || (this.app = {}));
