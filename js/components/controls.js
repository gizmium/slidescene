(function(app) {
  'use strict';

  var jCore = require('jcore');
  var Medal = app.Medal || require('./medal.js');
  var MuteButton = app.MuteButton || require('./mute-button.js');

  var Controls = jCore.Component.inherits(function() {
    this.medal = new Medal({ element: this.findElement('.medal') });
    this.muteButton = new MuteButton({ element: this.findElement('.mute-button') });
  });

  Controls.prototype.changeMedal = function(name) {
    return this.medal.change(name);
  };

  Controls.prototype.oninit = function() {
    this.muteButton.on('mute', this.emit.bind(this, 'mute'));
    this.muteButton.on('unmute', this.emit.bind(this, 'unmute'));
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Controls;
  } else {
    app.Controls = Controls;
  }
})(this.app || (this.app = {}));
