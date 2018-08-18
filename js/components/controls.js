(function(app) {
  'use strict';

  var jCore = require('jcore');
  var Medal = app.Medal || require('./medal.js');

  var Controls = jCore.Component.inherits(function() {
    this.medal = new Medal({ element: this.findElement('.medal') });
  });

  Controls.prototype.changeMedal = function(name) {
    return this.medal.change(name);
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Controls;
  } else {
    app.Controls = Controls;
  }
})(this.app || (this.app = {}));
