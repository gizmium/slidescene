(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');
  var Content = app.Content || require('./content.js');
  var Controls = app.Controls || require('./controls.js');

  var Main = jCore.Component.inherits(function() {
    this.content = new Content({ element: this.findElement('.content') });
    this.controls = new Controls({ element: this.findElement('.controls') });
  });

  Main.prototype.oninit = function() {
    dom.on(this.element(), 'keydown', this.onkeydown.bind(this));
  };

  Main.prototype.onkeydown = (function() {
    var map = {
      38: 'up',
      40: 'down',
    };
    return function(event) {
      var key = map[dom.which(event)];
      if (key) {
        this['on' + key](event);
      }
    };
  })();

  Main.prototype.onup = function(event) {
    dom.cancel(event);
    this.content.moveUp();
  };

  Main.prototype.ondown = function(event) {
    dom.cancel(event);
    this.content.moveDown();
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Main;
  } else {
    app.Main = Main;
  }
})(this.app || (this.app = {}));
