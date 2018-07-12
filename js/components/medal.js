(function(app) {
  'use strict';

  var jCore = require('jcore');

  var Medal = jCore.Component.inherits();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Medal;
  } else {
    app.Medal = Medal;
  }
})(this.app || (this.app = {}));
