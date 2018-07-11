(function(app) {
  'use strict';

  var jCore = require('jcore');

  var Controls = jCore.Component.inherits();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Controls;
  } else {
    app.Controls = Controls;
  }
})(this.app || (this.app = {}));
