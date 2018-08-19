(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');
  var Button = app.Button || require('./button.js');

  var MuteButton = jCore.Component.inherits(function(props) {
    this.states = ['mute', 'unmute'];
    this.stateIndex = this.prop(0);
    this.button = new Button({ element: props.element });
  });

  MuteButton.prototype.state = function() {
    return this.states[this.stateIndex()];
  };

  MuteButton.prototype.toggle = function() {
    this.stateIndex((this.stateIndex() + 1) % this.states.length);
  };

  MuteButton.prototype.oninit = function() {
    this.button.on('tap', this.ontap.bind(this));
  };

  MuteButton.prototype.onredraw = function() {
    this.redrawBy('state', function(state) {
      dom.data(this.element(), 'state', state);
    });
  };

  MuteButton.prototype.ontap = function() {
    this.toggle();
    this.emit(this.state());
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MuteButton;
  } else {
    app.MuteButton = MuteButton;
  }
})(this.app || (this.app = {}));
