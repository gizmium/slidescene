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
    dom.on(this.element(), 'wheel', this.onwheel.bind(this));
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

  Main.prototype.onwheel = (function() {
    var context = {};
    var dy = 0;
    var isStart = false;
    var timeoutID = 0;
    return function(event) {
      if (!isStart) {
        this.content.draggable.onstart(this.content, 0, -1, event, context);
        isStart = true;
      }
      dy -= dom.deltaY(event);
      this.content.draggable.onmove(this.content, 0, dy, event, context);
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      timeoutID = setTimeout(function() {
        this.content.draggable.onend(this.content, 0, dy, event, context);
        dy = 0;
        isStart = false;
        timeoutID = 0;
      }.bind(this), 100);
    };
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Main;
  } else {
    app.Main = Main;
  }
})(this.app || (this.app = {}));
