(function(app) {
  'use strict';

  var jCore = require('jcore');
  var Panel = app.Panel || require('./panel.js');

  var Content = jCore.Component.inherits(function() {
    this.panels = [];
  });

  Content.prototype.loadPanel = function(props) {
    var panel = new Panel(props);
    panel.parentElement(this.element());
    this.panels.push(panel);
    return panel.load();
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Content;
  } else {
    app.Content = Content;
  }
})(this.app || (this.app = {}));
