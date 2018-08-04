(function(app) {
  'use strict';

  var helper = {};

  helper.remove = function(array, item) {
    var index = array.indexOf(item);
    if (index !== -1) {
      array.splice(index, 1);
    }
  };

  helper.findLast = function(array, callback) {
    for (var i = array.length - 1; i >= 0; i--) {
      if (callback(array[i], i, array)) {
        return array[i];
      }
    }
    return null;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = helper;
  } else {
    app.helper = helper;
  }
})(this.app || (this.app = {}));
