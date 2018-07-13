(function(app) {
  'use strict';

  var jCore = require('jcore');

  var Panel = jCore.Component.inherits();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Panel;
  } else {
    app.Panel = Panel;
  }
})(this.app || (this.app = {}));
