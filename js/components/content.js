(function(app) {
  'use strict';

  var jCore = require('jcore');

  var Content = jCore.Component.inherits(function() {
    this.panels = [];
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Content;
  } else {
    app.Content = Content;
  }
})(this.app || (this.app = {}));
