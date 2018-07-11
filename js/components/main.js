(function(app) {
  'use strict';

  var jCore = require('jcore');
  var Content = app.Content || require('./content.js');
  var Controls = app.Controls || require('./controls.js');

  var Main = jCore.Component.inherits(function() {
    this.content = new Content({ element: this.findElement('.content') });
    this.controls = new Controls({ element: this.findElement('.controls') });
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Main;
  } else {
    app.Main = Main;
  }
})(this.app || (this.app = {}));
