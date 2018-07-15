(function(app) {
  'use strict';

  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');

  var Panel = jCore.Component.inherits(function(props) {
    this.height = this.prop(props.height);
  });

  Panel.prototype.onredraw = function() {
    this.redrawBy('height', function(height) {
      dom.css(this.element(), { height: height + 'px' });
    });
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Panel;
  } else {
    app.Panel = Panel;
  }
})(this.app || (this.app = {}));
