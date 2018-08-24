(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');

  var Button = jCore.Component.inherits(function() {
    this.disabled = this.prop(false);
    this.draggable = new Button.Draggable(this);
  });

  Button.prototype.oninit = function() {
    this.draggable.enable();
  };

  Button.prototype.onredraw = function() {
    this.redrawBy('disabled', function(disabled) {
      dom.toggleClass(this.element(), 'disabled', disabled);
    });
  };

  Button.Draggable = (function() {
    var Draggable = jCore.Draggable.inherits();

    Draggable.prototype.onstart = function(button, x, y, event, context) {
      context.target = dom.target(event);
      dom.cancel(event);
    };

    Draggable.prototype.onend = function(button, dx, dy, event, context) {
      if (dom.target(event) === context.target) {
        button.emit('tap');
      }
    };

    return Draggable;
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Button;
  } else {
    app.Button = Button;
  }
})(this.app || (this.app = {}));
